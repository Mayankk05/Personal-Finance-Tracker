import { apiHelper } from './api';

const budgetService = {
  // Get budgets with optional month/year filter
  getBudgets: async (month = null, year = null) => {
    try {
      const params = {};
      if (month !== null) params.month = month;
      if (year !== null) params.year = year;
      
      const response = await apiHelper.get('/budgets', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get budget by ID
  getBudget: async (id) => {
    try {
      const response = await apiHelper.get(`/budgets/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create or update budget
  createOrUpdateBudget: async (budgetData) => {
    try {
      const response = await apiHelper.post('/budgets', budgetData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete budget
  deleteBudget: async (id) => {
    try {
      await apiHelper.delete(`/budgets/${id}`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};

export default budgetService;