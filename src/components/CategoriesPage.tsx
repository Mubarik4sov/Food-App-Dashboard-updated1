import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  Folder,
  Save,
  ArrowLeft,
  Loader,
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { apiService, Category, CreateUpdateCategoryRequest, UpdateCategoryRequest } from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<"all" | "parent" | "sub">("all");
  const [formData, setFormData] = useState({
    categoryName: "",
    shortDescription: "",
    longDescription: "",
    parentCategoryIds: [] as number[],
    isSubCategory: false,
    coverImage: "",
  });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllCategories();
      
      if (response.errorCode === 0 && response.data) {
        setCategories(response.data);
      } else {
        setError(response.errorMessage || "Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setError(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search and filter type
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.longDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === "all" ||
      (filterType === "parent" && !category.isSubCategory) ||
      (filterType === "sub" && category.isSubCategory);
    
    return matchesSearch && matchesFilter;
  });

  const parentCategories = filteredCategories.filter((cat) => !cat.isSubCategory);
  const totalCategories = categories.length;
  const parentCategoriesCount = categories.filter((cat) => !cat.isSubCategory).length;
  const subCategoriesCount = categories.filter((cat) => cat.isSubCategory).length;

  const getSubCategories = (parentId: number) => {
    return filteredCategories.filter(cat => 
      cat.isSubCategory && cat.parentCategoryIds?.includes(parentId)
    );
  };

  const resetForm = () => {
    setFormData({
      categoryName: "",
      shortDescription: "",
      longDescription: "",
      parentCategoryIds: [],
      isSubCategory: false,
      coverImage: "",
    });
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      categoryName: category.categoryName,
      shortDescription: category.shortDescription,
      longDescription: category.longDescription,
      parentCategoryIds: category.parentCategoryIds || [],
      isSubCategory: category.isSubCategory,
      coverImage: category.coverImage,
    });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const categoryData: CreateUpdateCategoryRequest | UpdateCategoryRequest = {
        ...(editingCategory && { id: editingCategory.id }),
        categoryName: formData.categoryName.trim(),
        shortDescription: formData.shortDescription.trim(),
        longDescription: formData.longDescription.trim(),
        isSubCategory: formData.isSubCategory,
        coverImage: formData.coverImage.trim() || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300",
        parentCategoryIds: formData.isSubCategory ? formData.parentCategoryIds : [],
      };

      let response;
      if (editingCategory) {
        response = await apiService.updateCategory(categoryData as UpdateCategoryRequest);
      } else {
        response = await apiService.createUpdateCategory(categoryData);
      }

      if (response && response.errorCode === 0) {
        await loadCategories();
        setShowAddForm(false);
        resetForm();
        alert(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      } else {
        setError(response?.errorMessage || `Failed to ${editingCategory ? 'update' : 'create'} category`);
      }
    } catch (error) {
      console.error(`Error ${editingCategory ? 'updating' : 'creating'} category:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const closeModal = () => {
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      setError("");
      await apiService.deleteCategory({ categoryId });
      await loadCategories();
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleRefresh = () => {
    loadCategories();
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Categories</span>
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h1>
            <p className="text-gray-600">
              {editingCategory ? 'Update category information' : 'Create a new category for your products'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Category Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => handleInputChange("categoryName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter category name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter short description (max 100 characters)"
                    maxLength={100}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long Description
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) =>
                      handleInputChange("longDescription", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter detailed description of the category"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="isSubCategory"
                      checked={formData.isSubCategory}
                      onChange={(e) =>
                        handleInputChange("isSubCategory", e.target.checked)
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="isSubCategory"
                      className="text-sm font-medium text-gray-700"
                    >
                      This is a sub-category
                    </label>
                  </div>

                  {formData.isSubCategory && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Categories *
                      </label>
                      <select
                        multiple
                        value={formData.parentCategoryIds.map(String)}
                        onChange={(e) => {
                          const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                          handleInputChange("parentCategoryIds", selectedIds);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
                        required={formData.isSubCategory}
                        disabled={isSubmitting}
                      >
                        {categories.filter(cat => !cat.isSubCategory).map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Hold Ctrl/Cmd to select multiple parent categories
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cover Image
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange("coverImage", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter image URL or leave empty for default"
                  disabled={isSubmitting}
                />
                {formData.coverImage && (
                  <div className="mt-3">
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSubmitting ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update Category' : 'Create Category')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                📁 Categories Management
              </h1>
              <p className="text-gray-600">
                Organize your products with categories and subcategories
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {totalCategories}
                </p>
                <p className="text-sm text-blue-700">Total Categories</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {parentCategoriesCount}
                </p>
                <p className="text-sm text-green-700">Parent Categories</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {subCategoriesCount}
                </p>
                <p className="text-sm text-orange-700">Sub Categories</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search categories by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | "parent" | "sub")}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                <option value="parent">Parent Only</option>
                <option value="sub">Sub Categories Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Loading Categories</h3>
            <p className="text-gray-600">Please wait while we fetch your categories...</p>
          </div>
        )}

        {/* Categories List View */}
        {!loading && categories.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Categories Hierarchy</h3>
                <p className="text-sm text-gray-600">
                  Showing {filteredCategories.length} of {categories.length} categories
                </p>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {parentCategories.map((parentCategory) => {
                const subCategories = getSubCategories(parentCategory.id);
                const isExpanded = expandedCategories.has(parentCategory.id);
                
                return (
                  <div key={parentCategory.id} className="hover:bg-gray-50 transition-colors">
                    {/* Parent Category */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {subCategories.length > 0 && (
                            <button
                              onClick={() => toggleCategoryExpansion(parentCategory.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          )}
                          
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            {parentCategory.coverImage ? (
                              <img
                                src={parentCategory.coverImage}
                                alt={parentCategory.categoryName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <ImageIcon className="w-6 h-6 text-gray-400 hidden" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-800 truncate">
                                {parentCategory.categoryName}
                              </h4>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">
                                Parent Category
                              </span>
                              {subCategories.length > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">
                                  {subCategories.length} sub-categories
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1 line-clamp-2">
                              {parentCategory.shortDescription}
                            </p>
                            {parentCategory.longDescription && (
                              <p className="text-gray-500 text-xs line-clamp-1">
                                {parentCategory.longDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleViewCategory(parentCategory)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditCategory(parentCategory)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(parentCategory.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sub Categories */}
                    {isExpanded && subCategories.length > 0 && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        {subCategories.map((subCategory) => (
                          <div key={subCategory.id} className="p-4 ml-16 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                                  {subCategory.coverImage ? (
                                    <img
                                      src={subCategory.coverImage}
                                      alt={subCategory.categoryName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <ImageIcon className="w-4 h-4 text-gray-400 hidden" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-medium text-gray-800 truncate">
                                      {subCategory.categoryName}
                                    </h5>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full whitespace-nowrap">
                                      Sub-category
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm line-clamp-1">
                                    {subCategory.shortDescription}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleViewCategory(subCategory)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditCategory(subCategory)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit Category"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCategory(subCategory.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first category to organize your products.
            </p>
            <button
              onClick={handleAddCategory}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Category</span>
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && categories.length > 0 && filteredCategories.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Categories Match Your Search</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img
                src={selectedCategory.coverImage || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800"}
                alt={selectedCategory.categoryName}
                className="w-full h-64 object-cover rounded-t-2xl"
                onError={(e) => {
                  e.currentTarget.src = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800";
                }}
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategory.isSubCategory
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedCategory.isSubCategory
                    ? "Sub Category"
                    : "Parent Category"}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Category Info */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCategory.categoryName}
                </h2>
                <p className="text-gray-600 mb-4">{selectedCategory.shortDescription}</p>
                {selectedCategory.longDescription && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedCategory.longDescription}</p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Category Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Created Date:</span>
                    <p className="font-medium">
                      {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <p className="font-medium">
                      {selectedCategory.isSubCategory ? "Sub Category" : "Parent Category"}
                    </p>
                  </div>
                  {selectedCategory.isSubCategory && selectedCategory.parentCategoryIds && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">Parent Categories:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedCategory.parentCategoryIds.map(parentId => {
                          const parent = categories.find(cat => cat.id === parentId);
                          return parent ? (
                            <span key={parentId} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {parent.categoryName}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    closeModal();
                    handleEditCategory(selectedCategory);
                  }}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Edit Category
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}