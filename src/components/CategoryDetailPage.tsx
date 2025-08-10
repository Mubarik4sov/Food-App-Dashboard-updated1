import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Calendar, Tag } from 'lucide-react';
import { apiService, Category } from '../services/api';

// Mock products data - replace with actual API call
const mockProducts = [
  {
    id: 1,
    name: 'Italian Spicy Pizza',
    price: 45,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.5,
    inStock: true
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    price: 35,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.2,
    inStock: true
  },
  {
    id: 3,
    name: 'Pepperoni Pizza',
    price: 40,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 4.7,
    inStock: false
  }
];

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products] = useState(mockProducts);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (id) {
      fetchCategoryDetails(id);
    } else {
      setError('No category ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchCategoryDetails = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching category details for ID:', categoryId);
      
      // Try to fetch all categories first
      const response = await apiService.getAllCategories();
      console.log('Full API Response:', response);
      
      // Handle different response structures
      let categories: Category[] = [];
      
      if (response && Array.isArray(response)) {
        categories = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        categories = response.data;
      } else if (response && response.errorCode === 0 && response.data) {
        categories = Array.isArray(response.data) ? response.data : [response.data];
      } else {
        console.error('Unexpected API response structure:', response);
        setError('Failed to load categories - unexpected response format');
        return;
      }
      
      console.log('Processed categories:', categories);
      
      if (categories.length === 0) {
        setError('No categories found');
        return;
      }
      
      // Find the category by ID (try different ID fields)
      const foundCategory = categories.find(cat => {
        const catId = cat.id || cat._id;
        return catId && (catId.toString() === categoryId || catId === parseInt(categoryId));
      });
      
      console.log('Found category:', foundCategory);
      
      if (foundCategory) {
        setCategory(foundCategory);
        
        // If it's a parent category, find its sub-categories
        if (!foundCategory.isSubCategory) {
          const foundCategoryId = foundCategory.id || foundCategory._id;
          const subCats = categories.filter(cat => {
            if (!cat.isSubCategory || !cat.parentCategoryIds) return false;
            
            return cat.parentCategoryIds.some(parentId => 
              parentId === foundCategoryId || 
              parentId.toString() === foundCategoryId?.toString()
            );
          });
          
          console.log('Found sub-categories:', subCats);
          setSubCategories(subCats);
        }
      } else {
        setError(`Category with ID ${categoryId} not found`);
      }
      
    } catch (err) {
      console.error('Error fetching category details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load category details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/categories');
  };

  const handleEdit = (category: Category) => {
    // Navigate back to categories page with edit mode
    navigate('/categories', { state: { editCategory: category } });
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory({ categoryId: categoryId });
        navigate('/categories');
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-600">Loading category details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested category could not be found.'}</p>
            <button
              onClick={handleBack}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get category name (handle different property names)
  const categoryName = category.categoryName || category.name || 'Unnamed Category';
  const categoryId = category.id || category._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-gray-100 to-gray-200">
          <img
            src={category.coverImage || 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={categoryName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 hidden flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-white opacity-50" />
          </div>
          
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg p-2 transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700 font-medium">Back</span>
          </button>

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              category.isSubCategory
                ? "bg-orange-100 text-orange-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {category.isSubCategory ? "Sub Category" : "Parent Category"}
            </span>
          </div>
        </div>

        {/* Category Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {categoryName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {category.shortDescription || 'No description available'}
              </p>
              {category.longDescription && (
                <p className="text-gray-700 leading-relaxed">
                  {category.longDescription}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-6">
              <button
                onClick={() => handleEdit(category)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(categoryId)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Category Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Created Date</span>
              </div>
              <span className="text-gray-600">
                {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Recently created'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Category Type</span>
              </div>
              <span className="text-gray-600">
                {category.isSubCategory ? "Sub Category" : "Parent Category"}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Products</span>
              </div>
              <span className="text-gray-600">{products.length} items</span>
            </div>
          </div>

          {/* Parent Categories (for sub-categories) */}
          {category.isSubCategory && category.parentCategoryIds && category.parentCategoryIds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Parent Categories</h3>
              <div className="flex flex-wrap gap-2">
                {category.parentCategoryIds.map((parentId, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Parent Category #{parentId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Categories Section (for parent categories) */}
      {!category.isSubCategory && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <FolderOpen className="w-6 h-6 text-gray-600" />
              <span>Sub Categories</span>
            </h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {subCategories.length} items
            </span>
          </div>

          {subCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subCategories.map((subCategory) => {
                const subCategoryId = subCategory.id || subCategory._id;
                const subCategoryName = subCategory.categoryName || subCategory.name;
                
                return (
                  <div key={subCategoryId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={subCategory.coverImage || 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300'}
                        alt={subCategoryName}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{subCategoryName}</h4>
                        <p className="text-sm text-gray-600">{subCategory.shortDescription || 'No description'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No sub-categories found</p>
              <p className="text-sm text-gray-500">Sub-categories will appear here when created</p>
            </div>
          )}
        </div>
      )}

      {/* Products Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Package className="w-6 h-6 text-gray-600" />
            <span>Products in this Category</span>
          </h2>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {products.length} items
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 line-clamp-2">{product.name}</h4>
                    <span className="text-lg font-bold text-red-600">${product.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No products found in this category</p>
            <p className="text-sm text-gray-500">Products will appear here when added to this category</p>
          </div>
        )}
      </div>
    </div>
  );
}