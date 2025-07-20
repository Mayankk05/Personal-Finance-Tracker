import { apiHelper } from './api';

const transactionService = {
  // Get all transactions with pagination and filters
  getTransactions: async (params = {}) => {
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 20,
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.type && { type: params.type })
      };
      
      const response = await apiHelper.get('/transactions', queryParams);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get transaction by ID
  getTransaction: async (id) => {
    try {
      const response = await apiHelper.get(`/transactions/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await apiHelper.post('/transactions', transactionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const response = await apiHelper.put(`/transactions/${id}`, transactionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      await apiHelper.delete(`/transactions/${id}`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};

export default transactionService;