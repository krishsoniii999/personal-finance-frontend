'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await apiClient.createTransaction(token, {
        amount: Math.round(parseFloat(amount) * 100),
        description,
        transaction_type: type,
      });

      setAmount('');
      setDescription('');
      setType('expense');
      onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-elegant p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-primary-900 tracking-tight">New Transaction</h3>
        <p className="text-xs text-primary-500 mt-1">Add income or expense</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-primary-600 mb-2 uppercase tracking-wide">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="input-elegant"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-primary-600 mb-2 uppercase tracking-wide">Amount</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-primary-500 text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-elegant pl-8"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-primary-600 mb-2 uppercase tracking-wide">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-elegant"
          placeholder="What was this for?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
