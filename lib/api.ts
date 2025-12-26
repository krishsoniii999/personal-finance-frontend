const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  async signup(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async logout(token: string) {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getTransactions(token: string) {
    const res = await fetch(`${API_URL}/api/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async createTransaction(token: string, transaction: {
    amount: number;
    description?: string;
    transaction_type: 'income' | 'expense';
    date?: string;
  }) {
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transaction)
    });
    return res.json();
  },

  async deleteTransaction(token: string, id: string) {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
