import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/formatters';
import { 
  Calculator, 
  CreditCard, 
  CheckCircle2, 
  Send, 
  Info
} from 'lucide-react';

export const FinancingView: React.FC = () => {
  const { currentUser, openAuthModal, submitFinancingEnquiry } = useApp();

  // Mortgage Calculator State
  const [propertyPrice, setPropertyPrice] = useState<number>(650000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(16.0); // Typical UGX commercial mortgage rate
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Mortgage calculation logic
  const loanAmount = useMemo(() => {
    return Math.max(0, propertyPrice * (1 - downPaymentPercent / 100));
  }, [propertyPrice, downPaymentPercent]);

  const monthlyRepayment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfMonths = tenureYears * 12;
    if (monthlyRate === 0) return loanAmount / numberOfMonths;
    const factor = Math.pow(1 + monthlyRate, numberOfMonths);
    return Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
  }, [loanAmount, interestRate, tenureYears]);

  // Enquiry Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+256 7');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [employmentStatus, setEmploymentStatus] = useState<'Employed' | 'Self-Employed' | 'Diaspora' | 'Business Owner'>('Employed');
  const [preferredBank, setPreferredBank] = useState('Stanbic Bank Uganda');
  const [submitted, setSubmitted] = useState(false);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('Create a free account to submit your financing pre-qualification enquiry.');
      return;
    }

    submitFinancingEnquiry({
      customerName: name.trim() || currentUser.name,
      customerPhone: phone.trim() || currentUser.phone,
      customerEmail: email.trim() || currentUser.email,
      employmentStatus,
      loanAmountUGX: loanAmount,
      preferredBank,
      tenureYears
    });

    setSubmitted(true);
  };

  const PARTNER_BANKS = [
    {
      name: 'Stanbic Bank Uganda',
      focus: 'Home loans, construction mortgages & diaspora mortgages',
      rates: 'From 15.5% UGX / 8.0% USD',
      features: 'Up to 25-year tenure · Up to 85% financing'
    },
    {
      name: 'Absa Bank Uganda',
      focus: 'Residential mortgages, equity release & plot purchase',
      rates: 'Competitive market rates',
      features: 'Fast-track pre-approvals · Expert wealth advisory'
    },
    {
      name: 'Housing Finance Bank',
      focus: 'National housing specialist & title-backed mortgages',
      rates: 'Tailored tenure programs',
      features: 'Government & private sector scheme partnerships'
    },
    {
      name: 'Centenary Bank',
      focus: 'Centemortgage for suburban and rural properties',
      rates: 'Accessible terms',
      features: 'Flexible installment plans for income earners'
    },
    {
      name: 'DFCU Bank',
      focus: 'Commercial property financing & residential mortgages',
      rates: 'Corporate and personal',
      features: 'High loan limits for commercial towers & warehouses'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 transition-colors">
      
      {/* Hero Banner */}
      <div className="bg-radial from-stone-100 via-stone-50 to-white dark:from-stone-900 dark:via-stone-950 dark:to-stone-950 rounded-3xl p-8 sm:p-12 border border-stone-200/80 dark:border-stone-800 text-center space-y-4 max-w-4xl mx-auto transition-colors">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-2xs">
          <CreditCard className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100" />
          <span>Financing Linkage Hub</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
          Property Financing & Mortgages in Uganda
        </h1>
        
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Reality Estates connects buyers with leading commercial financial institutions across Uganda. Calculate your monthly installments and explore mortgage eligibility.
        </p>
      </div>

      {/* Calculator & Pre-Qualification Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Mortgage Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-stone-900 dark:text-stone-100" />
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Mortgage Repayment Calculator
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase">
              UGX Currency
            </span>
          </div>

          <div className="space-y-5">
            {/* Property Price Slider / Input */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                <span>Property Purchase Price</span>
                <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">{formatUGX(propertyPrice)}</span>
              </div>
              <input
                type="range"
                min={50000000}
                max={2500000000}
                step={25000000}
                value={propertyPrice}
                onChange={e => setPropertyPrice(Number(e.target.value))}
                className="w-full accent-stone-900 dark:accent-stone-100 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                <span>UGX 50M</span>
                <span>UGX 1.25B</span>
                <span>UGX 2.5B</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                <span>Down Payment ({downPaymentPercent}%)</span>
                <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">
                  {formatUGX(propertyPrice * (downPaymentPercent / 100))}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={e => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-stone-900 dark:accent-stone-100 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                <span>10% Minimum</span>
                <span>20% Typical</span>
                <span>50%</span>
              </div>
            </div>

            {/* Interest Rate & Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Annual Interest Rate (% p.a.)
                </label>
                <select
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                >
                  <option value={15.0}>15.0% (Prime Corporate Rate)</option>
                  <option value={16.0}>16.0% (Standard UGX Rate)</option>
                  <option value={17.5}>17.5% (Variable Tier)</option>
                  <option value={8.5}>8.5% (USD Denominated Loan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Loan Tenure (Years)
                </label>
                <select
                  value={tenureYears}
                  onChange={e => setTenureYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                >
                  <option value={10}>10 Years (120 Months)</option>
                  <option value={15}>15 Years (180 Months)</option>
                  <option value={20}>20 Years (240 Months)</option>
                  <option value={25}>25 Years (300 Months)</option>
                </select>
              </div>
            </div>

            {/* Calculated Results Box */}
            <div className="p-5 rounded-xl bg-stone-900 dark:bg-stone-950 text-white space-y-3 border border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 block uppercase tracking-wider">
                    Estimated Monthly Installment
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-white block mt-0.5">
                    {formatUGX(monthlyRepayment)} <span className="text-xs font-normal text-stone-400">/ month</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-400 block">Total Borrowed</span>
                  <span className="text-sm font-semibold tabular-nums text-stone-200">
                    {formatUGX(loanAmount, true)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Pre-Qualification Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-5 transition-colors">
          <div className="text-left pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Free Pre-Qualification
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Inquire with Partner Institutions
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Forward your profile to mortgage desks at Ugandan banks.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-900 dark:text-white">Pre-Qualification Submitted</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-xs mx-auto">
                Your request has been routed to the mortgage representative at <strong className="text-stone-800 dark:text-stone-100">{preferredBank}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="py-2 px-4 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ronald Kato"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Mobile Phone (Uganda / International)</label>
                <input
                  type="tel"
                  required
                  placeholder="+256 772 000 000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Employment Category</label>
                <select
                  value={employmentStatus}
                  onChange={e => setEmploymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                >
                  <option value="Employed">Formally Employed (Uganda Paye)</option>
                  <option value="Self-Employed">Self-Employed / Professional</option>
                  <option value="Diaspora">Ugandan Diaspora (UK, US, Canada, Gulf, EU)</option>
                  <option value="Business Owner">Registered Company Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Preferred Financial Institution</label>
                <select
                  value={preferredBank}
                  onChange={e => setPreferredBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                >
                  {PARTNER_BANKS.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Pre-Qualification Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Partner Banks Overview */}
      <div className="space-y-6">
        <div className="text-left">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Institutional Network
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1">
            Partner Mortgage Providers in Uganda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNER_BANKS.map(bank => (
            <div key={bank.name} className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs space-y-2 transition-colors">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">{bank.name}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300">{bank.focus}</p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                <p><strong className="text-stone-700 dark:text-stone-200">Rates:</strong> {bank.rates}</p>
                <p><strong className="text-stone-700 dark:text-stone-200">Terms:</strong> {bank.features}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory & Institutional boundary Notice */}
      <div className="p-5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 leading-relaxed flex items-start gap-3 transition-colors">
        <Info className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-stone-700 dark:text-stone-300">Important Financing Notice:</strong> Reality Estates is a real-estate discovery marketplace and does not operate as a financial institution, credit broker, or mortgage lender. All interest rates, loan terms, and mortgage approvals are determined solely by the respective financial institutions in accordance with Bank of Uganda regulations.
        </p>
      </div>

    </div>
  );
};
