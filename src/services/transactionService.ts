import {
  ITransactionService,
  ServiceError,
  UpdateTransactionStageInput
} from '../types/api';
import { TransactionRecord, TransactionStage } from '../types/property';
import { mockStorage } from '../mocks/mockStorage';

const VALID_STAGES: TransactionStage[] = [
  'Enquiry',
  'Contacted',
  'Viewing',
  'Negotiation',
  'Offer',
  'Closed'
];

/**
 * Transaction CRM Service
 *
 * Financial Integrity Note:
 * All commission percentages and platform revenue figures stored or calculated on the client
 * are strictly display-only estimates. The future backend must calculate and validate
 * authoritative financial values.
 */
class TransactionService implements ITransactionService {
  public async getTransactions(): Promise<TransactionRecord[]> {
    return mockStorage.getTransactions();
  }

  public async updateTransactionStage(
    input: UpdateTransactionStageInput
  ): Promise<TransactionRecord> {
    if (!VALID_STAGES.includes(input.stage)) {
      throw new ServiceError(`Invalid transaction stage: ${input.stage}`, 'VALIDATION_ERROR', 400);
    }

    const existing = mockStorage.getTransactions();
    const index = existing.findIndex(t => t.id === input.transactionId);
    if (index === -1) {
      throw new ServiceError(
        `Transaction record "${input.transactionId}" not found.`,
        'NOT_FOUND',
        404
      );
    }

    const current = existing[index];
    const isClosing = input.stage === 'Closed';

    // Keep display-only platformRevenue synchronized with agreedCommissionPercent
    const displayRevenue = Math.round(
      (current.transactionValue * current.agreedCommissionPercent) / 100
    );

    const updatedTx: TransactionRecord = {
      ...current,
      stage: input.stage,
      platformRevenue: current.platformRevenue || displayRevenue,
      dateClosed: isClosing ? new Date().toISOString().split('T')[0] : current.dateClosed,
      paymentStatus: isClosing ? 'Received' : current.paymentStatus
    };

    const nextList = [...existing];
    nextList[index] = updatedTx;
    mockStorage.setTransactions(nextList);

    return updatedTx;
  }
}

export const transactionService: ITransactionService = new TransactionService();
