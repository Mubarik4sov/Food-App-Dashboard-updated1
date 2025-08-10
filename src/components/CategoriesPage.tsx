import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  RefreshCw,
  X,
  Save,
  Folder,
  FolderOpen
} from 'lucide-react';
import { apiService, Category } from '../services/api';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'parent' | 'sub'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    longDescription: '',
    coverImage: '',
    isSubCategory: false,
    parentCategoryIds: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCategories();
      console.log('Categories fetched:', response);
      setCategories(response || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  // Filter and search categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'parent') return matchesSearch && !category.isSubCategory;
    if (filterType === 'sub') return matchesSearch && category.isSubCategory;
    return matchesSearch;
  });

  // Get parent categories for display
  const parentCategories = filteredCategories.filter(cat => !cat.isSubCategory);
  const subCategories = filteredCategories.filter(cat => cat.isSubCategory);

  // Get sub-categories for a specific parent
  const getSubCategories = (parentId: string) => {
    return subCategories.filter(sub => 
      sub.parentCategoryIds && sub.parentCategoryIds.includes(parentId)
    );
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    setFormData({
      name: '',
      shortDescription: '',
      longDescription: '',
      coverImage: '',
      isSubCategory: false,
      parentCategoryIds: []
    });
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      shortDescription: category.shortDescription || '',
      longDescription: category.longDescription || '',
      coverImage: category.coverImage || '',
      isSubCategory: category.isSubCategory || false,
      parentCategoryIds: category.parentCategoryIds || []
    });
    setShowEditModal(true);
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory(categoryId);
        await fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await apiService.updateCategory(selectedCategory._id, formData);
      } else {
        await apiService.createCategory(formData);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      await fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category');
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedCategory(null);
  };

  // Statistics
  const totalCategories = categories.length;
  const totalParentCategories = categories.filter(cat => !cat.isSubCategory).length;
  const totalSubCategories = categories.filter(cat => cat.isSubCategory).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            📁 Categories Management
          </h1>
          <p className="text-gray-600 mt-1">Organize your products with categories and subcategories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Categories</p>
              <p className="text-3xl font-bold text-blue-900">{totalCategories}</p>
            </div>
            <Folder className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Parent Categories</p>
              <p className="text-3xl font-bold text-green-900">{totalParentCategories}</p>
            </div>
            <FolderOpen className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Sub Categories</p>
              <p className="text-3xl font-bold text-orange-900">{totalSubCategories}</p>
            </div>
            <Folder className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'parent' | 'sub')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="parent">Parent Only</option>
              <option value="sub">Sub Categories Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600">Showing {filteredCategories.length} of {totalCategories} categories</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No categories match your search criteria.' : 'No categories have been created yet.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-700">
              <div className="col-span-4">CATEGORY NAME</div>
              <div className="col-span-4">DESCRIPTION</div>
              <div className="col-span-2">TYPE</div>
              <div className="col-span-2">ACTIONS</div>
            </div>

            {/* Categories */}
            {parentCategories.map((category) => {
              const subCats = getSubCategories(category._id);
              const isExpanded = expandedCategories.has(category._id);

              return (
                <div key={category._id}>
                  {/* Parent Category Row */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      {subCats.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(category._id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <img
                        src={category.coverImage || '/api/placeholder/48/48'}
                        alt={category.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/48/48';
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {subCats.length > 0 && (
                          <p className="text-xs text-gray-500">{subCats.length} sub-categories</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <p className="text-gray-600 text-sm">{category.shortDescription}</p>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Parent
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub Categories */}
                  {isExpanded && subCats.map((subCategory) => (
                    <div key={subCategory._id} className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-l-4 border-orange-400">
                      <div className="col-span-4 flex items-center gap-3 ml-8">
                        <img
                          src={subCategory.coverImage || '/api/placeholder/40/40'}
                          alt={subCategory.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/40/40';
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{subCategory.name}</h4>
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center">
                        <p className="text-gray-600 text-sm">{subCategory.shortDescription}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          Sub-category
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <button
                          onClick={() => handleViewCategory(subCategory)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCategory(subCategory)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(subCategory._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Standalone Sub Categories (if any) */}
            {filterType === 'sub' && subCategories.filter(sub => 
              !parentCategories.some(parent => 
                sub.parentCategoryIds && sub.parentCategoryIds.includes(parent._id)
              )
            ).map((subCategory) => (
              <div key={subCategory._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <img
                    src={subCategory.coverImage || '/api/placeholder/48/48'}
                    alt={subCategory.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/48/48';
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{subCategory.name}</h3>
                  </div>
                </div>
                <div className="col-span-4 flex items-center">
                  <p className="text-gray-600 text-sm">{subCategory.shortDescription}</p>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    Sub-category
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => handleViewCategory(subCategory)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditCategory(subCategory)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(subCategory._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showEditModal ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Description
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.isSubCategory}
                      onChange={() => setFormData({ ...formData, isSubCategory: false, parentCategoryIds: [] })}
                      className="mr-2"
                    />
                    Parent Category
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.isSubCategory}
                      onChange={() => setFormData({ ...formData, isSubCategory: true })}
                      className="mr-2"
                    />
                    Sub Category
                  </label>
                </div>
              </div>

              {formData.isSubCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Parent Categories *
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {parentCategories.map((parent) => (
                      <label key={parent._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.parentCategoryIds.includes(parent._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                parentCategoryIds: [...formData.parentCategoryIds, parent._id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                parentCategoryIds: formData.parentCategoryIds.filter(id => id !== parent._id)
                              });
                            }
                          }}
                          className="mr-3"
                        />
                        <img
                          src={parent.coverImage || '/api/placeholder/32/32'}
                          alt={parent.name}
                          className="w-8 h-8 rounded object-cover mr-3"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/32/32';
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">{parent.name}</p>
                          <p className="text-xs text-gray-500">{parent.shortDescription}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {formData.isSubCategory && formData.parentCategoryIds.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select at least one parent category</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.isSubCategory && formData.parentCategoryIds.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Category Details</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={selectedCategory.coverImage || '/api/placeholder/200/200'}
                  alt={selectedCategory.name}
                  className="w-32 h-32 rounded-lg object-cover mx-auto mb-4"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/200/200';
                  }}
                />
                <h3 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  selectedCategory.isSubCategory 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedCategory.isSubCategory ? 'Sub Category' : 'Parent Category'}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                <p className="text-gray-600">{selectedCategory.shortDescription || 'No short description provided'}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Long Description</h4>
                <p className="text-gray-600">{selectedCategory.longDescription || 'No long description provided'}</p>
              </div>

              {selectedCategory.isSubCategory && selectedCategory.parentCategoryIds && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Parent Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.parentCategoryIds.map(parentId => {
                      const parent = categories.find(cat => cat._id === parentId);
                      return parent ? (
                        <span key={parentId} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {parent.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditCategory(selectedCategory);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Category
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleDeleteCategory(selectedCategory._id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;