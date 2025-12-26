'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export default function TransactionList({ refresh }: { refresh: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [refresh]);

  const loadTransactions = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const data = await apiClient.getTransactions(token);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await apiClient.deleteTransaction(token, id);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    return { income, expenses, balance };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-primary-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elegant p-5">
          <div className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-2">Total Income</div>
          <div className="text-2xl font-semibold text-primary-900">
            ${(totals.income / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card-elegant p-5">
          <div className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-2">Total Expenses</div>
          <div className="text-2xl font-semibold text-primary-900">
            ${(totals.expenses / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card-elegant p-5">
          <div className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-2">Balance</div>
          <div className={`text-2xl font-semibold ${totals.balance >= 0 ? 'text-primary-900' : 'text-danger'}`}>
            ${(totals.balance / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="card-elegant overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100">
          <h3 className="text-lg font-semibold text-primary-900 tracking-tight">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-primary-100">
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-primary-500">No transactions yet</p>
              <p className="text-xs text-primary-400 mt-1">Add your first transaction to get started</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="px-6 py-4 flex justify-between items-center hover:bg-primary-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`text-lg font-semibold tabular-nums ${
                      txn.transaction_type === 'income' ? 'text-success' : 'text-primary-900'
                    }`}>
                      {txn.transaction_type === 'income' ? '+' : '−'}${(txn.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      txn.transaction_type === 'income'
                        ? 'bg-success-light text-success-dark'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                      {txn.transaction_type}
                    </span>
                  </div>
                  {txn.description && (
                    <div className="text-sm text-primary-600 truncate">{txn.description}</div>
                  )}
                  <div className="text-xs text-primary-400 mt-0.5">{txn.date}</div>
                </div>
                <button
                  onClick={() => handleDelete(txn.id)}
                  className="ml-4 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-danger hover:bg-danger-light rounded-lg border border-primary-200 hover:border-danger/20 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
