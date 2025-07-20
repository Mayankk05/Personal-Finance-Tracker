import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import CategoryForm from './CategoryForm';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, INCOME, EXPENSE

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. It may be in use by existing transactions.');
    }
  };

  const handleCategorySuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    loadCategories();
  };

  const filteredCategories = categories.filter(category => {
    if (filter === 'ALL') return true;
    return category.type === filter;
  });

  const groupedCategories = {
    INCOME: filteredCategories.filter(cat => cat.type === 'INCOME'),
    EXPENSE: filteredCategories.filter(cat => cat.type === 'EXPENSE')
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="text-gray-600">Organize your transactions</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddCategory}
        >
          Add Category
        </button>
      </div>

      <div className="page-content">
        <div className="category-filters">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All Categories ({categories.length})
            </button>
            <button
              className={`filter-tab ${filter === 'INCOME' ? 'active' : ''}`}
              onClick={() => setFilter('INCOME')}
            >
              Income ({groupedCategories.INCOME.length})
            </button>
            <button
              className={`filter-tab ${filter === 'EXPENSE' ? 'active' : ''}`}
              onClick={() => setFilter('EXPENSE')}
            >
              Expense ({groupedCategories.EXPENSE.length})
            </button>
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="categories-grid">
            {(filter === 'ALL' ? ['INCOME', 'EXPENSE'] : [filter]).map(type => {
              const categoriesOfType = groupedCategories[type];
              if (categoriesOfType.length === 0 && filter === 'ALL') return null;
              
              return (
                <div key={type} className="category-group">
                  {filter === 'ALL' && (
                    <h3 className="category-group-title">
                      {type === 'INCOME' ? '💰 Income Categories' : '💸 Expense Categories'}
                    </h3>
                  )}
                  
                  <div className="category-cards">
                    {categoriesOfType.map(category => (
                      <div key={category.id} className={`category-card ${category.type.toLowerCase()}`}>
                        <div className="category-header">
                          <div className="category-info">
                            <h4 className="category-name">{category.name}</h4>
                            <span className={`category-type ${category.type.toLowerCase()}`}>
                              {category.type}
                            </span>
                          </div>
                          <div className="category-actions">
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No categories found</p>
            <p className="text-sm text-gray-500">
              {filter === 'ALL' 
                ? 'Start by adding your first category'
                : `No ${filter.toLowerCase()} categories yet`
              }
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={handleAddCategory}
            >
              Add Category
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Category"
      >
        <CategoryForm
          onSuccess={handleCategorySuccess}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Category"
      >
        <CategoryForm
          category={editingCategory}
          onSuccess={handleCategorySuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default CategoryList;