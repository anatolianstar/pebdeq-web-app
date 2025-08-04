import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import BackgroundRemovalModal from '../components/BackgroundRemovalModal';
import CategoryManagement from '../components/CategoryManagement';
import CategoryAnalytics from '../components/CategoryAnalytics';
import BlogManagement from '../components/BlogManagement';
import SiteSettings2 from './SiteSettings2';
import MenuSettings from './MenuSettings';
import GeneralSettings from './GeneralSettings';
import InformationSettings from './InformationSettings';
import ThemeSelector from '../components/ThemeSelector';
import ResponsiveThemeTest from '../components/ResponsiveThemeTest';
import ThemeBuilder from '../components/ThemeBuilder';
import { useTheme } from '../contexts/ThemeContext';
import EmailManagement from './EmailManagement';
import { createApiUrl } from '../utils/config';
// Header import removed - checking for existing header in layout

const API_BASE_URL = 'http://localhost:5005';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { customThemes, debugCustomThemes } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Debug custom themes
  useEffect(() => {
    console.log('🎨 Admin Dashboard - Custom themes:', customThemes);
    console.log('🎨 Admin Dashboard - Custom themes count:', customThemes?.length || 0);
    debugCustomThemes && debugCustomThemes();
  }, [customThemes, debugCustomThemes]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [variationTypes, setVariationTypes] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Order management states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    payment_status: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  const [orderPagination, setOrderPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1
  });

  // Order email modal states
  const [showOrderEmailModal, setShowOrderEmailModal] = useState(false);
  const [selectedOrderForEmail, setSelectedOrderForEmail] = useState(null);
  const [orderEmailForm, setOrderEmailForm] = useState({
    template_type: 'order_confirmation',
    subject: '',
    custom_message: ''
  });

  // Return management states
  const [returnRequests, setReturnRequests] = useState([]);
  const [returnFilters, setReturnFilters] = useState({
    status: '',
    search: ''
  });
  const [returnPagination, setReturnPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1
  });

  // User management states
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({
    search: '',
    is_admin: ''
  });
  const [userPagination, setUserPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Product states
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    category_id: '',
    images: [],
    video_url: '',
    is_featured: false,
    is_active: true,
    has_variations: false,
    variation_type: '', // 'color', 'size', 'weight', 'custom'
    variation_name: '', // Custom variation name
    variation_options: [], // [{name: 'Red', value: 'red', price_modifier: 0, stock: 10, images: []}]
    weight: '',
    dimensions: '',
    material: ''
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);
  const [uploadingProductVideo, setUploadingProductVideo] = useState(false);



  // Variation states
  const [newVariationType, setNewVariationType] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });

  const [editingVariationType, setEditingVariationType] = useState(null);

  const [newVariationOption, setNewVariationOption] = useState({
    variation_type_id: '',
    name: '',
    value: '',
    hex_color: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });

  const [editingVariationOption, setEditingVariationOption] = useState(null);
  const [selectedProductForVariations, setSelectedProductForVariations] = useState(null);

  // Background removal modal states
  const [backgroundRemovalModalOpen, setBackgroundRemovalModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [isEditingModalImages, setIsEditingModalImages] = useState(false);

  // Invoice management states
  const [invoices, setInvoices] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({
    total_invoices: 0,
    total_amount: 0,
    pending_invoices: 0,
    paid_invoices: 0
  });
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  const [invoicePagination, setInvoicePagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    order_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_tax_number: '',
    notes: '',
    items: []
  });
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchStats = async () => {
    try {
      const response = await fetch(createApiUrl('api/admin/stats'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(createApiUrl('api/admin/products'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async (page = 1, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: orderPagination.per_page.toString(),
        ...filters
      });

      const response = await fetch(createApiUrl('api/orders?${queryParams}'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setOrderPagination({
          ...orderPagination,
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 1
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...');
      const response = await fetch(createApiUrl('api/admin/categories'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Categories fetched:', data.categories);
        setCategories(data.categories || []);
      } else {
        console.error('❌ Failed to fetch categories, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(createApiUrl('api/messages'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchVariationTypes = async () => {
    try {
      const response = await fetch(createApiUrl('api/admin/variation-types'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setVariationTypes(data.variation_types || []);
      }
    } catch (error) {
      console.error('Error fetching variation types:', error);
    }
  };

  const fetchVariationOptions = async () => {
    try {
      const response = await fetch(createApiUrl('api/admin/variation-options'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setVariationOptions(data.variation_options || []);
      }
    } catch (error) {
      console.error('Error fetching variation options:', error);
    }
  };

  // Invoice API Functions
  const fetchInvoices = async (page = 1, filters = {}) => {
    try {
      setLoadingInvoices(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: invoicePagination.per_page.toString(),
        ...filters
      });

      const response = await fetch(`/api/invoices?${queryParams}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setInvoicePagination({
          ...invoicePagination,
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 1
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error fetching invoices');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const response = await fetch('/api/invoices/stats', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoiceStats(data);
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedInvoice(data);
        setShowInvoiceDetails(true);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast.error('Error fetching invoice details');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newInvoice)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Invoice created successfully');
        setNewInvoice({
          order_id: '',
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_address: '',
          customer_tax_number: '',
          notes: '',
          items: []
        });
        fetchInvoices();
        fetchInvoiceStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error creating invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Error creating invoice');
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingInvoice)
      });
      
      if (response.ok) {
        toast.success('Invoice updated successfully');
        setEditingInvoice(null);
        fetchInvoices();
        fetchInvoiceStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error updating invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Error updating invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success('Invoice deleted successfully');
        fetchInvoices();
        fetchInvoiceStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error deleting invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Error deleting invoice');
    }
  };

  const handleCreateInvoiceFromOrder = async (orderId, replaceExisting = false) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/create-invoice`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replaceExisting })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Invoice created from order successfully');
        fetchInvoices();
        fetchInvoiceStats();
      } else if (response.status === 409) {
        // Invoice already exists, show confirmation dialog
        const error = await response.json();
        if (error.invoice_exists) {
          const confirmed = window.confirm(
            `${error.message}\n\nExisting Invoice: ${error.existing_invoice_number}\n\nClick OK to delete the existing invoice and create a new one, or Cancel to keep the existing invoice.`
          );
          
          if (confirmed) {
            // Retry with replaceExisting = true
            handleCreateInvoiceFromOrder(orderId, true);
          }
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error creating invoice from order');
      }
    } catch (error) {
      console.error('Error creating invoice from order:', error);
      toast.error('Error creating invoice from order');
    }
  };

  const handleDownloadInvoicePDF = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download-pdf`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Error downloading invoice PDF');
      }
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      toast.error('Error downloading invoice PDF');
    }
  };

  const handleFilterInvoices = () => {
    setInvoicePagination({ ...invoicePagination, page: 1 });
    fetchInvoices(1, invoiceFilters);
  };

  const handleClearInvoiceFilters = () => {
    setInvoiceFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: ''
    });
    setInvoicePagination({ ...invoicePagination, page: 1 });
    fetchInvoices(1, {});
  };

  const handleInvoicePageChange = (newPage) => {
    setInvoicePagination({ ...invoicePagination, page: newPage });
    fetchInvoices(newPage, invoiceFilters);
  };

  const getInvoiceStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid': return 'status-badge-success';
      case 'sent': return 'status-badge-info';
      case 'overdue': return 'status-badge-danger';
      case 'cancelled': return 'status-badge-secondary';
      default: return 'status-badge-warning';
    }
  };

  // User management functions
  const fetchUsers = async (page = 1, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: userPagination.per_page.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setUserPagination({
          ...userPagination,
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 1
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setShowUserDetails(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.success('User updated successfully');
        fetchUsers(userPagination.page, userFilters);
        setEditingUser(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          toast.success('User deleted successfully');
          fetchUsers(userPagination.page, userFilters);
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error deleting user');
      }
    }
  };

  const handleFilterUsers = () => {
    fetchUsers(1, userFilters);
  };

  const handleClearUserFilters = () => {
    setUserFilters({
      search: '',
      is_admin: ''
    });
    fetchUsers(1, {});
  };

  const handleUserPageChange = (newPage) => {
    fetchUsers(newPage, userFilters);
  };

  // Utility functions
  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const filterEmptyVariations = (variationOptions) => {
    if (!variationOptions || !Array.isArray(variationOptions)) return [];
    return variationOptions.filter(option => 
      option && typeof option === 'object' && option.name && option.name.trim()
    );
  };

  // Product management functions
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    try {
      const filteredVariations = filterEmptyVariations(newProduct.variation_options);
      
      const productData = {
        ...newProduct,
        slug: newProduct.slug || generateSlug(newProduct.name),
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        stock_quantity: parseInt(newProduct.stock_quantity),
        category_id: parseInt(newProduct.category_id),
        variation_options: filteredVariations
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success('Product created successfully');
        setNewProduct({
          name: '',
          slug: '',
          description: '',
          price: '',
          original_price: '',
          stock_quantity: '',
          category_id: '',
          images: [],
          video_url: '',
          is_featured: false,
          is_active: true,
          has_variations: false,
          variation_type: '',
          variation_name: '',
          variation_options: [],
          weight: '',
          dimensions: '',
          material: ''
        });
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error creating product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    try {
      const filteredVariations = filterEmptyVariations(editingProduct.variation_options);
      
      const productData = {
        ...editingProduct,
        slug: editingProduct.slug || generateSlug(editingProduct.name),
        price: parseFloat(editingProduct.price),
        original_price: editingProduct.original_price ? parseFloat(editingProduct.original_price) : null,
        stock_quantity: parseInt(editingProduct.stock_quantity),
        category_id: parseInt(editingProduct.category_id),
        variation_options: filteredVariations
      };

      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success('Product updated successfully');
        fetchProducts();
        setEditingProduct(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          toast.success('Product deleted successfully');
          fetchProducts();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };



  // File upload functions
  const handleProductImagesUpload = async (files) => {
    if (!files || files.length === 0) return [];
    
    console.log('📤 Starting image upload...', files.length, 'files');
    setUploadingProductImages(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    try {
      const response = await fetch('/api/admin/upload/product-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      console.log('📤 Upload response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📤 Upload response data:', data);
        const uploadedImages = data.files.map(file => file.url);
        
        // Update the appropriate product state
        let updatedImages = [];
        if (editingProduct) {
          updatedImages = [...(editingProduct.images || []), ...uploadedImages];
          setEditingProduct(prev => ({
            ...prev,
            images: updatedImages
          }));
        } else {
          updatedImages = [...(newProduct.images || []), ...uploadedImages];
          setNewProduct(prev => ({
            ...prev,
            images: updatedImages
          }));
        }
        
        toast.success(`${data.files.length} images uploaded successfully`);
        
        // Open background removal modal
        openBackgroundRemovalModal(updatedImages, !!editingProduct);
        
        return uploadedImages;
      } else {
        const errorText = await response.text();
        console.error('❌ Upload failed:', errorText);
        toast.error(`Upload failed: ${errorText}`);
        return [];
      }
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      toast.error('Upload failed');
      return [];
    } finally {
      setUploadingProductImages(false);
    }
  };

  const handleProductVideoUpload = async (file) => {
    if (!file) return null;
    
    setUploadingProductVideo(true);
    const formData = new FormData();
    formData.append('video', file);
    
    try {
              const response = await fetch('/api/admin/upload/product-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Video uploaded successfully');
        return data.file_url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Upload failed');
      return null;
    } finally {
      setUploadingProductVideo(false);
    }
  };

  const handleDeleteFile = async (fileUrl) => {
    try {
      const response = await fetch('/api/admin/delete-file', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ file_url: fileUrl })
      });
      
      if (response.ok) {
        toast.success('File deleted successfully');
        return true;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Delete failed');
        return false;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Delete failed');
      return false;
    }
  };



  // Excel functions
  const handleExportProductsExcel = async () => {
    try {
      const response = await fetch('/api/admin/products/export-excel', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Products exported successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to export products');
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Error exporting products');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/products/export-template', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Template downloaded successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Error downloading template');
    }
  };

  const handleImportProductsExcel = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type header for FormData - browser will set it automatically with boundary
      const authHeaders = getAuthHeaders();
      delete authHeaders['Content-Type']; // Remove if exists

      const response = await fetch('/api/admin/products/import-excel', {
        method: 'POST',
        headers: authHeaders,
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Products imported successfully: ${data.imported_count} products, ${data.updated_count} updated, ${data.failed_count} failed`);
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to import products');
      }
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('Error importing products');
    }
  };

  // Variation management functions
  const createVariationType = async (e) => {
    e.preventDefault();
    
    try {
      const typeData = {
        ...newVariationType,
        slug: newVariationType.slug || generateSlug(newVariationType.name)
      };

      const response = await fetch('/api/admin/variation-types', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(typeData)
      });

      if (response.ok) {
        toast.success('Variation type created successfully');
        setNewVariationType({
          name: '',
          slug: '',
          description: '',
          is_active: true
        });
        fetchVariationTypes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create variation type');
      }
    } catch (error) {
      console.error('Error creating variation type:', error);
      toast.error('Error creating variation type');
    }
  };

  const updateVariationType = async (e) => {
    e.preventDefault();
    
    try {
      const typeData = {
        ...editingVariationType,
        slug: editingVariationType.slug || generateSlug(editingVariationType.name)
      };

      const response = await fetch(`/api/admin/variation-types/${editingVariationType.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(typeData)
      });

      if (response.ok) {
        toast.success('Variation type updated successfully');
        fetchVariationTypes();
        setEditingVariationType(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update variation type');
      }
    } catch (error) {
      console.error('Error updating variation type:', error);
      toast.error('Error updating variation type');
    }
  };

  const deleteVariationType = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this variation type?')) {
      try {
        const response = await fetch(`/api/admin/variation-types/${typeId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          toast.success('Variation type deleted successfully');
          fetchVariationTypes();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete variation type');
        }
      } catch (error) {
        console.error('Error deleting variation type:', error);
        toast.error('Error deleting variation type');
      }
    }
  };

  const saveProductVariations = async (product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          variation_options: product.variation_options
        })
      });
      
      if (response.ok) {
        setSelectedProductForVariations(null);
        fetchProducts();
        toast.success('Variations saved successfully');
      } else {
        toast.error('Failed to save variations');
      }
    } catch (error) {
      console.error('Error saving variations:', error);
      toast.error('Failed to save variations');
    }
  };

  // Order management functions
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(createApiUrl(`api/orders/${orderId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders(orderPagination.page, orderFilters);
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await fetch(createApiUrl(`api/orders/${orderId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ payment_status: paymentStatus })
      });

      if (response.ok) {
        toast.success('Payment status updated successfully');
        fetchOrders(orderPagination.page, orderFilters);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error updating payment status');
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(createApiUrl(`api/orders/${orderId}`), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        setShowOrderDetails(true);
      } else {
        toast.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error fetching order details');
    }
  };

  const handleSendOrderEmail = (order) => {
    setSelectedOrderForEmail(order);
    setOrderEmailForm({
      template_type: 'order_confirmation',
      subject: `Order #${order.id} - Update from PEBDEQ`,
      custom_message: ''
    });
    setShowOrderEmailModal(true);
  };

  const sendOrderEmail = async () => {
    try {
      const response = await fetch(createApiUrl('api/admin/email/send/order/${selectedOrderForEmail.id}'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          template_type: orderEmailForm.template_type,
          subject: orderEmailForm.subject,
          custom_message: orderEmailForm.custom_message
        })
      });

      if (response.ok) {
        toast.success('Order email sent successfully!');
        setShowOrderEmailModal(false);
        setSelectedOrderForEmail(null);
      } else {
        const errorData = await response.json();
        toast.error('Failed to send email: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending order email:', error);
      toast.error('Error sending order email');
    }
  };

  const handleFilterOrders = () => {
    const filters = {};
    if (orderFilters.status) filters.status = orderFilters.status;
    if (orderFilters.payment_status) filters.payment_status = orderFilters.payment_status;
    if (orderFilters.search) filters.search = orderFilters.search;
    if (orderFilters.date_from) filters.date_from = orderFilters.date_from;
    if (orderFilters.date_to) filters.date_to = orderFilters.date_to;
    
    fetchOrders(1, filters);
  };

  const handleClearFilters = () => {
    setOrderFilters({
      status: '',
      payment_status: '',
      search: '',
      date_from: '',
      date_to: ''
    });
    fetchOrders(1, {});
  };

  const handleOrderPageChange = (newPage) => {
    fetchOrders(newPage, orderFilters);
  };

  // Return management functions
  const fetchReturnRequests = async (page = 1, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: returnPagination.per_page.toString(),
        ...filters
      });

      const response = await fetch(createApiUrl('api/admin/returns?${queryParams}'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setReturnRequests(data.return_requests || []);
        setReturnPagination({
          ...returnPagination,
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 1
        });
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
    }
  };

  const handleProcessReturnRequest = async (orderId, action, adminNotes = '') => {
    try {
      const response = await fetch(createApiUrl('api/admin/returns/${orderId}'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          action,
          admin_notes: adminNotes
        })
      });

      if (response.ok) {
        toast.success(`Return request ${action}d successfully`);
        fetchReturnRequests(returnPagination.page, returnFilters);
      } else {
        toast.error(`Failed to ${action} return request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing return request:`, error);
      toast.error(`Error ${action}ing return request`);
    }
  };

  const handleCompleteReturn = async (orderId) => {
    try {
      const response = await fetch(createApiUrl('api/admin/returns/${orderId}/complete'), {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Return completed successfully');
        fetchReturnRequests(returnPagination.page, returnFilters);
      } else {
        toast.error('Failed to complete return');
      }
    } catch (error) {
      console.error('Error completing return:', error);
      toast.error('Error completing return');
    }
  };

  const handleFilterReturns = () => {
    const filters = {};
    if (returnFilters.status) filters.status = returnFilters.status;
    if (returnFilters.search) filters.search = returnFilters.search;
    
    fetchReturnRequests(1, filters);
  };

  const handleClearReturnFilters = () => {
    setReturnFilters({
      status: '',
      search: ''
    });
    fetchReturnRequests(1, {});
  };

  const handleReturnPageChange = (newPage) => {
    fetchReturnRequests(newPage, returnFilters);
  };

  const getReturnStatusBadgeClass = (status) => {
    switch (status) {
      case 'requested': return 'badge-warning';
      case 'approved': return 'badge-info';
      case 'denied': return 'badge-danger';
      case 'returned': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'return_requested': return 'badge-warning';
      case 'returned': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'paid': return 'badge-success';
      case 'cash_on_delivery': return 'badge-info';
      case 'failed': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  // Message management functions
  const handleMarkMessageRead = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Message marked as read');
        fetchMessages();
      } else {
        toast.error('Failed to mark message as read');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Error marking message as read');
    }
  };

  // Background removal modal functions
  const openBackgroundRemovalModal = (images, isEditing = false) => {
    setModalImages([...images]);
    setIsEditingModalImages(isEditing);
    setBackgroundRemovalModalOpen(true);
  };

  const closeBackgroundRemovalModal = () => {
    setBackgroundRemovalModalOpen(false);
    setModalImages([]);
    setIsEditingModalImages(false);
  };

  const handleModalImagesSave = (updatedImages) => {
    if (isEditingModalImages) {
      setEditingProduct(prev => ({
        ...prev,
        images: updatedImages
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        images: updatedImages
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchOrders(1, {}),
        fetchReturnRequests(1, {}),
        fetchCategories(),
        fetchMessages(),
        fetchVariationTypes(),
        fetchVariationOptions(),
        fetchUsers(1, {}),
        fetchInvoices(1, {}),
        fetchInvoiceStats()
      ]);
      setLoading(false);
    };

    if (user && user.is_admin) {
      fetchData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* YENİ LAYOUT: SIDEBAR + MAİN CONTENT */}
      <div className="admin-body" style={{height: '100vh'}}>
        
        {/* SOL SİDEBAR */}
        <div className="admin-sidebar" style={{
          width: '250px',
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '20px 0',
          overflowY: 'hidden',
          borderRight: '3px solid #34495e',
          height: '100vh',
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '1000'
        }}>
          
          {/* THEME SELECTOR */}
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #34495e',
            marginBottom: '15px'
          }}>
            <ThemeSelector 
              size="small" 
              showLabel={true}
              className="admin-theme-selector"
              position="bottom-left"
            />
          </div>
          
          {/* ANA PANEL */}
          <div className="menu-group">
            <button 
              className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'dashboard' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {if (activeTab !== 'dashboard') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'dashboard') e.target.style.backgroundColor = 'transparent'}}
            >
              📊 Dashboard
            </button>
          </div>

          {/* E-TİCARET */}
          <div className="menu-group" style={{marginTop: '4px'}}>
            <button 
              className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'products' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {if (activeTab !== 'products') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'products') e.target.style.backgroundColor = 'transparent'}}
            >
              📦 Products
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'orders' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {if (activeTab !== 'orders') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'orders') e.target.style.backgroundColor = 'transparent'}}
            >
              🛒 Orders
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'returns' ? 'active' : ''}`}
              onClick={() => setActiveTab('returns')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'returns' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {if (activeTab !== 'returns') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'returns') e.target.style.backgroundColor = 'transparent'}}
            >
              ↩️ Returns
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'users' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {if (activeTab !== 'users') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'users') e.target.style.backgroundColor = 'transparent'}}
            >
              👥 Users
            </button>
          </div>

          {/* KATEGORİ YÖNETİMİ */}
          <div className="menu-group" style={{marginTop: '4px'}}>
            <button 
              className={`sidebar-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'categories' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'categories') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'categories') e.target.style.backgroundColor = 'transparent'}}
            >
              📂 Categories
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'advanced-categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced-categories')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'advanced-categories' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'advanced-categories') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'advanced-categories') e.target.style.backgroundColor = 'transparent'}}
            >
              📁 Advanced Categories
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'category-analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('category-analytics')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'category-analytics' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'category-analytics') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'category-analytics') e.target.style.backgroundColor = 'transparent'}}
            >
              📈 Analytics
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'variations' ? 'active' : ''}`}
              onClick={() => setActiveTab('variations')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'variations' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'variations') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'variations') e.target.style.backgroundColor = 'transparent'}}
            >
              🏷️ Variations
            </button>
          </div>

          {/* İÇERİK */}
          <div className="menu-group" style={{marginTop: '4px'}}>
            <button 
              className={`sidebar-item ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => setActiveTab('blog')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'blog' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'blog') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'blog') e.target.style.backgroundColor = 'transparent'}}
            >
              📝 Blog
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'messages' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'messages') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'messages') e.target.style.backgroundColor = 'transparent'}}
            >
              💬 Messages
            </button>
          </div>

          {/* TASARIM */}
          <div className="menu-group" style={{marginTop: '4px'}}>
            <button 
              className={`sidebar-item ${activeTab === 'site-settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('site-settings')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'site-settings' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'site-settings') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'site-settings') e.target.style.backgroundColor = 'transparent'}}
            >
              🎨 Site Settings
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'theme-testing' ? 'active' : ''}`}
              onClick={() => setActiveTab('theme-testing')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'theme-testing' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'theme-testing') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'theme-testing') e.target.style.backgroundColor = 'transparent'}}
            >
              🧪 Theme Testing
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'theme-builder' ? 'active' : ''}`}
              onClick={() => setActiveTab('theme-builder')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'theme-builder' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'theme-builder') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'theme-builder') e.target.style.backgroundColor = 'transparent'}}
            >
              🏗️ Theme Builder
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'menu-settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu-settings')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'menu-settings' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'menu-settings') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'menu-settings') e.target.style.backgroundColor = 'transparent'}}
            >
              🔗 Menu Settings
            </button>
          </div>

          {/* AYARLAR */}
          <div className="menu-group" style={{marginTop: '8px', marginBottom: '20px'}}>
            <button 
              className={`sidebar-item ${activeTab === 'general-settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('general-settings')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'general-settings' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'general-settings') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'general-settings') e.target.style.backgroundColor = 'transparent'}}
            >
              ⚙️ General Settings
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'information-settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('information-settings')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'information-settings' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'information-settings') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'information-settings') e.target.style.backgroundColor = 'transparent'}}
            >
              ℹ️ Information
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'invoices' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'invoices') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'invoices') e.target.style.backgroundColor = 'transparent'}}
            >
              🧾 Invoices
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'email-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('email-management')}
              style={{
                width: '100%',
                padding: '6px 20px',
                backgroundColor: activeTab === 'email-management' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'email-management') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'email-management') e.target.style.backgroundColor = 'transparent'}}
            >
              📧 Email
            </button>
            
            <a 
              href="/admin/tests"
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                textDecoration: 'none',
                textAlign: 'left',
                fontSize: '12px',
                marginTop: '10px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
            >
              🧪 Test Page
            </a>
          </div>

        </div>

        {/* SAĞ MAİN CONTENT */}
        <div className="admin-main" style={{
          flex: '1 1 auto',
          padding: '5px 15px 15px 15px',
          overflowY: 'auto',
          backgroundColor: '#ecf0f1',
          marginLeft: '250px',
          width: 'calc(100% - 250px)',
          height: '100vh',
          maxHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          {activeTab === 'dashboard' && (
            <div className="dashboard-content" style={{marginTop: '0', paddingTop: '0'}}>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <span className="stat-number">{stats.totalProducts}</span>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <span className="stat-number">{stats.totalOrders}</span>
                </div>
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <span className="stat-number">{stats.totalUsers}</span>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <span className="stat-number">${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <div className="recent-activities">
                <h3>Recent Orders</h3>
                <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user_email}</td>
                      <td>${order.total_amount}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-content">
              <div className="section-header">
                <h2>Products Management</h2>
            <div className="header-actions">
              <div className="excel-actions">
                <button 
                  className="btn btn-success"
                  onClick={handleExportProductsExcel}
                  title="Export all products to Excel (backup)"
                >
                  📊 Backup Excel
                </button>
                <button 
                  className="btn btn-info"
                  onClick={handleDownloadTemplate}
                  title="Download Excel template for import"
                >
                  📋 Download Template
                </button>
                <div className="import-excel-wrapper">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImportProductsExcel(file);
                        e.target.value = '';
                      }
                    }}
                    style={{ display: 'none' }}
                    id="excel-import-input"
                  />
                  <button 
                    className="btn btn-warning"
                    onClick={() => document.getElementById('excel-import-input').click()}
                    title="Import products from Excel"
                  >
                    📥 Restore Excel
                  </button>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('add-product-form').scrollIntoView()}
              >
                Add Product
              </button>
            </div>
          </div>
          
          <div className="products-table">
                          <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Images</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>${product.price}</td>
                    <td>{product.stock_quantity}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="product-image-status">
                        {product.images && product.images.length > 0 ? (
                          <>
                            <span className="image-icon image-status-has-images">📷</span>
                            <span className="image-count">{product.images.length}</span>
                          </>
                        ) : (
                          <span className="image-icon image-status-no-images" title="No images">📷❌</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${product.is_featured ? 'featured' : 'not-featured'}`}>
                        {product.is_featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setEditingProduct({
                              id: product.id,
                              name: product.name,
                              slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
                              description: product.description || '',
                              price: product.price,
                              original_price: product.original_price || '',
                              stock_quantity: product.stock_quantity,
                              category_id: product.category_id || '',
                              images: product.images || [],
                              video_url: product.video_url || '',
                              is_featured: product.is_featured,
                              is_active: product.is_active,
                              has_variations: product.has_variations || false,
                              variation_type: product.variation_type || '',
                              variation_name: product.variation_name || '',
                              variation_options: product.variation_options || [],
                              weight: product.weight || '',
                              dimensions: product.dimensions || '',
                              material: product.material || ''
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProduct(product.id)}
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

          {/* Add Product Form */}
          <div id="add-product-form" className="add-product-form">
            <h3>Add New Product</h3>
            <form onSubmit={handleCreateProduct}>
              <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewProduct({
                        ...newProduct, 
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    required
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Slug (auto-generated)</label>
                  <input
                    type="text"
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({...newProduct, slug: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Original Price (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.original_price}
                    onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

                              <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Product Images (Maximum 10)</label>
                  <div className="custom-file-input">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 10) {
                          toast.error('Maximum 10 images allowed');
                          return;
                        }
                        if (files.length > 0) {
                          const imageUrls = await handleProductImagesUpload(files);
                          if (imageUrls.length > 0) {
                            setNewProduct({...newProduct, images: imageUrls});
                          }
                        }
                      }}
                      disabled={uploadingProductImages}
                    />
                    <div className={`custom-file-button ${newProduct.images.length > 0 ? 'file-selected' : ''}`}>
                      {uploadingProductImages ? 'Uploading...' : 
                       newProduct.images.length > 0 ? `${newProduct.images.length} image(s) selected` : 
                       'Choose Images'}
                    </div>
                  </div>
                  <div className="file-upload-info">
                    Maximum 10 images, formats: JPG, PNG, GIF
                  </div>
                  
                  {/* RESİM EDİT BUTONU - PENCERENIN ÜSTÜNDE GENİŞ - NEW PRODUCT */}
                  {newProduct.images.length > 0 && (
                    <div style={{marginTop: '15px', marginBottom: '20px', width: '100%'}}>
                      <button 
                        type="button"
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '15px 20px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          backgroundColor: '#007bff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => openBackgroundRemovalModal(newProduct.images, false)}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#0056b3';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#007bff';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                        }}
                      >
                        🎨 Edit Images & Remove Backgrounds
                      </button>
                    </div>
                  )}
                  
                  {newProduct.images.length > 0 && (
                    <div className="image-preview-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gridTemplateRows: 'repeat(2, auto)',
                      gap: '8px',
                      height: '200px',
                      maxWidth: '600px',
                      padding: '10px',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      background: '#f8f9fa'
                    }}>
                      {newProduct.images.map((imageUrl, index) => (
                        <div key={index} className="image-preview-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', margin: '0'}}>
                          <div className="image-container" style={{margin: '0', padding: '0'}}>
                            <img 
                              src={imageUrl} 
                              alt={`Product ${index + 1}`}
                              style={{ 
                                width: '60px', /* SABİT GRID İÇİN KÜÇÜK BOYUT */
                                height: '60px', 
                                objectFit: 'contain', 
                                borderRadius: '4px', 
                                padding: '2px',
                                margin: '0',
                                marginBottom: '0',
                                border: '1px solid #ddd'
                              }}
                            />
                          </div>
                          
                          <div className="image-actions" style={{margin: '0', padding: '0'}}>
                            <button 
                              type="button"
                              className="btn btn-sm btn-danger"
                                                              style={{
                                margin: '0',
                                padding: '1px 4px', /* DAHA KÜÇÜK PADDİNG */
                                fontSize: '9px', /* DAHA KÜÇÜK FONT */
                                lineHeight: '1.1',
                                minHeight: 'auto'
                              }}
                              onClick={() => {
                                const newImages = newProduct.images.filter((_, i) => i !== index);
                                setNewProduct({...newProduct, images: newImages});
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                                             <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Product Video (Optional)</label>
                  <div className="custom-file-input">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const videoUrl = await handleProductVideoUpload(file);
                          if (videoUrl) {
                            setNewProduct({...newProduct, video_url: videoUrl});
                          }
                        }
                      }}
                      disabled={uploadingProductVideo}
                    />
                    <div className={`custom-file-button ${newProduct.video_url ? 'file-selected' : ''}`}>
                      {uploadingProductVideo ? 'Uploading...' : 
                       newProduct.video_url ? 'Video selected' : 
                       'Choose Video'}
                    </div>
                  </div>
                  <div className="file-upload-info">
                    Formats: MP4, WebM, AVI
                  </div>
                  {newProduct.video_url && (
                    <div className="video-preview">
                      <video 
                        src={newProduct.video_url} 
                        controls
                        style={{ width: '200px', height: '120px', borderRadius: '4px' }}
                      />
                      <button 
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setNewProduct({...newProduct, video_url: ''})}
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>

                            <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Weight (grams)</label>
                  <input
                    type="number"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                    placeholder="500"
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Dimensions (LxWxH cm)</label>
                  <input
                    type="text"
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                    placeholder="20x15x10"
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Material</label>
                  <input
                    type="text"
                    value={newProduct.material}
                    onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                    placeholder="Cotton, Polyester, etc."
                  />
                </div>
              </div>

              {/* Variation Options */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newProduct.has_variations}
                    onChange={(e) => {
                      setNewProduct({
                        ...newProduct, 
                        has_variations: e.target.checked,
                        variation_type: e.target.checked ? newProduct.variation_type : '',
                        variation_name: e.target.checked ? newProduct.variation_name : '',
                        variation_options: e.target.checked ? newProduct.variation_options : []
                      });
                    }}
                  />
                  This product has variations (color, size, weight, etc.)
                </label>
              </div>

              {newProduct.has_variations && (
                <div className="variation-setup">
                  <h4>Variation Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Variation Type</label>
                      <select
                        value={newProduct.variation_type}
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct, 
                            variation_type: e.target.value,
                            variation_name: e.target.value === 'custom' ? newProduct.variation_name : ''
                          });
                        }}
                        required
                      >
                        <option value="">Select</option>
                        <option value="color">Color</option>
                        <option value="size">Size</option>
                        <option value="weight">Weight</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    
                    {newProduct.variation_type === 'custom' && (
                      <div className="form-group" style={{marginBottom: '0.3rem'}}>
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Custom Variation Name</label>
                        <input
                          type="text"
                          value={newProduct.variation_name}
                          onChange={(e) => setNewProduct({...newProduct, variation_name: e.target.value})}
                          placeholder="e.g.: Material, Style, etc."
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="variation-options-setup">
                    <h5>Variation Options</h5>
                    <p>You can configure details in the Variation tab after saving the product.</p>
                    
                    {/* Column Headers */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#555'
                    }}>
                      <div style={{ width: '200px' }}>Option Name</div>
                      <div style={{ width: '20px' }}></div>
                    </div>
                    
                    {newProduct.variation_options.map((option, index) => (
                      <div key={index} className="variation-option-item" style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        marginBottom: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => {
                            const newOptions = [...newProduct.variation_options];
                            newOptions[index].name = e.target.value;
                            setNewProduct({...newProduct, variation_options: newOptions});
                          }}
                          placeholder="Option name (e.g.: Red, Large, 1kg)"
                          style={{ width: '200px', fontSize: '14px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            const newOptions = newProduct.variation_options.filter((_, i) => i !== index);
                            setNewProduct({...newProduct, variation_options: newOptions});
                          }}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        const newOptions = [...newProduct.variation_options];
                        newOptions.push({ name: '', price_modifier: 0, stock: 0, images: [] });
                        setNewProduct({...newProduct, variation_options: newOptions});
                      }}
                    >
                      Add Variation Option
                    </button>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h4>Product Specifications</h4>
                <div className="form-row">
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Weight</label>
                    <input
                      type="text"
                      value={newProduct.weight}
                      onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                      placeholder="e.g.: 1.5kg, 250g"
                    />
                  </div>
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Dimensions</label>
                    <input
                      type="text"
                      value={newProduct.dimensions}
                      onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                      placeholder="e.g.: 30x20x10 cm"
                    />
                  </div>
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Material</label>
                  <input
                    type="text"
                    value={newProduct.material}
                    onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                    placeholder="e.g.: Plastic, Metal, Wood"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                    <input
                      type="checkbox"
                      checked={newProduct.is_featured}
                      onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})}
                    />
                    Featured Product
                  </label>
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                    <input
                      type="checkbox"
                      checked={newProduct.is_active}
                      onChange={(e) => setNewProduct({...newProduct, is_active: e.target.checked})}
                    />
                    Active
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Product
              </button>
            </form>
          </div>

          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Edit Product</h3>
                <form onSubmit={handleUpdateProduct}>
                  {/* Variation Management - Top Section */}
                  <div className="variation-management-section">
                    <h4>🎨 Variation Management</h4>
                    
                    {editingProduct.has_variations ? (
                      <>
                        <div className="variation-controls">
                          <button
                            type="button"
                            className="btn btn-warning"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to reset all variations? This action cannot be undone.')) {
                                // Reset variations
                                setEditingProduct({
                                  ...editingProduct,
                                  has_variations: false,
                                  variation_type: '',
                                  variation_name: '',
                                  variation_options: []
                                });
                                toast.success('Variations reset');
                              }
                            }}
                          >
                            🗑️ Reset Variations
                          </button>
                        </div>
                        
                        <div className="current-variation-info">
                          <p><strong>Current Variation Type:</strong> {
                            editingProduct.variation_type === 'custom' ? editingProduct.variation_name :
                            editingProduct.variation_type === 'color' ? 'Color' :
                            editingProduct.variation_type === 'size' ? 'Size' :
                            editingProduct.variation_type === 'weight' ? 'Weight' : 'Unknown'
                          }</p>
                          <p><strong>Option Count:</strong> {editingProduct.variation_options?.length || 0}</p>
                          <p><strong>Options:</strong> {
                            editingProduct.variation_options?.map(opt => opt.name).join(', ') || 'None'
                          }</p>
                        </div>
                      </>
                    ) : (
                      <div className="no-variation-info">
                        <p>This product has no variations yet. You can add variations by checking the checkbox below.</p>
                      </div>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name</label>
                      <input
                        type="text"
                        value={editingProduct.name || ''}
                        onChange={(e) => {
                          const name = e.target.value;
                          setEditingProduct({
                            ...editingProduct,
                            name,
                            slug: generateSlug(name)
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Slug (auto-generated)</label>
                      <input
                        type="text"
                        value={editingProduct.slug || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, slug: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Description</label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Original Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.original_price || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, original_price: e.target.value})}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Stock Quantity</label>
                      <input
                        type="number"
                        value={editingProduct.stock_quantity || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Category</label>
                    <select
                      value={editingProduct.category_id || ''}
                      onChange={(e) => {
                        console.log('🔄 Category changed:', e.target.value);
                        setEditingProduct({...editingProduct, category_id: e.target.value});
                      }}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <small>Available categories: {categories.length}</small>
                  </div>

                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Product Images (Maximum 10)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 10) {
                          toast.error('Maximum 10 images allowed');
                          return;
                        }
                        if (files.length > 0) {
                          const imageUrls = await handleProductImagesUpload(files);
                          if (imageUrls.length > 0) {
                            setEditingProduct({...editingProduct, images: [...(editingProduct.images || []), ...imageUrls]});
                          }
                        }
                      }}
                      disabled={uploadingProductImages}
                    />
                    {uploadingProductImages && <span>Uploading images...</span>}
                    
                    {/* RESİM EDİT BUTONU - PENCERENIN ÜSTÜNDE GENİŞ */}
                    {editingProduct.images && editingProduct.images.length > 0 && (
                      <div style={{marginTop: '15px', marginBottom: '20px', width: '100%'}}>
                        <button 
                          type="button"
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '15px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            backgroundColor: '#007bff',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => openBackgroundRemovalModal(editingProduct.images, true)}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#0056b3';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#007bff';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                          }}
                        >
                          🎨 Edit Images & Remove Backgrounds
                        </button>
                      </div>
                    )}
                    
                    {editingProduct.images && editingProduct.images.length > 0 && (
                      <div className="image-preview-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gridTemplateRows: 'repeat(2, auto)',
                      gap: '8px',
                      height: '200px',
                      maxWidth: '600px',
                      padding: '10px',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      background: '#f8f9fa'
                    }}>
                        {editingProduct.images.map((imageUrl, index) => (
                          <div key={index} className="image-preview-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', margin: '0'}}>
                            <div className="image-container" style={{margin: '0', padding: '0'}}>
                              <img 
                                src={imageUrl} 
                                alt={`Product ${index + 1}`}
                                style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  objectFit: 'contain', 
                                  borderRadius: '4px', 
                                  padding: '2px',
                                margin: '0', /* TÜM MARGİNLERİ KALDIR */
                                marginBottom: '0',
                                  border: '1px solid #ddd'
                                }}
                              />
                            </div>
                            
                            <div className="image-actions" style={{margin: '0', padding: '0'}}>
                              <button 
                                type="button"
                                className="btn btn-sm btn-danger"
                                                                style={{
                                margin: '0',
                                padding: '1px 4px', /* DAHA KÜÇÜK PADDİNG */
                                fontSize: '9px', /* DAHA KÜÇÜK FONT */
                                lineHeight: '1.1',
                                minHeight: 'auto'
                              }}
                                onClick={() => {
                                  const newImages = editingProduct.images.filter((_, i) => i !== index);
                                  setEditingProduct({...editingProduct, images: newImages});
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Product Video (Optional)</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const videoUrl = await handleProductVideoUpload(file);
                          if (videoUrl) {
                            setEditingProduct({...editingProduct, video_url: videoUrl});
                          }
                        }
                      }}
                      disabled={uploadingProductVideo}
                    />
                    {uploadingProductVideo && <span>Uploading video...</span>}
                    {editingProduct.video_url && (
                      <div className="video-preview">
                        <video 
                          src={editingProduct.video_url} 
                          controls
                          style={{ width: '200px', height: '120px', borderRadius: '4px' }}
                        />
                        <button 
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setEditingProduct({...editingProduct, video_url: ''})}
                        >
                          Remove Video
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Weight (grams)</label>
                      <input
                        type="number"
                        value={editingProduct.weight || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                        placeholder="500"
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Dimensions (LxWxH cm)</label>
                      <input
                        type="text"
                        value={editingProduct.dimensions || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, dimensions: e.target.value})}
                        placeholder="20x15x10"
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Material</label>
                      <input
                        type="text"
                        value={editingProduct.material || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                        placeholder="Cotton, Polyester, etc."
                      />
                    </div>
                  </div>

                  {/* Variation Addition/Editing */}
                  <div className="variation-setup">
                    <h4>🎨 Variation Management</h4>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                        <input
                          type="checkbox"
                          checked={editingProduct.has_variations || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setEditingProduct({
                              ...editingProduct,
                              has_variations: isChecked,
                              variation_type: isChecked ? 'color' : '',
                              variation_name: '',
                              variation_options: isChecked ? [{ name: '', price_modifier: 0, stock: 0, images: [] }] : []
                            });
                          }}
                        />
                        Add variations for this product (color, size, weight, etc.)
                      </label>
                    </div>
                    
                    {/* Variation Type Selection */}
                    {editingProduct.has_variations && (
                      <div className="variation-type-selection">
                        <div className="form-group" style={{marginBottom: '0.3rem'}}>
                          <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Variation Type</label>
                          <select
                            value={editingProduct.variation_type || ''}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                variation_type: newType,
                                variation_name: newType === 'custom' ? editingProduct.variation_name : '',
                                variation_options: newType ? [{ name: '', price_modifier: 0, stock: 0, images: [] }] : []
                              });
                            }}
                          >
                            <option value="">Select</option>
                            <option value="color">Color</option>
                            <option value="size">Size</option>
                            <option value="weight">Weight</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        
                        {editingProduct.variation_type === 'custom' && (
                          <div className="form-group" style={{marginBottom: '0.3rem'}}>
                            <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Custom Variation Name</label>
                            <input
                              type="text"
                              value={editingProduct.variation_name || ''}
                              onChange={(e) => setEditingProduct({
                                ...editingProduct,
                                variation_name: e.target.value
                              })}
                              placeholder="e.g.: Material, Style, Pattern"
                            />
                          </div>
                        )}
                        
                        {/* Variation Options */}
                        {editingProduct.variation_type && (
                                                      <div className="variation-options-setup">
                              <h5>Variation Options</h5>
                              <p>Add options for each variation:</p>
                              
                              {/* Column Headers */}
                              <div style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                                marginBottom: '10px',
                                flexWrap: 'wrap',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                color: '#555'
                              }}>
                                <div style={{ width: '140px' }}>Option Name</div>
                                <div style={{ width: '90px' }}>Price Difference</div>
                                <div style={{ width: '70px' }}>Stock</div>
                                <div style={{ width: '30px' }}></div>
                              </div>
                              
                              {(editingProduct.variation_options || []).map((option, index) => (
                                <div key={index} className="variation-option-item" style={{
                                  display: 'flex',
                                  gap: '10px',
                                  alignItems: 'center',
                                  marginBottom: '10px',
                                  flexWrap: 'wrap'
                                }}>
                                  <input
                                    type="text"
                                    value={option.name || ''}
                                    onChange={(e) => {
                                      const newOptions = [...(editingProduct.variation_options || [])];
                                      newOptions[index] = { ...option, name: e.target.value };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    placeholder="Option name"
                                    style={{ width: '140px', fontSize: '14px' }}
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={option.price_modifier || 0}
                                    onChange={(e) => {
                                      const newOptions = [...(editingProduct.variation_options || [])];
                                      newOptions[index] = { ...option, price_modifier: parseFloat(e.target.value) || 0 };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    placeholder="Price diff"
                                    style={{ width: '90px', fontSize: '14px' }}
                                  />
                                  <input
                                    type="number"
                                    value={option.stock || 0}
                                    onChange={(e) => {
                                      const newOptions = [...(editingProduct.variation_options || [])];
                                      newOptions[index] = { ...option, stock: parseInt(e.target.value) || 0 };
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    placeholder="Stock"
                                    style={{ width: '70px', fontSize: '14px' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                      const newOptions = editingProduct.variation_options.filter((_, i) => i !== index);
                                      setEditingProduct({
                                        ...editingProduct,
                                        variation_options: newOptions
                                      });
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const newOptions = [...(editingProduct.variation_options || [])];
                                newOptions.push({ name: '', price_modifier: 0, stock: 0, images: [] });
                                setEditingProduct({
                                  ...editingProduct,
                                  variation_options: newOptions
                                });
                              }}
                            >
                              Add Variation Option
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h4>Product Specifications</h4>
                    <div className="form-row">
                      <div className="form-group" style={{marginBottom: '0.3rem'}}>
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Weight</label>
                        <input
                          type="text"
                          value={editingProduct.weight || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                          placeholder="e.g.: 1.5kg, 250g"
                        />
                      </div>
                      <div className="form-group" style={{marginBottom: '0.3rem'}}>
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Dimensions</label>
                        <input
                          type="text"
                          value={editingProduct.dimensions || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, dimensions: e.target.value})}
                          placeholder="e.g.: 30x20x10 cm"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Material</label>
                      <input
                        type="text"
                        value={editingProduct.material || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                        placeholder="e.g.: Plastic, Metal, Wood"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                        <input
                          type="checkbox"
                          checked={editingProduct.is_featured || false}
                          onChange={(e) => setEditingProduct({...editingProduct, is_featured: e.target.checked})}
                        />
                        Featured Product
                      </label>
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                        <input
                          type="checkbox"
                          checked={editingProduct.is_active || false}
                          onChange={(e) => setEditingProduct({...editingProduct, is_active: e.target.checked})}
                        />
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">
                      Update Product
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <div className="section-header">
            <h2>Users Management</h2>
            <p>Manage and view user accounts - Total: {userPagination.total} users</p>
          </div>
          
          {/* Filters */}
          <div className="users-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Username, email, name..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>Type:</label>
                <select
                  value={userFilters.is_admin}
                  onChange={(e) => setUserFilters({...userFilters, is_admin: e.target.value})}
                >
                  <option value="">All Users</option>
                  <option value="true">Admin Users</option>
                  <option value="false">Regular Users</option>
                </select>
              </div>
              <div className="filter-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleFilterUsers}
                >
                  Filter
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearUserFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>
                        <span className={`badge ${user.is_admin ? 'admin' : 'user'}`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>{user.total_orders || 0}</td>
                      <td>${user.total_spent?.toFixed(2) || '0.00'}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => fetchUserDetails(user.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => setEditingUser(user)}
                          >
                            Edit
                          </button>
                          {!user.is_admin && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userPagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleUserPageChange(userPagination.page - 1)}
                disabled={!userPagination.has_prev}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {userPagination.page} of {userPagination.pages}
              </span>
              
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleUserPageChange(userPagination.page + 1)}
                disabled={!userPagination.has_next}
              >
                Next
              </button>
            </div>
          )}

          {/* User Details Modal */}
          {showUserDetails && selectedUser && (
            <div className="modal-overlay">
              <div className="modal-content user-details-modal">
                <div className="modal-header">
                  <h3>User Details</h3>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUser(null);
                    }}
                  >
                    Close
                  </button>
                </div>
                
                <div className="user-details-content">
                  <div className="user-info">
                    <h4>Personal Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Username:</label>
                        <span>{selectedUser.user.username}</span>
                      </div>
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Email:</label>
                        <span>{selectedUser.user.email}</span>
                      </div>
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name:</label>
                        <span>{selectedUser.user.first_name} {selectedUser.user.last_name}</span>
                      </div>
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Phone:</label>
                        <span>{selectedUser.user.phone || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Role:</label>
                        <span className={`badge ${selectedUser.user.is_admin ? 'admin' : 'user'}`}>
                          {selectedUser.user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Join Date:</label>
                        <span>{new Date(selectedUser.user.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Last Login:</label>
                        <span>{selectedUser.user.last_login ? new Date(selectedUser.user.last_login).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="user-stats">
                    <h4>Statistics</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Total Orders:</label>
                        <span>{selectedUser.user.total_orders}</span>
                      </div>
                      <div className="stat-item">
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Total Spent:</label>
                        <span>${selectedUser.user.total_spent?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedUser.orders && selectedUser.orders.length > 0 && (
                    <div className="user-orders">
                      <h4>Recent Orders</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.orders.map(order => (
                            <tr key={order.id}>
                              <td>#{order.order_number || order.id}</td>
                              <td>${order.total_amount?.toFixed(2)}</td>
                              <td>
                                <span className={`badge ${order.status}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                    <div className="user-addresses">
                      <h4>Addresses</h4>
                      <div className="addresses-grid">
                        {selectedUser.addresses.map(address => (
                          <div key={address.id} className="address-item">
                            <div className="address-header">
                              <strong>{address.title}</strong>
                              {address.is_default && <span className="badge default">Default</span>}
                            </div>
                            <div className="address-details">
                              <p>{address.address_line1}</p>
                              {address.address_line2 && <p>{address.address_line2}</p>}
                              <p>{address.city}, {address.state} {address.postal_code}</p>
                              <p>{address.country}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {editingUser && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Edit User</h3>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateUser(editingUser.id, editingUser);
                }}>
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Username</label>
                      <input
                        type="text"
                        value={editingUser.username || ''}
                        onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Email</label>
                      <input
                        type="email"
                        value={editingUser.email || ''}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>First Name</label>
                      <input
                        type="text"
                        value={editingUser.first_name || ''}
                        onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Last Name</label>
                      <input
                        type="text"
                        value={editingUser.last_name || ''}
                        onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Phone</label>
                      <input
                        type="text"
                        value={editingUser.phone || ''}
                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Address</label>
                      <input
                        type="text"
                        value={editingUser.address || ''}
                        onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                      <input
                        type="checkbox"
                        checked={editingUser.is_admin || false}
                        onChange={(e) => setEditingUser({...editingUser, is_admin: e.target.checked})}
                      />
                      Admin User
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Update User
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <CategoryManagement />
      )}

      {activeTab === 'variations' && (
        <div className="variations-content">
          <div className="section-header">
            <h2>Product Variations Management</h2>
            <p>Manage details of products with variations (price, stock, images, etc.)</p>
          </div>

          <div className="variation-products">
            <h3>Products with Variations</h3>
            
            {products.filter(product => product.has_variations).length === 0 ? (
              <div className="no-variation-products">
                <p>No products with variations yet. When adding products, check "This product has variations" option.</p>
              </div>
            ) : (
              <div className="variation-products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variation Type</th>
                      <th>Images</th>
                      <th>Options</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(product => product.has_variations).map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-info">
                            <strong>{product.name}</strong>
                            <br />
                            <small>Base Price: ${product.price}</small>
                          </div>
                        </td>
                        <td>
                          <span className="variation-type-badge">
                            {product.variation_type === 'color' && 'Color'}
                            {product.variation_type === 'size' && 'Size'}
                            {product.variation_type === 'weight' && 'Weight'}
                            {product.variation_type === 'custom' && product.variation_name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="product-image-status">
                            {product.images && product.images.length > 0 ? (
                              <>
                                <span className="image-icon image-status-has-images">📷</span>
                                <span className="image-count">
                                  {product.images.length}
                                </span>
                              </>
                            ) : (
                              <span className="image-icon image-status-no-images" title="No images">📷❌</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="variation-options-preview">
                            {product.variation_options && product.variation_options.length > 0 ? (
                              product.variation_options.map((option, index) => (
                                <span key={index} className="option-tag">
                                  {option.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted">No options added yet</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => setSelectedProductForVariations(product)}
                          >
                            Manage Variations
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="section-header">
            <h2>Variations Management</h2>
            <button 
              className="btn btn-primary"
              onClick={() => document.getElementById('add-variation-type-form').scrollIntoView()}
            >
              Add Variation Type
            </button>
          </div>
          
          <div className="variations-tables">
            <div className="variation-types">
              <h3>Variation Types</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Options</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variationTypes.map(type => (
                    <tr key={type.id}>
                      <td>{type.name}</td>
                      <td>{type.slug}</td>
                      <td>{variationOptions.filter(opt => opt.variation_type_id === type.id).length}</td>
                      <td>
                        <span className={`badge ${type.is_active ? 'active' : 'inactive'}`}>
                          {type.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => setEditingVariationType(type)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteVariationType(type.id)}
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

            {/* Add Variation Type Form */}
            <div id="add-variation-type-form" className="add-variation-type-form">
              <h3>Add New Variation Type</h3>
              <form onSubmit={createVariationType}>
                <div className="form-row">
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name</label>
                    <input
                      type="text"
                      value={newVariationType.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewVariationType({
                          ...newVariationType,
                          name,
                          slug: generateSlug(name)
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Slug (auto-generated)</label>
                    <input
                      type="text"
                      value={newVariationType.slug}
                      onChange={(e) => setNewVariationType({...newVariationType, slug: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Description</label>
                  <textarea
                    value={newVariationType.description}
                    onChange={(e) => setNewVariationType({...newVariationType, description: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                    <input
                      type="checkbox"
                      checked={newVariationType.is_active}
                      onChange={(e) => setNewVariationType({...newVariationType, is_active: e.target.checked})}
                    />
                    Active
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">
                  Create Variation Type
                </button>
              </form>
            </div>

            {/* Edit Variation Type Modal */}
            {editingVariationType && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Edit Variation Type</h3>
                  <form onSubmit={updateVariationType}>
                    <div className="form-row">
                      <div className="form-group" style={{marginBottom: '0.3rem'}}>
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name</label>
                        <input
                          type="text"
                          value={editingVariationType.name || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            setEditingVariationType({
                              ...editingVariationType,
                              name,
                              slug: generateSlug(name)
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group" style={{marginBottom: '0.3rem'}}>
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Slug (auto-generated)</label>
                        <input
                          type="text"
                          value={editingVariationType.slug || ''}
                          onChange={(e) => setEditingVariationType({...editingVariationType, slug: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Description</label>
                      <textarea
                        value={editingVariationType.description || ''}
                        onChange={(e) => setEditingVariationType({...editingVariationType, description: e.target.value})}
                        rows="3"
                      />
                    </div>

                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                        <input
                          type="checkbox"
                          checked={editingVariationType.is_active || false}
                          onChange={(e) => setEditingVariationType({...editingVariationType, is_active: e.target.checked})}
                        />
                        Active
                      </label>
                    </div>

                    <div className="modal-actions">
                      <button type="submit" className="btn btn-primary">
                        Update Variation Type
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setEditingVariationType(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Product Variation Management Modal */}
            {selectedProductForVariations && (
              <div className="modal-overlay" onClick={() => setSelectedProductForVariations(null)}>
                <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{selectedProductForVariations.name} - Variation Management</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setSelectedProductForVariations(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="variation-management">
                    <p>
                      <strong>Variation Type:</strong> {' '}
                      {selectedProductForVariations.variation_type === 'color' && 'Color'}
                      {selectedProductForVariations.variation_type === 'size' && 'Size'}
                      {selectedProductForVariations.variation_type === 'weight' && 'Weight'}
                      {selectedProductForVariations.variation_type === 'custom' && selectedProductForVariations.variation_name}
                    </p>
                    
                    <div className="variation-options-management">
                      <h4>Variation Options</h4>
                      
                      {selectedProductForVariations.variation_options && selectedProductForVariations.variation_options.map((option, index) => (
                        <div key={index} className="variation-option-card">
                          <div className="option-header">
                            <h5>{option.name}</h5>
                          </div>
                          
                          <div className="option-details">
                            <div className="form-row">
                              <div className="form-group" style={{marginBottom: '0.3rem'}}>
                                <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Price Difference</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={option.price_modifier || 0}
                                  onChange={(e) => {
                                    const newOptions = [...selectedProductForVariations.variation_options];
                                    newOptions[index].price_modifier = parseFloat(e.target.value) || 0;
                                    setSelectedProductForVariations({
                                      ...selectedProductForVariations,
                                      variation_options: newOptions
                                    });
                                  }}
                                  placeholder="0.00"
                                />
                                <small>Amount to add/subtract from base price</small>
                              </div>
                              
                              <div className="form-group" style={{marginBottom: '0.3rem'}}>
                                <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Stock</label>
                                <input
                                  type="number"
                                  value={option.stock || 0}
                                  onChange={(e) => {
                                    const newOptions = [...selectedProductForVariations.variation_options];
                                    newOptions[index].stock = parseInt(e.target.value) || 0;
                                    setSelectedProductForVariations({
                                      ...selectedProductForVariations,
                                      variation_options: newOptions
                                    });
                                  }}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            
                            <div className="form-group" style={{marginBottom: '0.3rem'}}>
                              <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Images Specific to This Option</label>
                              <div className="custom-file-input">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={async (e) => {
                                    const files = Array.from(e.target.files);
                                    if (files.length > 0) {
                                      const imageUrls = await handleProductImagesUpload(files);
                                      if (imageUrls.length > 0) {
                                        const newOptions = [...selectedProductForVariations.variation_options];
                                        newOptions[index].images = [...(newOptions[index].images || []), ...imageUrls];
                                        setSelectedProductForVariations({
                                          ...selectedProductForVariations,
                                          variation_options: newOptions
                                        });
                                      }
                                    }
                                  }}
                                />
                                <div className={`custom-file-button ${option.images && option.images.length > 0 ? 'file-selected' : ''}`}>
                                  {option.images && option.images.length > 0 ? `${option.images.length} image(s)` : 'Choose Images'}
                                </div>
                              </div>
                              
                              {option.images && option.images.length > 0 && (
                                <div className="option-images">
                                  {option.images.map((imageUrl, imgIndex) => (
                                    <div key={imgIndex} className="option-image">
                                      <img src={imageUrl} alt={`${option.name} ${imgIndex + 1}`} />
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                          const newOptions = [...selectedProductForVariations.variation_options];
                                          newOptions[index].images = newOptions[index].images.filter((_, i) => i !== imgIndex);
                                          setSelectedProductForVariations({
                                            ...selectedProductForVariations,
                                            variation_options: newOptions
                                          });
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setSelectedProductForVariations(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => saveProductVariations(selectedProductForVariations)}
                      >
                        Save Variations
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-content">
          <div className="section-header">
            <h2>Orders Management</h2>
            <p>View and manage customer orders - Total: {orderPagination.total} orders</p>
          </div>
          
          {/* Filters */}
          <div className="orders-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Order number, customer email..."
                  value={orderFilters.search}
                  onChange={(e) => setOrderFilters({...orderFilters, search: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={orderFilters.status}
                  onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Payment:</label>
                <select
                  value={orderFilters.payment_status}
                  onChange={(e) => setOrderFilters({...orderFilters, payment_status: e.target.value})}
                >
                  <option value="">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-group">
                <label>From Date:</label>
                <input
                  type="date"
                  value={orderFilters.date_from}
                  onChange={(e) => setOrderFilters({...orderFilters, date_from: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>To Date:</label>
                <input
                  type="date"
                  value={orderFilters.date_to}
                  onChange={(e) => setOrderFilters({...orderFilters, date_to: e.target.value})}
                />
              </div>
              <div className="filter-actions">
                <button className="btn btn-primary" onClick={handleFilterOrders}>
                  🔍 Filter
                </button>
                <button className="btn btn-secondary" onClick={handleClearFilters}>
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>
          
          {/* Orders Table */}
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Items</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.order_number || order.id}</strong>
                      </td>
                      <td>
                        <div className="customer-info">
                          <strong>{order.user?.first_name} {order.user?.last_name}</strong>
                          <small>{order.user?.email}</small>
                        </div>
                      </td>
                      <td>
                        <strong>${order.total_amount?.toFixed(2)}</strong>
                        <small>
                          <div>Subtotal: ${order.subtotal?.toFixed(2)}</div>
                          <div>Shipping: ${order.shipping_cost?.toFixed(2)}</div>
                          <div>Tax: ${order.tax_amount?.toFixed(2)}</div>
                        </small>
                      </td>
                      <td>
                        <span className="items-count">{order.items?.length || 0} items</span>
                      </td>
                      <td>
                        <select
                          className={`status-select ${getStatusBadgeClass(order.status)}`}
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="return_requested">Return Requested</option>
                          <option value="returned">Returned</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className={`payment-select ${getPaymentStatusBadgeClass(order.payment_status)}`}
                          value={order.payment_status}
                          onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="cash_on_delivery">Cash on Delivery</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td>
                        <div className="date-info">
                          <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                          <small>{new Date(order.created_at).toLocaleTimeString()}</small>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewOrderDetails(order.id)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleCreateInvoiceFromOrder(order.id)}
                            title="Create Invoice"
                          >
                            🧾
                          </button>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => handleSendOrderEmail(order)}
                            title="Send Order Email"
                          >
                            📧
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      <div className="empty-message">
                        <h3>No orders found</h3>
                        <p>No orders match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {orderPagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-sm btn-outline"
                disabled={orderPagination.page <= 1}
                onClick={() => handleOrderPageChange(orderPagination.page - 1)}
              >
                ← Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(orderPagination.pages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`btn btn-sm ${page === orderPagination.page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleOrderPageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                className="btn btn-sm btn-outline"
                disabled={orderPagination.page >= orderPagination.pages}
                onClick={() => handleOrderPageChange(orderPagination.page + 1)}
              >
                Next →
              </button>
              
              <span className="pagination-info">
                Page {orderPagination.page} of {orderPagination.pages} 
                ({orderPagination.total} total orders)
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="returns-content">
          <div className="section-header">
            <h2>Return Requests Management</h2>
            <p>View and manage customer return requests - Total: {returnPagination.total} requests</p>
          </div>
          
          {/* Return Filters */}
          <div className="returns-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Order number, customer email..."
                  value={returnFilters.search}
                  onChange={(e) => setReturnFilters({...returnFilters, search: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>Return Status:</label>
                <select
                  value={returnFilters.status}
                  onChange={(e) => setReturnFilters({...returnFilters, status: e.target.value})}
                >
                  <option value="">All Return Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
              <div className="filter-actions">
                <button className="btn btn-primary" onClick={handleFilterReturns}>
                  🔍 Filter
                </button>
                <button className="btn btn-secondary" onClick={handleClearReturnFilters}>
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>
          
          {/* Return Requests Table */}
          <div className="returns-table">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Return Status</th>
                  <th>Reason</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returnRequests.length > 0 ? (
                  returnRequests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <strong>#{request.order_number || request.id}</strong>
                      </td>
                      <td>
                        <div className="customer-info">
                          <strong>{request.user?.first_name} {request.user?.last_name}</strong>
                          <small>{request.user?.email}</small>
                        </div>
                      </td>
                      <td>
                        <strong>${request.total_amount?.toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`return-status-badge ${getReturnStatusBadgeClass(request.return_status)}`}>
                          {request.return_status?.charAt(0).toUpperCase() + request.return_status?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="return-reason">
                          <strong>{request.return_reason}</strong>
                          {request.return_notes && (
                            <small title={request.return_notes}>
                              {request.return_notes.length > 50 
                                ? request.return_notes.substring(0, 50) + '...' 
                                : request.return_notes}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <strong>{new Date(request.return_requested_at).toLocaleDateString()}</strong>
                          <small>{new Date(request.return_requested_at).toLocaleTimeString()}</small>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {request.return_status === 'requested' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleProcessReturnRequest(request.id, 'approve')}
                                title="Approve Return"
                              >
                                ✅ Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleProcessReturnRequest(request.id, 'deny')}
                                title="Deny Return"
                              >
                                ❌ Deny
                              </button>
                            </>
                          )}
                          {request.return_status === 'approved' && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleCompleteReturn(request.id)}
                              title="Mark as Returned"
                            >
                              📦 Complete Return
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => handleViewOrderDetails(request.id)}
                            title="View Order Details"
                          >
                            👁️ Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div className="empty-message">
                        <h3>No return requests found</h3>
                        <p>No return requests match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Return Pagination */}
          {returnPagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-sm btn-outline"
                disabled={returnPagination.page <= 1}
                onClick={() => handleReturnPageChange(returnPagination.page - 1)}
              >
                ← Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(returnPagination.pages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`btn btn-sm ${page === returnPagination.page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleReturnPageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                className="btn btn-sm btn-outline"
                disabled={returnPagination.page >= returnPagination.pages}
                onClick={() => handleReturnPageChange(returnPagination.page + 1)}
              >
                Next →
              </button>
              
              <span className="pagination-info">
                Page {returnPagination.page} of {returnPagination.pages} 
                ({returnPagination.total} total requests)
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-content">
          <div className="section-header">
            <h2>Messages</h2>
            <p>View and manage customer messages.</p>
          </div>
          
          <div className="messages-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(message => (
                  <tr key={message.id}>
                    <td>{message.name}</td>
                    <td>{message.email}</td>
                    <td>{message.subject}</td>
                    <td>{new Date(message.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${message.is_read ? 'read' : 'unread'}`}>
                        {message.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => console.log('View message:', message.id)}
                        >
                          View
                        </button>
                        {!message.is_read && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleMarkMessageRead(message.id)}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advanced Categories */}
      {activeTab === 'advanced-categories' && (
        <CategoryManagement />
      )}

      {/* Category Analytics */}
      {activeTab === 'category-analytics' && (
        <CategoryAnalytics />
      )}

      {activeTab === 'site-settings' && (
        <SiteSettings2 />
      )}

      {activeTab === 'theme-testing' && (
        <ResponsiveThemeTest />
      )}

      {activeTab === 'theme-builder' && (
        <ThemeBuilder 
          onThemeCreate={(theme) => {
            toast.success('Theme created successfully!');
            console.log('New theme created:', theme);
          }}
          onThemeUpdate={(theme) => {
            toast.success('Theme updated successfully!');
            console.log('Theme updated:', theme);
          }}
        />
      )}

      {activeTab === 'menu-settings' && (
        <MenuSettings />
      )}

      {activeTab === 'general-settings' && (
        <GeneralSettings />
      )}

      {activeTab === 'information-settings' && (
        <InformationSettings />
      )}

      {activeTab === 'blog' && (
        <BlogManagement />
      )}

      {activeTab === 'invoices' && (
        <div className="invoices-content">
          <div className="section-header">
            <h2>Invoice Management</h2>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('create-invoice-form').scrollIntoView()}
              >
                Create Invoice
              </button>
            </div>
          </div>

          {/* Invoice Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Invoices</h3>
              <span className="stat-number">{invoiceStats.total_invoices}</span>
            </div>
            <div className="stat-card">
              <h3>Total Amount</h3>
              <span className="stat-number">${invoiceStats.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="stat-card">
              <h3>Pending Invoices</h3>
              <span className="stat-number">{invoiceStats.pending_invoices}</span>
            </div>
            <div className="stat-card">
              <h3>Paid Invoices</h3>
              <span className="stat-number">{invoiceStats.paid_invoices}</span>
            </div>
          </div>

          {/* Invoice Filters */}
          <div className="filters-section">
            <h3>Filter Invoices</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={invoiceFilters.status}
                  onChange={(e) => setInvoiceFilters({...invoiceFilters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Search by invoice number or customer..."
                  value={invoiceFilters.search}
                  onChange={(e) => setInvoiceFilters({...invoiceFilters, search: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>From Date:</label>
                <input
                  type="date"
                  value={invoiceFilters.date_from}
                  onChange={(e) => setInvoiceFilters({...invoiceFilters, date_from: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>To Date:</label>
                <input
                  type="date"
                  value={invoiceFilters.date_to}
                  onChange={(e) => setInvoiceFilters({...invoiceFilters, date_to: e.target.value})}
                />
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-primary" onClick={handleFilterInvoices}>
                Apply Filters
              </button>
              <button className="btn btn-secondary" onClick={handleClearInvoiceFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Invoice List */}
          <div className="invoices-table">
            <h3>Invoices ({invoicePagination.total} total)</h3>
            {loadingInvoices ? (
              <div className="loading-message">Loading invoices...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_number}</td>
                      <td>
                        {invoice.customer_name}<br />
                        <small>{invoice.customer_email}</small>
                      </td>
                      <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td>${invoice.total_amount?.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getInvoiceStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-small btn-info"
                            onClick={() => fetchInvoiceDetails(invoice.id)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-small btn-primary"
                            onClick={() => handleDownloadInvoicePDF(invoice.id)}
                            title="Download PDF"
                          >
                            📄
                          </button>
                          <button 
                            className="btn-small btn-warning"
                            onClick={() => {
                              setEditingInvoice(invoice);
                              setShowInvoiceDetails(false);
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {invoice.status === 'draft' && (
                            <button 
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {invoicePagination.pages > 1 && (
              <div className="pagination">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleInvoicePageChange(invoicePagination.page - 1)}
                  disabled={invoicePagination.page === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {invoicePagination.page} of {invoicePagination.pages}
                </span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleInvoicePageChange(invoicePagination.page + 1)}
                  disabled={invoicePagination.page === invoicePagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Create Invoice Form */}
          <div id="create-invoice-form" className="form-section">
            <h3>Create New Invoice</h3>
            <form onSubmit={handleCreateInvoice}>
              <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Order ID (Optional):</label>
                  <input
                    type="text"
                    value={newInvoice.order_id}
                    onChange={(e) => setNewInvoice({...newInvoice, order_id: e.target.value})}
                    placeholder="Enter order ID to create invoice from order"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Name:</label>
                  <input
                    type="text"
                    value={newInvoice.customer_name}
                    onChange={(e) => setNewInvoice({...newInvoice, customer_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Email:</label>
                  <input
                    type="email"
                    value={newInvoice.customer_email}
                    onChange={(e) => setNewInvoice({...newInvoice, customer_email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Phone:</label>
                  <input
                    type="text"
                    value={newInvoice.customer_phone}
                    onChange={(e) => setNewInvoice({...newInvoice, customer_phone: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Tax Number:</label>
                  <input
                    type="text"
                    value={newInvoice.customer_tax_number}
                    onChange={(e) => setNewInvoice({...newInvoice, customer_tax_number: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Customer Address:</label>
                <textarea
                  value={newInvoice.customer_address}
                  onChange={(e) => setNewInvoice({...newInvoice, customer_address: e.target.value})}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                  rows="2"
                  placeholder="Optional notes for the invoice"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoiceDetails(false)}>
          <div className="modal-content invoice-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invoice Details - {selectedInvoice.invoice_number}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowInvoiceDetails(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Invoice Summary */}
              <div className="invoice-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Invoice Date:</label>
                    <span>{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Due Date:</label>
                    <span>{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Status:</label>
                    <span className={`status-badge ${getInvoiceStatusBadgeClass(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Payment Status:</label>
                    <span className={`status-badge ${selectedInvoice.payment_status === 'paid' ? 'status-badge-success' : 'status-badge-warning'}`}>
                      {selectedInvoice.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="customer-section">
                <h3>Customer Information</h3>
                <div className="customer-details">
                  <div className="detail-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name:</label>
                    <span>{selectedInvoice.customer_name}</span>
                  </div>
                  <div className="detail-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Email:</label>
                    <span>{selectedInvoice.customer_email}</span>
                  </div>
                  <div className="detail-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Phone:</label>
                    <span>{selectedInvoice.customer_phone || 'Not provided'}</span>
                  </div>
                  {selectedInvoice.billing_address && (
                    <div className="detail-row">
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Address:</label>
                      <span style={{whiteSpace: 'pre-line'}}>{selectedInvoice.billing_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="items-section">
                <h3>Invoice Items ({selectedInvoice.invoice_items?.length || 0} items)</h3>
                <div className="items-list">
                  {selectedInvoice.invoice_items?.map((item, index) => (
                    <div key={index} className="invoice-item">
                      <div className="item-details">
                        <h4>{item.product_name}</h4>
                        <p>{item.product_description}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Unit Price: ${item.unit_price?.toFixed(2)}</p>
                        <p>Tax Rate: {(item.tax_rate * 100).toFixed(0)}%</p>
                        <p><strong>Line Total: ${item.line_total?.toFixed(2)}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="totals-section">
                <h3>Invoice Totals</h3>
                <div className="totals-grid">
                  <div className="total-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Subtotal:</label>
                    <span>${selectedInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Sales Tax ({(selectedInvoice.tax_rate * 100).toFixed(0)}%):</label>
                    <span>${selectedInvoice.tax_amount?.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount_amount > 0 && (
                    <div className="total-row">
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Discount:</label>
                      <span>-${selectedInvoice.discount_amount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="total-row final-total">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}><strong>Total:</strong></label>
                    <span><strong>${selectedInvoice.total_amount?.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="notes-section">
                  <h3>Notes</h3>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleDownloadInvoicePDF(selectedInvoice.id)}
                >
                  Download PDF
                </button>
                <button 
                  className="btn btn-info"
                  onClick={() => window.open(`/api/invoices/${selectedInvoice.id}/preview-pdf`, '_blank')}
                >
                  Preview PDF
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => {
                    setEditingInvoice(selectedInvoice);
                    setShowInvoiceDetails(false);
                  }}
                >
                  Edit Invoice
                </button>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowInvoiceDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Edit Modal */}
      {editingInvoice && (
        <div className="modal-overlay" onClick={() => setEditingInvoice(null)}>
          <div className="modal-content invoice-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Invoice - {editingInvoice.invoice_number}</h2>
              <button 
                className="close-btn"
                onClick={() => setEditingInvoice(null)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateInvoice}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Status:</label>
                    <select
                      value={editingInvoice.status}
                      onChange={(e) => setEditingInvoice({...editingInvoice, status: e.target.value})}
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Payment Status:</label>
                    <select
                      value={editingInvoice.payment_status}
                      onChange={(e) => setEditingInvoice({...editingInvoice, payment_status: e.target.value})}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Name:</label>
                    <input
                      type="text"
                      value={editingInvoice.customer_name}
                      onChange={(e) => setEditingInvoice({...editingInvoice, customer_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Email:</label>
                    <input
                      type="email"
                      value={editingInvoice.customer_email}
                      onChange={(e) => setEditingInvoice({...editingInvoice, customer_email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Customer Phone:</label>
                    <input
                      type="text"
                      value={editingInvoice.customer_phone || ''}
                      onChange={(e) => setEditingInvoice({...editingInvoice, customer_phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Due Date:</label>
                    <input
                      type="date"
                      value={editingInvoice.due_date ? editingInvoice.due_date.split('T')[0] : ''}
                      onChange={(e) => setEditingInvoice({...editingInvoice, due_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Billing Address:</label>
                  <textarea
                    value={editingInvoice.billing_address || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, billing_address: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Notes:</label>
                  <textarea
                    value={editingInvoice.notes || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, notes: e.target.value})}
                    rows="2"
                    placeholder="Customer notes"
                  />
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Internal Notes:</label>
                  <textarea
                    value={editingInvoice.internal_notes || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, internal_notes: e.target.value})}
                    rows="2"
                    placeholder="Internal notes (not visible to customer)"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingInvoice(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.order_number || selectedOrder.id}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowOrderDetails(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Order Summary */}
              <div className="order-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Order Date:</label>
                    <span>{new Date(selectedOrder.created_at).toLocaleDateString()} at {new Date(selectedOrder.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Order Status:</label>
                    <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status === 'pending' ? 'Pending (Awaiting Processing)' : 
                       selectedOrder.status === 'processing' ? 'Processing' :
                       selectedOrder.status === 'shipped' ? 'Shipped' :
                       selectedOrder.status === 'delivered' ? 'Delivered' :
                       selectedOrder.status === 'cancelled' ? 'Cancelled' : selectedOrder.status}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Payment Status:</label>
                    <span className={`payment-badge ${getPaymentStatusBadgeClass(selectedOrder.payment_status)}`}>
                      {selectedOrder.payment_status === 'pending' ? 'Pending (Awaiting Payment)' : 
                       selectedOrder.payment_status === 'paid' ? 'Paid' :
                       selectedOrder.payment_status === 'cash_on_delivery' ? 'Cash on Delivery' :
                       selectedOrder.payment_status === 'failed' ? 'Failed' : selectedOrder.payment_status}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Payment Method:</label>
                    <span>{selectedOrder.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Credit Card'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="customer-section">
                <h3>Customer Information</h3>
                <div className="customer-details">
                  <div className="detail-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Name:</label>
                    <span>{selectedOrder.user?.first_name} {selectedOrder.user?.last_name}</span>
                  </div>
                  <div className="detail-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Email:</label>
                    <span>{selectedOrder.user?.email}</span>
                  </div>
                  <div className="detail-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Phone:</label>
                    <span>{selectedOrder.user?.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="address-section">
                  <h3>Shipping Address</h3>
                  <div className="address-details">
                    <p><strong>{selectedOrder.shipping_address?.first_name || 'N/A'} {selectedOrder.shipping_address?.last_name || 'N/A'}</strong></p>
                    <p>{selectedOrder.shipping_address?.address_line1 || 'N/A'}</p>
                    {selectedOrder.shipping_address?.address_line2 && <p>{selectedOrder.shipping_address.address_line2}</p>}
                    <p>{selectedOrder.shipping_address?.city || 'N/A'}, {selectedOrder.shipping_address?.postal_code || 'N/A'}</p>
                    <p>{selectedOrder.shipping_address?.country || 'N/A'}</p>
                    {selectedOrder.shipping_address?.phone && <p>Phone: {selectedOrder.shipping_address.phone}</p>}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="items-section">
                <h3>Order Items ({selectedOrder.items?.length || 0} items)</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        {item.product?.image_url ? (
                          <img 
                            src={item.product.image_url.startsWith('http') 
                              ? item.product.image_url 
                              : `http://localhost:5005${item.product.image_url}`
                            } 
                            alt={item.product_name}
                          />
                        ) : (
                          <div className="no-image">📦</div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.product_name}</h4>
                        <p>SKU: {item.product?.slug || 'N/A'}</p>
                        <p>Price: ${item.price?.toFixed(2)}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p><strong>Subtotal: ${item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="totals-section">
                <h3>Order Totals</h3>
                <div className="totals-grid">
                  <div className="total-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Subtotal:</label>
                    <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Shipping:</label>
                    <span>${selectedOrder.shipping_cost?.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Tax:</label>
                    <span>${selectedOrder.tax_amount?.toFixed(2)}</span>
                  </div>
                  <div className="total-row final-total">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}><strong>Total:</strong></label>
                    <span><strong>${selectedOrder.total_amount?.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="notes-section">
                  <h3>Order Notes</h3>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <div className="status-actions">
                <div className="status-group">
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Update Order Status:</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({...selectedOrder, status: e.target.value});
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="return_requested">Return Requested</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div className="status-group">
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Update Payment Status:</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => {
                      handleUpdatePaymentStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({...selectedOrder, payment_status: e.target.value});
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email-management' && (
        <EmailManagement />
      )}

      {/* Order Email Modal */}
      {showOrderEmailModal && selectedOrderForEmail && (
        <div className="modal-overlay" onClick={() => setShowOrderEmailModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📧 Send Email for Order #{selectedOrderForEmail.id}</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowOrderEmailModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-email-form">
                <div className="customer-info">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrderForEmail.user?.first_name} {selectedOrderForEmail.user?.last_name}</p>
                  <p><strong>Email:</strong> {selectedOrderForEmail.user?.email}</p>
                  <p><strong>Order Total:</strong> ${selectedOrderForEmail.total_amount}</p>
                  <p><strong>Order Status:</strong> {selectedOrderForEmail.status}</p>
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Email Template Type:</label>
                  <select
                    value={orderEmailForm.template_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newSubject = '';
                      switch(newType) {
                        case 'order_confirmation':
                          newSubject = `Order Confirmation #${selectedOrderForEmail.id}`;
                          break;
                        case 'shipping_notification':
                          newSubject = `Your Order #${selectedOrderForEmail.id} Has Shipped!`;
                          break;
                        case 'payment_confirmation':
                          newSubject = `Payment Confirmed for Order #${selectedOrderForEmail.id}`;
                          break;
                        case 'order_update':
                          newSubject = `Order #${selectedOrderForEmail.id} - Status Update`;
                          break;
                        default:
                          newSubject = `Order #${selectedOrderForEmail.id} - Update from PEBDEQ`;
                      }
                      setOrderEmailForm({
                        ...orderEmailForm,
                        template_type: newType,
                        subject: newSubject
                      });
                    }}
                  >
                    <option value="order_confirmation">Order Confirmation</option>
                    <option value="shipping_notification">Shipping Notification</option>
                    <option value="payment_confirmation">Payment Confirmation</option>
                    <option value="order_update">Order Status Update</option>
                    <option value="custom">Custom Message</option>
                  </select>
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Email Subject:</label>
                  <input
                    type="text"
                    value={orderEmailForm.subject}
                    onChange={(e) => setOrderEmailForm({
                      ...orderEmailForm,
                      subject: e.target.value
                    })}
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Custom Message (optional):</label>
                  <textarea
                    value={orderEmailForm.custom_message}
                    onChange={(e) => setOrderEmailForm({
                      ...orderEmailForm,
                      custom_message: e.target.value
                    })}
                    placeholder="Add a personal message to include with the template..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={sendOrderEmail}
              >
                📧 Send Email
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOrderEmailModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
          )}

        </div> {/* admin-main kapandı */}
      </div> {/* admin-body kapandı */}

      {/* Background Removal Modal */}
      <BackgroundRemovalModal
        isOpen={backgroundRemovalModalOpen}
        onClose={closeBackgroundRemovalModal}
        images={modalImages}
        onSaveImages={handleModalImagesSave}
        productId={isEditingModalImages ? editingProduct?.id : newProduct?.id}
      />
    </div>
  );
};

export default AdminDashboard; 