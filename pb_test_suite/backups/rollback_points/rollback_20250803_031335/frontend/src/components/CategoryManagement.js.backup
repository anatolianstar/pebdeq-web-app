import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    background_image_url: '',
    background_color: '#667eea',
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    products_per_page: 12,
    default_sort: 'newest',
    show_filters: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('api/admin/categories'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...newCategory,
        slug: newCategory.slug || generateSlug(newCategory.name)
      };

      const response = await fetch(createApiUrl('api/admin/categories'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        toast.success('Category created successfully');
        setNewCategory({
          name: '',
          slug: '',
          description: '',
          image_url: '',
          background_image_url: '',
          background_color: '#667eea',
          is_active: true,
          is_featured: false,
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          products_per_page: 12,
          default_sort: 'newest',
          show_filters: true,
          sort_order: 0
        });
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...editingCategory,
        slug: editingCategory.slug || generateSlug(editingCategory.name)
      };

      const response = await fetch(createApiUrl('api/admin/categories/${editingCategory.id}'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        fetchCategories();
        setEditingCategory(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error updating category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(createApiUrl('api/admin/categories/${categoryId}'), {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          toast.success('Category deleted successfully');
          fetchCategories();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error deleting category');
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCategories.length === 0) {
      toast.error('Please select categories first');
      return;
    }

    try {
      const response = await fetch(createApiUrl('api/admin/categories/bulk-operations'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: action,
          category_ids: selectedCategories
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchCategories();
        setSelectedCategories([]);
        setShowBulkActions(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Bulk operation failed');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Error performing bulk action');
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  };

  const handleImageUpload = async (file, uploadType = 'image') => {
    try {
      const uploadState = uploadType === 'image' ? setUploadingImage : setUploadingBackground;
      uploadState(true);

      const formData = new FormData();
      formData.append('file', file);

      const endpoint = uploadType === 'image' ? 
        createApiUrl('api/admin/upload/category-image') : 
        createApiUrl('api/admin/upload/category-background');

      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      console.log('Upload endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const urlKey = uploadType === 'image' ? 'image_url' : 'background_image_url';
        
        setNewCategory(prev => ({
          ...prev,
          [urlKey]: data.url
        }));
        
        toast.success(`Category ${uploadType} uploaded successfully`);
      } else {
        console.error('Upload failed:', response.status, response.statusText);
        try {
          const error = await response.json();
          toast.error(error.error || `Failed to upload ${uploadType}`);
        } catch (jsonError) {
          console.error('Could not parse error response as JSON:', jsonError);
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          toast.error(`Failed to upload ${uploadType}: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error(`Error uploading ${uploadType}:`, error);
      toast.error(`Error uploading ${uploadType}`);
    } finally {
      const uploadState = uploadType === 'image' ? setUploadingImage : setUploadingBackground;
      uploadState(false);
    }
  };

  const handleEditImageUpload = async (file, uploadType = 'image') => {
    try {
      const uploadState = uploadType === 'image' ? setUploadingImage : setUploadingBackground;
      uploadState(true);

      const formData = new FormData();
      formData.append('file', file);

      const endpoint = uploadType === 'image' ? 
        createApiUrl('api/admin/upload/category-image') : 
        createApiUrl('api/admin/upload/category-background');

      const token = localStorage.getItem('token');
      console.log('Edit Token available:', !!token);
      console.log('Edit Upload endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const urlKey = uploadType === 'image' ? 'image_url' : 'background_image_url';
        
        setEditingCategory(prev => ({
          ...prev,
          [urlKey]: data.url
        }));
        
        toast.success(`Category ${uploadType} uploaded successfully`);
      } else {
        console.error('Edit Upload failed:', response.status, response.statusText);
        try {
          const error = await response.json();
          toast.error(error.error || `Failed to upload ${uploadType}`);
        } catch (jsonError) {
          console.error('Could not parse error response as JSON:', jsonError);
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          toast.error(`Failed to upload ${uploadType}: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error(`Error uploading ${uploadType}:`, error);
      toast.error(`Error uploading ${uploadType}`);
    } finally {
      const uploadState = uploadType === 'image' ? setUploadingImage : setUploadingBackground;
      uploadState(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="category-management">
      <div className="management-header">
        <h2>Advanced Category Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBulkActions(!showBulkActions)}
            disabled={selectedCategories.length === 0}
          >
            Bulk Actions ({selectedCategories.length})
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => document.getElementById('add-category-form').scrollIntoView()}
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedCategories.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-content">
            <span>Selected: {selectedCategories.length} categories</span>
            <div className="bulk-buttons">
              <button 
                className="btn btn-sm btn-success"
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </button>
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Categories Table */}
      <div className="enhanced-categories-table">
        <table>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectedCategories.length === categories.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategorySelect(category.id)}
                  />
                </td>
                <td>
                  {category.image_url ? (
                    <img 
                      src={`http://localhost:5005${category.image_url}`}
                      alt={category.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-light)',
                      fontSize: '14px'
                    }}>
                      {category.name.charAt(0)}
                    </div>
                  )}
                </td>
                <td>
                  <strong>{category.name}</strong>
                  {category.description && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {category.description.substring(0, 100)}...
                    </div>
                  )}
                </td>
                <td>
                  <code>{category.slug}</code>
                </td>
                <td>
                  <span className="product-count">
                    {category.product_count || 0} products
                  </span>
                </td>
                <td>
                  {category.is_featured ? (
                    <span className="badge featured">Featured</span>
                  ) : (
                    <span className="badge">Regular</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${category.is_active ? 'active' : 'inactive'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <input 
                    type="number" 
                    value={category.sort_order || 0}
                    onChange={(e) => {
                      // Handle sort order change
                      const newOrder = parseInt(e.target.value) || 0;
                      // You can implement real-time sorting here
                    }}
                    style={{ width: '60px', padding: '4px', fontSize: '12px' }}
                  />
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setEditingCategory(category)}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Category Form - Enhanced */}
      <div id="add-category-form" className="enhanced-category-form">
        <h3>Add New Category</h3>
        <form onSubmit={handleCreateCategory}>
          <div className="form-tabs">
            <div className="tab-content">
              {/* Basic Information */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewCategory({
                          ...newCategory,
                          name,
                          slug: generateSlug(name)
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug *</label>
                    <input
                      type="text"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={newCategory.sort_order}
                      onChange={(e) => setNewCategory({...newCategory, sort_order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Background Color</label>
                    <input
                      type="color"
                      value={newCategory.background_color}
                      onChange={(e) => setNewCategory({...newCategory, background_color: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newCategory.is_active}
                        onChange={(e) => setNewCategory({...newCategory, is_active: e.target.checked})}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newCategory.is_featured}
                        onChange={(e) => setNewCategory({...newCategory, is_featured: e.target.checked})}
                      />
                      Featured
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="form-section">
                <h4>SEO Settings</h4>
                <div className="form-group">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    value={newCategory.meta_title}
                    onChange={(e) => setNewCategory({...newCategory, meta_title: e.target.value})}
                    placeholder="SEO title for this category"
                  />
                </div>
                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea
                    value={newCategory.meta_description}
                    onChange={(e) => setNewCategory({...newCategory, meta_description: e.target.value})}
                    rows="3"
                    placeholder="SEO description for this category"
                  />
                </div>
                <div className="form-group">
                  <label>Meta Keywords</label>
                  <input
                    type="text"
                    value={newCategory.meta_keywords}
                    onChange={(e) => setNewCategory({...newCategory, meta_keywords: e.target.value})}
                    placeholder="SEO keywords separated by commas"
                  />
                </div>
              </div>

              {/* Display Settings */}
              <div className="form-section">
                <h4>Display Settings</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Products Per Page</label>
                    <select
                      value={newCategory.products_per_page}
                      onChange={(e) => setNewCategory({...newCategory, products_per_page: parseInt(e.target.value)})}
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={36}>36</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Default Sort</label>
                    <select
                      value={newCategory.default_sort}
                      onChange={(e) => setNewCategory({...newCategory, default_sort: e.target.value})}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newCategory.show_filters}
                      onChange={(e) => setNewCategory({...newCategory, show_filters: e.target.checked})}
                    />
                    Show Filters
                  </label>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="form-section">
                <h4>Images</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category Image</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(file, 'image');
                          }
                        }}
                        style={{ display: 'none' }}
                        id="category-image-upload"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary upload-btn"
                        onClick={() => document.getElementById('category-image-upload').click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Category Image'}
                      </button>
                      {newCategory.image_url && (
                        <div className="image-preview">
                          <img src={`http://localhost:5005${newCategory.image_url}`} alt="Category" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Background Image</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(file, 'background');
                          }
                        }}
                        style={{ display: 'none' }}
                        id="category-background-upload"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary upload-btn"
                        onClick={() => document.getElementById('category-background-upload').click()}
                        disabled={uploadingBackground}
                      >
                        {uploadingBackground ? 'Uploading...' : 'Upload Background Image'}
                      </button>
                      {newCategory.background_image_url && (
                        <div className="image-preview">
                          <img src={`http://localhost:5005${newCategory.background_image_url}`} alt="Background" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </div>

      {/* Edit Category Modal - Enhanced */}
      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h3>Edit Category</h3>
            <form onSubmit={handleUpdateCategory}>
              {/* Similar form structure as add category but with edit data */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={editingCategory.name || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        setEditingCategory({
                          ...editingCategory,
                          name,
                          slug: generateSlug(name)
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug *</label>
                    <input
                      type="text"
                      value={editingCategory.slug || ''}
                      onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={editingCategory.sort_order || 0}
                      onChange={(e) => setEditingCategory({...editingCategory, sort_order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Background Color</label>
                    <input
                      type="color"
                      value={editingCategory.background_color || '#667eea'}
                      onChange={(e) => setEditingCategory({...editingCategory, background_color: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={editingCategory.is_active}
                        onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={editingCategory.is_featured}
                        onChange={(e) => setEditingCategory({...editingCategory, is_featured: e.target.checked})}
                      />
                      Featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="form-section">
                <h4>Images</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category Image</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleEditImageUpload(file, 'image');
                          }
                        }}
                        style={{ display: 'none' }}
                        id="edit-category-image-upload"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary upload-btn"
                        onClick={() => document.getElementById('edit-category-image-upload').click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Category Image'}
                      </button>
                      {editingCategory.image_url && (
                        <div className="image-preview">
                          <img src={`http://localhost:5005${editingCategory.image_url}`} alt="Category" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Background Image</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleEditImageUpload(file, 'background');
                          }
                        }}
                        style={{ display: 'none' }}
                        id="edit-category-background-upload"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary upload-btn"
                        onClick={() => document.getElementById('edit-category-background-upload').click()}
                        disabled={uploadingBackground}
                      >
                        {uploadingBackground ? 'Uploading...' : 'Upload Background Image'}
                      </button>
                      {editingCategory.background_image_url && (
                        <div className="image-preview">
                          <img src={`http://localhost:5005${editingCategory.background_image_url}`} alt="Background" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Category
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .category-management {
          padding: 1rem;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .bulk-actions {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .bulk-actions-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bulk-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .enhanced-categories-table {
          background: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .enhanced-categories-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .enhanced-categories-table th,
        .enhanced-categories-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .enhanced-categories-table th {
          background: var(--bg-secondary);
          font-weight: 600;
        }

        .enhanced-category-form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h4 {
          margin-bottom: 1rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: var(--primary-color);
          color: var(--text-light);
        }

        .btn-primary:hover {
          background: var(--primary-hover);
        }

        .btn-secondary {
          background: var(--secondary-color);
          color: var(--text-light);
        }

        .btn-secondary:hover {
          background: var(--secondary-hover);
        }

        .btn-success {
          background: var(--success-color);
          color: var(--text-light);
        }

        .btn-warning {
          background: var(--warning-color);
          color: var(--text-dark);
        }

        .btn-danger {
          background: var(--danger-color);
          color: var(--text-light);
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.25rem;
        }

        .badge.active {
          background: var(--success-light);
          color: var(--success-dark);
        }

        .badge.inactive {
          background: var(--danger-light);
          color: var(--danger-dark);
        }

        .badge.featured {
          background: var(--warning-light);
          color: var(--warning-dark);
        }

        .product-count {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--modal-backdrop);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content.large {
          max-width: 800px;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .image-upload-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .upload-btn {
          padding: 0.5rem 1rem;
          border: 2px dashed var(--primary-color);
          background: var(--bg-secondary);
          color: var(--primary-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--primary-hover);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .image-preview {
          margin-top: 0.5rem;
        }

        .image-preview img {
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .management-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryManagement; 