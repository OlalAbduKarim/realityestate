import {
  ITransactionService,
  ServiceError,
  UpdateTransactionStageInput
} from '../types/api';
import {
  PaymentStatus,
  TransactionRecord,
  TransactionStage,
  TransactionType
} from '../types/property';
import { getRequiredSupabaseClient } from '../lib/supabase';

const TRANSACTION_RELATIONAL_SELECT =
  '*, property:properties(id, title, location, slug), customer:profiles!transactions_customer_id_fkey(id, name), agent:profiles!transactions_agent_id_fkey(id, name)';

function mapTransactionError(err: unknown, fallbackMessage: string): ServiceError {
  if (err instanceof ServiceError) return err;

  const rawMsg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : err instanceof Error
      ? err.message
      : '';
  const lower = rawMsg.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return new ServiceError(
      'Reality Estates could not connect to the server. Please check your internet connection and try again.',
      'NETWORK_ERROR',
      503
    );
  }

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return new ServiceError(
      'You do not have permission to modify transaction records.',
      'FORBIDDEN',
      403
    );
  }

  return new ServiceError(fallbackMessage, 'UNKNOWN_ERROR', 500);
}

function mapRowToTransactionRecord(row: Record<string, unknown>): TransactionRecord {
  const prop =
    row.property && typeof row.property === 'object' && !Array.isArray(row.property)
      ? (row.property as Record<string, unknown>)
      : null;

  const customer =
    row.customer && typeof row.customer === 'object' && !Array.isArray(row.customer)
      ? (row.customer as Record<string, unknown>)
      : null;

  const agent =
    row.agent && typeof row.agent === 'object' && !Array.isArray(row.agent)
      ? (row.agent as Record<string, unknown>)
      : null;

  return {
    id: String(row.id || ''),
    propertyId: String(row.property_id || ''),
    propertyTitle: String(prop?.title || 'Property Transaction'),
    customerName: String(customer?.name || 'Registered Client'),
    agentName: String(agent?.name || 'Assigned Representative'),
    transactionType: ((row.transaction_type as TransactionType) ||
      'buy') as TransactionType,
    transactionValue: Number(row.transaction_value ?? 0),
    agreedCommissionPercent: Number(row.agreed_commission_percent ?? 0),
    platformRevenue: Number(row.platform_revenue ?? 0),
    stage: ((row.stage as TransactionStage) || 'Enquiry') as TransactionStage,
    paymentStatus: ((row.payment_status as PaymentStatus) ||
      'Pending') as PaymentStatus,
    dateInitiated: String(
      row.date_initiated || row.created_at || new Date().toISOString()
    ).split('T')[0],
    dateClosed: row.date_closed
      ? String(row.date_closed).split('T')[0]
      : undefined
  };
}

class TransactionService implements ITransactionService {
  /**
   * Retrieves transaction pipeline records from `public.transactions` according to
   * PostgreSQL Row-Level Security (RLS).
   */
  public async getTransactions(): Promise<TransactionRecord[]> {
    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();

    if (!sessionData.session?.user) {
      return [];
    }

    try {
      const { data, error } = await client
        .from('transactions')
        .select(TRANSACTION_RELATIONAL_SELECT)
        .order('created_at', { ascending: false });

      if (error) {
        throw mapTransactionError(
          error,
          'Unable to load transaction records. Please refresh the page.'
        );
      }

      return ((data || []) as Record<string, unknown>[]).map(
        mapRowToTransactionRecord
      );
    } catch (err) {
      throw mapTransactionError(
        err,
        'Unable to load transaction records. Please refresh the page.'
      );
    }
  }

  /**
   * Updates the stage of a transaction in `public.transactions`.
   * Commission and revenue calculations remain database/server-controlled.
   */
  public async updateTransactionStage(
    input: UpdateTransactionStageInput
  ): Promise<TransactionRecord> {
    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();

    if (!sessionData.session?.user) {
      throw new ServiceError(
        'Create an account or sign in to continue.',
        'UNAUTHORIZED',
        401
      );
    }

    try {
      const updatePayload: Record<string, unknown> = {
        stage: input.stage
      };
      if (input.paymentStatus) {
        updatePayload.payment_status = input.paymentStatus;
      }
      if (input.stage === 'Closed') {
        updatePayload.date_closed = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await client
        .from('transactions')
        .update(updatePayload)
        .eq('id', input.transactionId)
        .select(TRANSACTION_RELATIONAL_SELECT)
        .single();

      if (error || !data) {
        throw mapTransactionError(
          error,
          'Unable to update transaction stage. Please try again.'
        );
      }

      return mapRowToTransactionRecord(data as Record<string, unknown>);
    } catch (err) {
      throw mapTransactionError(
        err,
        'Unable to update transaction stage. Please try again.'
      );
    }
  }
}

export const transactionService = new TransactionService();
