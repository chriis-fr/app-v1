import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Account {
  id: string;
  name: string;
  code: string;
  type: string;
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: string;
  lines: {
    id: string;
    accountId: string;
    description: string;
    debit: number;
    credit: number;
    account: Account;
  }[];
}

export interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Fetch accounts
async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch('/api/accounting/accounts');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return response.json();
}

// Create account
async function createAccount(data: {
  code: string;
  name: string;
  type: string;
  parentId?: string;
  description?: string;
}): Promise<Account> {
  const response = await fetch('/api/accounting/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create account');
  }
  return response.json();
}

// Fetch journal entries
async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const response = await fetch('/api/accounting/journal-entries');
  if (!response.ok) {
    throw new Error('Failed to fetch journal entries');
  }
  return response.json();
}

// Create journal entry
async function createJournalEntry(data: {
  date: string;
  reference: string;
  description: string;
  lines: {
    accountId: string;
    description: string;
    debit?: number;
    credit?: number;
  }[];
}): Promise<JournalEntry> {
  const response = await fetch('/api/accounting/journal-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create journal entry');
  }
  return response.json();
}

// Fetch financial periods
async function fetchFinancialPeriods(): Promise<FinancialPeriod[]> {
  const response = await fetch('/api/accounting/periods');
  if (!response.ok) {
    throw new Error('Failed to fetch financial periods');
  }
  return response.json();
}

// Create financial period
async function createFinancialPeriod(data: {
  name: string;
  startDate: string;
  endDate: string;
}): Promise<FinancialPeriod> {
  const response = await fetch('/api/accounting/periods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create financial period');
  }
  return response.json();
}

export function useAccounting() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Accounts
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    error: accountsError,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account created successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to create account');
    },
  });

  // Journal Entries
  const {
    data: journalEntries,
    isLoading: isLoadingJournalEntries,
    error: journalEntriesError,
  } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: fetchJournalEntries,
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      toast.success('Journal entry created successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to create journal entry');
    },
  });

  // Financial Periods
  const {
    data: financialPeriods,
    isLoading: isLoadingFinancialPeriods,
    error: financialPeriodsError,
  } = useQuery({
    queryKey: ['financialPeriods'],
    queryFn: fetchFinancialPeriods,
  });

  const createFinancialPeriodMutation = useMutation({
    mutationFn: createFinancialPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialPeriods'] });
      toast.success('Financial period created successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to create financial period');
    },
  });

  return {
    // Accounts
    accounts,
    isLoadingAccounts,
    accountsError,
    createAccount: createAccountMutation.mutate,
    isCreatingAccount: createAccountMutation.isPending,

    // Journal Entries
    journalEntries,
    isLoadingJournalEntries,
    journalEntriesError,
    createJournalEntry: createJournalEntryMutation.mutate,
    isCreatingJournalEntry: createJournalEntryMutation.isPending,

    // Financial Periods
    financialPeriods,
    isLoadingFinancialPeriods,
    financialPeriodsError,
    createFinancialPeriod: createFinancialPeriodMutation.mutate,
    isCreatingFinancialPeriod: createFinancialPeriodMutation.isPending,

    // General
    error,
    setError,
  };
} 