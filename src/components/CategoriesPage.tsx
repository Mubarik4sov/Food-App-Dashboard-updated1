import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  Folder,
  Image,
  Upload,
  X,
  Save,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { apiService, Category, CreateUpdateCategoryRequest } from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setError(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentCategories = categories.filter((cat) => !cat.isSubCategory);
  const totalCategories = categories.length;
  const parentCategoriesCount = parentCategories.length;
  const subCategoriesCount = categories.filter((cat) => cat.isSubCategory).length;

  const handleAddCategory = () => {
    setShowAddForm(true);
    setFormData({
      categoryName: "",
      shortDescription: "",
      longDescription: "",
      parentCategoryIds: [],
      isSubCategory: false,
      coverImage: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    console.log("Submitting category data:", formData);

    try {
      const categoryData: CreateUpdateCategoryRequest = {
        categoryName: formData.categoryName,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        isSubCategory: formData.isSubCategory,
        coverImage: formData.coverImage || "/default-category.jpg",
        parentCategoryIds: formData.isSubCategory ? formData.parentCategoryIds : [],
      };

      console.log("Sending to API:", categoryData);

      const response = await apiService.createUpdateCategory(categoryData);

      console.log("API Response:", response);

      if (response && response.errorCode === 0) {
        await loadCategories(); // Reload categories
        setShowAddForm(false);
        setFormData({
          categoryName: "",
          shortDescription: "",
          longDescription: "",
          parentCategoryIds: [],
          isSubCategory: false,
          coverImage: "",
        });
        // Show success message
        alert("Category created successfully!");
      } else if (response) {
        setError(response.errorMessage || "Failed to create category");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create category");
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
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setError("");
      await apiService.deleteCategory({ categoryId });
      await loadCategories(); // Reload categories
      alert("Category deleted successfully!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete category");
    }
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
                onClick={() => setShowAddForm(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Categories</span>
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Add New Category
            </h1>
            <p className="text-gray-600">
              Create a new category for your products
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={formData.isSubCategory}
                        disabled={isSubmitting}
                      >
                        {parentCategories.map((category) => (
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
                <span>{isSubmitting ? "Creating..." : "Create Category"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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
            <button
              onClick={handleAddCategory}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
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

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
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

        {/* Categories Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={category.coverImage || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300"}
                    alt={category.categoryName}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isSubCategory
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {category.isSubCategory ? "Sub Category" : "Parent Category"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {category.categoryName}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {category.isSubCategory ? (
                        <FolderOpen className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Folder className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.shortDescription}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewCategory(category)}
                      className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1">
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No categories match your search criteria." : "Get started by creating your first category."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddCategory}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Add Your First Category
              </button>
            )}
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
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