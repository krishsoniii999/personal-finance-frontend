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
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-700 font-medium">Total Income</div>
          <div className="text-2xl font-bold text-green-900">
            ${(totals.income / 100).toFixed(2)}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-700 font-medium">Total Expenses</div>
          <div className="text-2xl font-bold text-red-900">
            ${(totals.expenses / 100).toFixed(2)}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700 font-medium">Balance</div>
          <div className="text-2xl font-bold text-blue-900">
            ${(totals.balance / 100).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No transactions yet. Add your first transaction above!
            </div>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`font-bold text-lg ${
                      txn.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.transaction_type === 'income' ? '+' : '-'}$
                      {(txn.amount / 100).toFixed(2)}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      txn.transaction_type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.transaction_type}
                    </span>
                  </div>
                  {txn.description && (
                    <div className="text-sm text-gray-600 mt-1">{txn.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{txn.date}</div>
                </div>
                <button
                  onClick={() => handleDelete(txn.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300 hover:border-red-400"
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
