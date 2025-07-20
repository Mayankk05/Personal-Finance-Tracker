import { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryForm = ({ category = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        name: formData.name.trim(),
        type: formData.type
      };

      if (isEditing) {
        await categoryService.updateCategory(category.id, submitData);
      } else {
        await categoryService.createCategory(submitData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save category. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="error-message mb-4">
          {errors.submit}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="name">
          Category Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className={`form-input ${errors.name ? 'error' : ''}`}
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter category name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <div className="form-error">{errors.name}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="type">
          Category Type
        </label>
        <select
          id="type"
          name="type"
          className="form-select"
          value={formData.type}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="EXPENSE">💸 Expense</option>
          <option value="INCOME">💰 Income</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {formData.type === 'EXPENSE' 
            ? 'For money going out (bills, food, entertainment, etc.)'
            : 'For money coming in (salary, freelance, investments, etc.)'
          }
        </p>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="small" />
              <span style={{ marginLeft: '8px' }}>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            </>
          ) : (
            isEditing ? 'Update Category' : 'Add Category'
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;