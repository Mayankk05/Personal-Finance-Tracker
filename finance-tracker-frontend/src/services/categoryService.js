import { apiHelper } from './api';
 const categoryService = {
  // Get all categories
  getCategories: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await apiHelper.get('/categories', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get category by ID
  getCategory: async (id) => {
    try {
      const response = await apiHelper.get(`/categories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await apiHelper.post('/categories', categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiHelper.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      await apiHelper.delete(`/categories/${id}`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};

export default categoryService;