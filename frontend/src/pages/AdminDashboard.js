import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import BackgroundRemovalModal from '../components/BackgroundRemovalModal';
import { AIProductModal, AISettingsModal } from '../components/AIProductModal';
import ProductsManager from '../components/ProductsManager';
import CategoryManagement from '../components/CategoryManagement';
import CategoryAnalytics from '../components/CategoryAnalytics';
import BlogManagement from '../components/BlogManagement';
import SiteSettings2 from './SiteSettings2';
import MenuSettings from './MenuSettings';
import GeneralSettings from './GeneralSettings';
import InformationSettings from './InformationSettings';

import { useTheme } from '../contexts/SiteSettingsContext';
import EmailManagement from './EmailManagement';
import NewsletterManagement from './NewsletterManagement';
import NewsletterCampaign from './NewsletterCampaign';
import PaymentMethods from './PaymentMethods';
import ShippingManagement from './ShippingManagement';
import ShippingLabelModal from '../components/ShippingLabelModal';
import { createApiUrl } from '../utils/config';
import PageStyleEditor from '../components/PageStyleEditor';
import ThemePackManager from '../components/ThemePackManager';
import WorldMapChart from '../components/WorldMapChart';
import './AdminDashboard.css';

// Theme system removed - using PageStyleEditor instead

// Popup Mode Handler Component - kept for potential future use
// eslint-disable-next-line no-unused-vars
const PopupModeHandler = () => {
  const [isPopupMode, setIsPopupMode] = useState(false);

  useEffect(() => {
    const checkPopupMode = () => {
      try {
        const popupMode = localStorage.getItem('themeBuilderPopup') === 'true';
        setIsPopupMode(popupMode);
      } catch {
        setIsPopupMode(false);
      }
    };

    checkPopupMode();
    
    const handlePopupChange = () => {
      checkPopupMode();
    };

    window.addEventListener('themeBuilderPopupChanged', handlePopupChange);
    window.addEventListener('storage', handlePopupChange);

    return () => {
      window.removeEventListener('themeBuilderPopupChanged', handlePopupChange);
      window.removeEventListener('storage', handlePopupChange);
    };
  }, []);

  if (isPopupMode) {
    return (
      <div style={{ 
        background: 'var(--info-bg, rgba(13, 202, 240, 0.1))',
        border: '1px solid var(--info-color, #0dcaf0)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0',
          color: 'var(--info-color, #0dcaf0)',
          fontSize: '18px'
        }}>
          🚀 Theme Builder Popup Mode Aktif
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
          Theme Builder şu anda popup modunda açık ve tüm sayfalarda kullanılabilir durumda.
          Popup'u kapatmak için popup penceresindeki "Popup Mode" checkbox'ını kapatın.
        </p>
        <div style={{ 
          padding: '12px',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          💡 Popup mode'u kapatırsanız Theme Builder burada tekrar görünecektir.
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        background: 'var(--success-bg, rgba(40, 167, 69, 0.1))',
        border: '1px solid var(--success-color, #28a745)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          margin: '0 0 8px 0',
          color: 'var(--success-color, #28a745)',
          fontSize: '16px'
        }}>
          💡 Theme Management Guide
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>
          <strong>1.</strong> Access theme tools via Site Settings → Theme Panel → <strong>2.</strong> Use floating editors or canvas editor → <strong>3.</strong> Manage custom themes!
        </p>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { customThemes, debugCustomThemes, refreshCustomThemes } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [siteSettingsExpanded, setSiteSettingsExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Handle tab change and close mobile sidebar
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Close mobile sidebar when tab is selected
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen(false);
    }
  };
  
  // Refresh custom themes from server when admin panel loads (once)
  useEffect(() => {
    // Disable auto-refresh on mount to prevent duplicate requests
    // Themes are already loaded by ThemeContext on app start
    console.log('🎨 Admin: Mounted, themes should already be loaded');
  }, []); // Empty dependency to run only once
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
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
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
  
  // Ship order modal states
  const [showShipOrderModal, setShowShipOrderModal] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState(null);

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
    pricing_tiers: [], // [{min_qty: 10, price: 2.50}, {min_qty: 50, price: 2.00}]
    sku: '',
    weight: '',
    dimensions: {length: 0, width: 0, height: 0},
    material: '',
    product_type: 'physical',
    download_file_path: ''
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

  // eslint-disable-next-line no-unused-vars
  const [newVariationOption, setNewVariationOption] = useState({
    variation_type_id: '',
    name: '',
    value: '',
    hex_color: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });

  // eslint-disable-next-line no-unused-vars
  const [editingVariationOption, setEditingVariationOption] = useState(null);
  const [selectedProductForVariations, setSelectedProductForVariations] = useState(null);
  
  // Currency symbol for price displays
  const currencySymbol = '$';

  // Background removal modal states
  const [backgroundRemovalModalOpen, setBackgroundRemovalModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [isEditingModalImages, setIsEditingModalImages] = useState(false);

  // AI Product modal states
  const [aiProductModalOpen, setAiProductModalOpen] = useState(false);
  const [aiSettingsModalOpen, setAiSettingsModalOpen] = useState(false);
  
  // Add Product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);

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
  const [sendingInvoiceEmail, setSendingInvoiceEmail] = useState(false);
  const [invoiceCopyToAdmin, setInvoiceCopyToAdmin] = useState(false);
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

      const response = await fetch(createApiUrl(`api/orders?${queryParams}`), {
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
      // Use public categories endpoint - works for both admin and public
      const response = await fetch(createApiUrl('api/categories'), {
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
      const response = await fetch(createApiUrl('api/admin/messages'), {
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

      const response = await fetch(createApiUrl(`api/invoices?${queryParams}`), {
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
      const response = await fetch(createApiUrl('api/invoices/stats'), {
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
      const response = await fetch(createApiUrl(`api/invoices/${invoiceId}`), {
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
      const response = await fetch(createApiUrl('api/invoices'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newInvoice)
      });
      
      if (response.ok) {
        // Response data not needed, just refresh lists
        await response.json();
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
      const response = await fetch(createApiUrl(`api/invoices/${editingInvoice.id}`), {
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
      const response = await fetch(createApiUrl(`api/invoices/${invoiceId}`), {
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
      const response = await fetch(createApiUrl(`api/admin/orders/${orderId}/create-invoice`), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replaceExisting })
      });
      
      if (response.ok) {
        // Response data not needed, just refresh lists
        await response.json();
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
      const response = await fetch(createApiUrl(`api/invoices/${invoiceId}/download-pdf`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
        const errData = await response.json().catch(() => ({}));
        console.error('PDF download error:', response.status, errData);
        toast.error(errData.error || `PDF download failed (${response.status})`);
      }
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      toast.error('Error downloading invoice PDF: ' + error.message);
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

      const response = await fetch(createApiUrl(`api/admin/users?${queryParams}`), {
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
      const response = await fetch(createApiUrl(`api/admin/users/${userId}`), {
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
      const response = await fetch(createApiUrl(`api/admin/users/${userId}`), {
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
        const response = await fetch(createApiUrl(`api/admin/users/${userId}`), {
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
    if (!name || typeof name !== 'string') {
      return '';
    }
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
        variation_options: filteredVariations,
        sku: newProduct.sku || '',
        weight: parseFloat(newProduct.weight) || 0,
        dimensions: newProduct.dimensions || {length: 0, width: 0, height: 0}
      };

      const response = await fetch(createApiUrl('api/admin/products'), {
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
          pricing_tiers: [],
          sku: '',
          weight: '',
          dimensions: {length: 0, width: 0, height: 0},
          material: '',
          product_type: 'physical',
          download_file_path: ''
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
        variation_options: filteredVariations,
        sku: editingProduct.sku || '',
        weight: parseFloat(editingProduct.weight) || 0,
        dimensions: editingProduct.dimensions || {length: 0, width: 0, height: 0},
        product_type: editingProduct.product_type || 'physical',
        download_file_path: editingProduct.download_file_path || ''
      };

      console.log('📝 Updating product:', editingProduct.id);
      console.log('   SKU:', productData.sku);
      console.log('   Weight:', productData.weight);
      console.log('   Dimensions:', productData.dimensions);
      console.log('   Full data:', productData);

      const response = await fetch(createApiUrl(`api/admin/products/${editingProduct.id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      console.log('   Response status:', response.status);

      if (response.ok) {
        toast.success('Product updated successfully');
        fetchProducts();
        setEditingProduct(null);
      } else {
        const error = await response.json();
        console.error('   Error response:', error);
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
        const response = await fetch(createApiUrl(`api/admin/products/${productId}`), {
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
      const response = await fetch(createApiUrl('api/admin/upload/product-images'), {
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
              const response = await fetch(createApiUrl('api/admin/upload/product-video'), {
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

  // eslint-disable-next-line no-unused-vars
  const handleDeleteFile = async (fileUrl) => {
    try {
      const response = await fetch(createApiUrl('api/admin/delete-file'), {
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



  // ============ DATABASE BACKUP FUNCTIONS ============
  
  const handleDatabaseBackup = async () => {
    try {
      toast.loading('Creating database backup...');
      
      const response = await fetch(createApiUrl('/api/admin/database/backup'), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pebdeq_backup_${new Date().toISOString().slice(0, 10)}.db`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success('Database backup downloaded successfully!');
      } else {
        const error = await response.json();
        toast.dismiss();
        toast.error(error.error || 'Backup failed');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Database backup error:', error);
      toast.error('Failed to create database backup');
    }
  };

  const handleFullBackup = async () => {
    try {
      toast.loading('Creating full backup (database + uploads)... This may take a moment.');
      
      const response = await fetch(createApiUrl('/api/admin/database/backup-full'), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pebdeq_full_backup_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success('Full backup downloaded successfully!');
      } else {
        const error = await response.json();
        toast.dismiss();
        toast.error(error.error || 'Full backup failed');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Full backup error:', error);
      toast.error('Failed to create full backup');
    }
  };

  // Auto-backup state
  const [autoBackupSettings, setAutoBackupSettings] = useState({
    enabled: false,
    interval: 'daily',
    max_backups: 10,
    last_backup: null,
    auto_backups: []
  });
  const [showAutoBackupPanel, setShowAutoBackupPanel] = useState(false);

  const fetchAutoBackupSettings = async () => {
    try {
      const response = await fetch(createApiUrl('/api/admin/database/auto-backup/settings'), {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAutoBackupSettings(data);
      }
    } catch (error) {
      console.error('Error fetching auto-backup settings:', error);
    }
  };

  const handleUpdateAutoBackup = async (updates) => {
    try {
      const response = await fetch(createApiUrl('/api/admin/database/auto-backup/settings'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchAutoBackupSettings();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.error('Failed to update auto-backup settings');
    }
  };

  const handleTriggerAutoBackup = async () => {
    try {
      toast.loading('Creating backup...');
      const response = await fetch(createApiUrl('/api/admin/database/auto-backup/trigger'), {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      toast.dismiss();
      if (response.ok) {
        toast.success('Auto-backup created!');
        fetchAutoBackupSettings();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to create backup');
    }
  };

  const handleDownloadAutoBackup = async (filename) => {
    try {
      const response = await fetch(createApiUrl(`/api/admin/database/auto-backup/${filename}`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to download backup');
    }
  };

  const handleDeleteAutoBackup = async (filename) => {
    if (!window.confirm(`Delete backup ${filename}?`)) return;
    
    try {
      const response = await fetch(createApiUrl(`/api/admin/database/auto-backup/${filename}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        toast.success('Backup deleted');
        fetchAutoBackupSettings();
      }
    } catch (error) {
      toast.error('Failed to delete backup');
    }
  };

  const handleRestoreBackup = async (file) => {
    if (!file) return;
    
    // Confirm restore action
    const confirmed = window.confirm(
      'WARNING: Restoring a backup will replace your current database!\n\n' +
      'A backup of your current database will be created before restore.\n\n' +
      'Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    try {
      toast.loading('Restoring backup... Please wait.');
      
      const formData = new FormData();
      formData.append('backup', file);
      
      const response = await fetch(createApiUrl('/api/admin/database/restore'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      toast.dismiss();
      
      if (response.ok) {
        toast.success(result.message);
        
        // Show additional info
        if (result.pre_restore_backup) {
          toast.success(`Pre-restore backup saved as: ${result.pre_restore_backup}`, { duration: 5000 });
        }
        
        // Suggest page reload
        setTimeout(() => {
          if (window.confirm('Backup restored successfully!\n\nWould you like to reload the page to see the changes?')) {
            window.location.reload();
          }
        }, 1000);
      } else {
        toast.error(result.error || 'Restore failed');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Restore error:', error);
      toast.error('Failed to restore backup');
    }
  };

  // Excel functions
  const handleExportProductsExcel = async () => {
    try {
      const response = await fetch(createApiUrl('/api/admin/products/export-excel'), {
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
      const response = await fetch(createApiUrl('/api/admin/products/export-template'), {
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

      const response = await fetch(createApiUrl('api/admin/products/import-excel'), {
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
      // Generate slug if not provided
      const slug = newVariationType.slug || generateSlug(newVariationType.name);
      
      // Validate slug
      if (!slug || slug.trim() === '') {
        toast.error('Please provide a valid name for the variation type');
        return;
      }
      
      const typeData = {
        ...newVariationType,
        slug: slug
      };

      const response = await fetch(createApiUrl('api/admin/variation-types'), {
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
      // Generate slug if not provided
      const slug = editingVariationType.slug || generateSlug(editingVariationType.name);
      
      // Validate slug
      if (!slug || slug.trim() === '') {
        toast.error('Please provide a valid name for the variation type');
        return;
      }
      
      const typeData = {
        ...editingVariationType,
        slug: slug
      };

      const response = await fetch(createApiUrl(`api/admin/variation-types/${editingVariationType.id}`), {
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
        const response = await fetch(createApiUrl(`api/admin/variation-types/${typeId}`), {
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
      const response = await fetch(createApiUrl(`api/admin/products/${product.id}`), {
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
      // Warn if setting to 'shipped' without a shipping label
      if (status === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        if (order && !order.has_shipment) {
          const confirmed = window.confirm(
            'This order has no shipping label or tracking number.\n\n' +
            'Use the 🎫 Ship Order button to create a label via EasyPost.\n\n' +
            'Do you still want to mark as Shipped without a label?'
          );
          if (!confirmed) return;
        }
      }

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
      const response = await fetch(createApiUrl(`api/admin/email/send/order/${selectedOrderForEmail.id}`), {
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

      const response = await fetch(createApiUrl(`api/admin/returns?${queryParams}`), {
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
      const response = await fetch(createApiUrl(`api/admin/returns/${orderId}`), {
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
      const response = await fetch(createApiUrl(`api/admin/returns/${orderId}/complete`), {
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
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    // Auto mark as read when viewing
    if (!message.is_read) {
      handleMarkMessageRead(message.id);
    }
  };

  const handleCloseMessageModal = () => {
    setSelectedMessage(null);
    setShowMessageModal(false);
  };

  const handleMarkMessageRead = async (messageId) => {
    try {
      const response = await fetch(createApiUrl(`api/admin/messages/${messageId}/read`), {
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

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const response = await fetch(createApiUrl(`api/admin/messages/${messageId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Message deleted successfully');
        fetchMessages();
        // Close modal if viewing the deleted message
        if (selectedMessage?.id === messageId) {
          handleCloseMessageModal();
        }
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error deleting message');
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

  // AI Product modal handlers
  const handleAIProductApply = async (productData) => {
    // Apply AI-generated data to new product form
    // Handle dimensions - support both object format and individual fields
    let dimensionsData = productData.dimensions || { length: 0, width: 0, height: 0 };
    
    // If individual dimension fields are provided, use them
    if (productData.length || productData.width || productData.height) {
      dimensionsData = {
        length: productData.length || dimensionsData.length || 0,
        width: productData.width || dimensionsData.width || 0,
        height: productData.height || dimensionsData.height || 0
      };
    }
    
    setNewProduct(prev => ({
      ...prev,
      name: productData.name || prev.name,
      slug: productData.slug || prev.slug,
      description: productData.description || prev.description,
      price: productData.price || prev.price,
      original_price: productData.original_price || prev.original_price,
      category_id: productData.category_id || prev.category_id,
      weight: productData.weight || prev.weight,
      dimensions: dimensionsData,
      material: productData.material || prev.material,
      sku: productData.sku || prev.sku
    }));

    // If there are pending images (multiple), upload them all
    if (productData.pendingImages && productData.pendingImages.length > 0) {
      const uploadedUrls = await handleProductImagesUpload(productData.pendingImages);
      if (uploadedUrls.length > 0) {
        setNewProduct(prev => ({
          ...prev,
          images: uploadedUrls
        }));
        
        // After images are processed, open Add Product modal
        setShowAddProductModal(true);
      }
    } else {
      // No images to process, open Add Product modal directly
      setShowAddProductModal(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="admin-page admin-dashboard-page admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div className="admin-page admin-dashboard-page admin-dashboard">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-dashboard-page admin-dashboard">
      {/* Page Style Editor - Auto shows for admins only */}
      <PageStyleEditor pageClass="admin-dashboard" />
      
      {/* MOBILE HAMBURGER MENU BUTTON - visibility controlled by CSS media queries */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? 'X' : '='}
      </button>
      
      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* LAYOUT: SIDEBAR + MAIN CONTENT - styling controlled by CSS */}
      <div className="admin-body">
        
        {/* SIDEBAR - styling controlled by CSS media queries */}
        <div className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          
          {/* ANA PANEL */}
          <div className="menu-group">
            <button 
              className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'dashboard' ? 'var(--primary-color, #3498db)' : 'transparent',
                color: 'var(--text-light, white)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {if (activeTab !== 'dashboard') e.target.style.backgroundColor = 'var(--bg-hover, rgba(255,255,255,0.1))'}}
              onMouseOut={(e) => {if (activeTab !== 'dashboard') e.target.style.backgroundColor = 'transparent'}}
            >
              📊 Dashboard
            </button>
          </div>

          {/* E-TİCARET */}
          <div className="menu-group">
            <button 
              className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => handleTabChange('products')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              onClick={() => handleTabChange('orders')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              onClick={() => handleTabChange('returns')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              onClick={() => handleTabChange('users')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
          <div className="menu-group">
            <button 
              className={`sidebar-item ${activeTab === 'advanced-categories' ? 'active' : ''}`}
              onClick={() => handleTabChange('advanced-categories')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              📁 Categories
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'category-analytics' ? 'active' : ''}`}
              onClick={() => handleTabChange('category-analytics')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              onClick={() => handleTabChange('variations')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
          <div className="menu-group">
            <button 
              className={`sidebar-item ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => handleTabChange('blog')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              onClick={() => handleTabChange('messages')}
              style={{
                width: '100%',
                padding: '8px 20px',
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

          {/* SITE SETTINGS (EXPANDABLE) */}
          <div className="menu-group">
            <button 
              className="sidebar-item category-header"
              onClick={() => setSiteSettingsExpanded(!siteSettingsExpanded)}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                borderBottom: '1px solid #34495e'
              }}
              onMouseOver={(e) => {e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {e.target.style.backgroundColor = 'transparent'}}
            >
              {siteSettingsExpanded ? '📁' : '📂'} Site Settings
            </button>
            
            {siteSettingsExpanded && (
              <>
                <button 
                  className={`sidebar-item ${activeTab === 'site-settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('site-settings')}
                  style={{
                    width: '100%',
                    padding: '8px 40px',
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
                  className={`sidebar-item ${activeTab === 'menu-settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('menu-settings')}
                  style={{
                    width: '100%',
                    padding: '8px 40px',
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
                <button 
                  className={`sidebar-item ${activeTab === 'general-settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('general-settings')}
                  style={{
                    width: '100%',
                    padding: '8px 40px',
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
                  onClick={() => handleTabChange('information-settings')}
                  style={{
                    width: '100%',
                    padding: '8px 40px',
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
                  ℹ️ Information Settings
                </button>
              </>
            )}
          </div>

          {/* AYARLAR */}
          <div className="menu-group" style={{marginTop: '8px', marginBottom: '20px'}}>
            <button 
              className={`sidebar-item ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => handleTabChange('invoices')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
              onClick={() => handleTabChange('email-management')}
              style={{
                width: '100%',
                padding: '8px 20px',
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
            <button 
              className={`sidebar-item ${activeTab === 'newsletter-management' ? 'active' : ''}`}
              onClick={() => handleTabChange('newsletter-management')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'newsletter-management' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'newsletter-management') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'newsletter-management') e.target.style.backgroundColor = 'transparent'}}
            >
              📮 Newsletter
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'newsletter-campaign' ? 'active' : ''}`}
              onClick={() => handleTabChange('newsletter-campaign')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'newsletter-campaign' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'newsletter-campaign') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'newsletter-campaign') e.target.style.backgroundColor = 'transparent'}}
            >
              🚀 Campaign
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'payment-methods' ? 'active' : ''}`}
              onClick={() => handleTabChange('payment-methods')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'payment-methods' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'payment-methods') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'payment-methods') e.target.style.backgroundColor = 'transparent'}}
            >
              💳 Payment Methods
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => handleTabChange('shipping')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'shipping' ? '#e74c3c' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'shipping') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'shipping') e.target.style.backgroundColor = 'transparent'}}
            >
              📦 Shipping Settings
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'theme-packs' ? 'active' : ''}`}
              onClick={() => handleTabChange('theme-packs')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'theme-packs' ? '#8b5cf6' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'theme-packs') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'theme-packs') e.target.style.backgroundColor = 'transparent'}}
            >
              Theme Packs
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'desktop-licenses' ? 'active' : ''}`}
              onClick={() => handleTabChange('desktop-licenses')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'desktop-licenses' ? '#10b981' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'desktop-licenses') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'desktop-licenses') e.target.style.backgroundColor = 'transparent'}}
            >
              🔐 Desktop Licenses
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'demo-settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('demo-settings')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'demo-settings' ? '#10b981' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'demo-settings') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'demo-settings') e.target.style.backgroundColor = 'transparent'}}
            >
              ⚙️ Demo Kota Ayarları
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'visitor-analytics' ? 'active' : ''}`}
              onClick={() => handleTabChange('visitor-analytics')}
              style={{
                width: '100%',
                padding: '8px 20px',
                backgroundColor: activeTab === 'visitor-analytics' ? '#f59e0b' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onMouseOver={(e) => {if (activeTab !== 'visitor-analytics') e.target.style.backgroundColor = '#34495e'}}
              onMouseOut={(e) => {if (activeTab !== 'visitor-analytics') e.target.style.backgroundColor = 'transparent'}}
            >
              🌍 Visitor Analytics
            </button>
            
            <a 
              href="/mm-admin"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                textDecoration: 'none',
                textAlign: 'left',
                fontSize: '13px',
                marginTop: '10px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
            >
              🎬 Movie Maker Admin
            </a>
            <a 
              href="/admin/tests"
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                textDecoration: 'none',
                textAlign: 'left',
                fontSize: '12px',
                marginTop: '4px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
            >
              🧪 Test Page
            </a>
          </div>

        </div>

        {/* SAG MAIN CONTENT */}
        <div className="admin-main">
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
                  <span className="stat-number">${stats.totalRevenue ? stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
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
                      <td>${order.total_amount ? order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
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
              {/* Header with Excel and AI actions */}
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Products Management</h2>
                <div className="header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Database Backup & Restore Buttons */}
                  <div className="backup-actions" style={{ display: 'flex', gap: '8px', marginRight: '16px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', alignItems: 'center' }}>
                    <button 
                      className="btn"
                      onClick={handleDatabaseBackup}
                      title="Download SQLite database file"
                      style={{ backgroundColor: '#6f42c1', color: 'white', fontWeight: 'bold' }}
                    >
                      DB Backup
                    </button>
                    <button 
                      className="btn"
                      onClick={handleFullBackup}
                      title="Download full backup (database + all uploads)"
                      style={{ backgroundColor: '#e83e8c', color: 'white', fontWeight: 'bold' }}
                    >
                      Full Backup
                    </button>
                    <div style={{ borderLeft: '2px solid #dee2e6', height: '30px', margin: '0 4px' }}></div>
                    <label 
                      className="btn"
                      style={{ backgroundColor: '#fd7e14', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: 0 }}
                      title="Restore database from backup file (.db or .zip)"
                    >
                      Restore
                      <input
                        type="file"
                        accept=".db,.zip"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleRestoreBackup(file);
                            e.target.value = ''; // Reset input
                          }
                        }}
                      />
                    </label>
                    <div style={{ borderLeft: '2px solid #dee2e6', height: '30px', margin: '0 4px' }}></div>
                    <button 
                      className="btn"
                      onClick={() => { setShowAutoBackupPanel(!showAutoBackupPanel); fetchAutoBackupSettings(); }}
                      title="Configure automatic scheduled backups"
                      style={{ backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold' }}
                    >
                      Auto Backup
                    </button>
                  </div>
                  
                  {/* Auto-Backup Settings Panel */}
                  {showAutoBackupPanel && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '350px'
                    }}>
                      <h4 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Auto-Backup Settings
                        <button onClick={() => setShowAutoBackupPanel(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>x</button>
                      </h4>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={autoBackupSettings.enabled}
                            onChange={(e) => handleUpdateAutoBackup({ enabled: e.target.checked })}
                          />
                          <strong>Enable Auto-Backup</strong>
                        </label>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Backup Interval:</label>
                        <select
                          value={autoBackupSettings.interval}
                          onChange={(e) => handleUpdateAutoBackup({ interval: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="hourly">Every Hour</option>
                          <option value="6hours">Every 6 Hours</option>
                          <option value="12hours">Every 12 Hours</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Keep Last N Backups:</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={autoBackupSettings.max_backups}
                          onChange={(e) => handleUpdateAutoBackup({ max_backups: parseInt(e.target.value) || 10 })}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px' }}>
                        <div><strong>Last Backup:</strong> {autoBackupSettings.last_backup ? new Date(autoBackupSettings.last_backup).toLocaleString() : 'Never'}</div>
                        <div><strong>Status:</strong> {autoBackupSettings.enabled ? 'Active' : 'Disabled'}</div>
                      </div>
                      
                      <button
                        onClick={handleTriggerAutoBackup}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px' }}
                      >
                        Create Backup Now
                      </button>
                      
                      {autoBackupSettings.auto_backups && autoBackupSettings.auto_backups.length > 0 && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                          <div style={{ padding: '8px', backgroundColor: '#f8f9fa', fontWeight: 'bold', fontSize: '12px' }}>
                            Recent Backups ({autoBackupSettings.auto_backups.length})
                          </div>
                          {autoBackupSettings.auto_backups.map((backup, idx) => (
                            <div key={idx} style={{ padding: '8px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                              <div>
                                <div>{backup.filename}</div>
                                <div style={{ color: '#666' }}>{backup.size_mb} MB - {new Date(backup.created).toLocaleString()}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => handleDownloadAutoBackup(backup.filename)} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>DL</button>
                                <button onClick={() => handleDeleteAutoBackup(backup.filename)} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>X</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="excel-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-success"
                      onClick={handleExportProductsExcel}
                      title="Export all products to Excel"
                    >
                      Excel Export
                    </button>
                    <button 
                      className="btn btn-info"
                      onClick={handleDownloadTemplate}
                      title="Download Excel template for import"
                    >
                      Download Template
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
                        Restore Excel
                      </button>
                    </div>
                  </div>
                  {/* AI Product Actions */}
                  <div className="ai-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn"
                      onClick={() => setAiProductModalOpen(true)}
                      title="Add product using AI image recognition"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600'
                      }}
                    >
                      AI Add Product
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setAiSettingsModalOpen(true)}
                      title="Configure AI settings"
                      style={{ padding: '8px 12px' }}
                    >
                      AI Settings
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Products Manager Component */}
              <ProductsManager
                products={products}
                categories={categories}
                onProductsChange={fetchProducts}
                onEditProduct={(product) => {
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
                    pricing_tiers: product.pricing_tiers || [],
                    sku: product.sku || '',
                    weight: product.weight ?? '',
                    dimensions: product.dimensions || {length: 0, width: 0, height: 0},
                    material: product.material || '',
                    product_type: product.product_type || 'physical',
                    download_file_path: product.download_file_path || ''
                  });
                }}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={() => setShowAddProductModal(true)}
                currencySymbol="$"
              />

          {/* Add Product Modal */}
          {showAddProductModal && (
          <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content add-product-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>Add New Product</h3>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddProductModal(false)}
                style={{padding: '8px 16px'}}
              >
                Close
              </button>
            </div>
            <form onSubmit={(e) => {
              handleCreateProduct(e);
              setShowAddProductModal(false);
            }}>
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
              
              {/* SKU Field */}
              <div className="form-group" style={{marginBottom: '0.5rem'}}>
                <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  placeholder="e.g., PROD-001"
                />
              </div>
              
              {/* Product Type */}
              <div className="form-group" style={{marginBottom: '0.5rem'}}>
                <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Product Type</label>
                <select
                  value={newProduct.product_type}
                  onChange={(e) => setNewProduct({...newProduct, product_type: e.target.value})}
                >
                  <option value="physical">📦 Physical Product</option>
                  <option value="software">💻 Software / Digital Product</option>
                </select>
              </div>
              
              {/* Software File Upload */}
              {newProduct.product_type === 'software' && (
                <div className="form-group" style={{marginBottom: '0.5rem', padding: '12px', backgroundColor: '#f0f7ff', borderRadius: '6px', border: '1px solid #b3d7ff'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>📁 Software File</label>
                  <input
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const response = await fetch(createApiUrl('api/products/upload-software'), {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                          body: formData
                        });
                        if (response.ok) {
                          const data = await response.json();
                          setNewProduct(prev => ({...prev, download_file_path: data.file_url}));
                          toast.success(`File uploaded: ${data.file_name} (${(data.file_size / 1024 / 1024).toFixed(1)} MB)`);
                        } else {
                          const err = await response.json();
                          toast.error(err.error || 'Upload failed');
                        }
                      } catch (err) {
                        toast.error('Upload failed');
                      }
                    }}
                  />
                  {newProduct.download_file_path && (
                    <div style={{marginTop: '8px', fontSize: '0.85rem', color: '#28a745'}}>
                      ✅ File: {newProduct.download_file_path.split('/').pop()}
                      <button type="button" style={{marginLeft: '10px', fontSize: '0.8rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer'}}
                        onClick={() => setNewProduct(prev => ({...prev, download_file_path: ''}))}
                      >🗑️ Remove</button>
                      <button type="button" style={{marginLeft: '10px', fontSize: '0.8rem', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
                        onClick={() => {
                          const url = createApiUrl(newProduct.download_file_path.startsWith('/') ? newProduct.download_file_path.slice(1) : newProduct.download_file_path);
                          window.open(url, '_blank');
                        }}
                      >⬇️ Test Download</button>
                    </div>
                  )}
                  <small style={{display: 'block', marginTop: '4px', color: '#666'}}>
                    Upload the software installer or ZIP file. Customers will receive a download link after purchase.
                  </small>
                </div>
              )}
              
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
                    Formats: MP4, WebM, AVI — or paste a YouTube URL below
                  </div>
                  <input
                    type="text"
                    placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
                    value={newProduct.video_url?.startsWith('/uploads/') ? '' : (newProduct.video_url || '')}
                    onChange={(e) => setNewProduct({...newProduct, video_url: e.target.value})}
                    style={{ marginTop: '0.3rem', width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                  />
                  {newProduct.video_url && (
                    <div className="video-preview" style={{ marginTop: '0.5rem' }}>
                      {newProduct.video_url.includes('youtube.com') || newProduct.video_url.includes('youtu.be') ? (
                        <iframe
                          width="200"
                          height="120"
                          src={`https://www.youtube-nocookie.com/embed/${(() => { const m = newProduct.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&]+)/); return m ? m[1] : ''; })()}`}
                          title="YouTube video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: '4px' }}
                        />
                      ) : (
                        <video 
                          src={newProduct.video_url} 
                          controls
                          style={{ width: '200px', height: '120px', borderRadius: '4px' }}
                        />
                      )}
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

                            {newProduct.product_type !== 'software' && (
                            <div className="form-row">
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Weight</label>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={Math.floor(newProduct.weight || 0)}
                        onChange={(e) => {
                          const lbs = parseInt(e.target.value) || 0;
                          const currentOz = Math.round(((newProduct.weight || 0) % 1) * 16);
                          setNewProduct({...newProduct, weight: lbs + (currentOz / 16)});
                        }}
                        placeholder="0"
                        style={{width: '100%'}}
                      />
                      <small style={{fontSize: '0.75rem', color: '#666'}}>lbs</small>
                    </div>
                    <span style={{fontSize: '1rem', color: '#999'}}>+</span>
                    <div style={{flex: 1}}>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        step="1"
                        value={Math.round(((newProduct.weight || 0) % 1) * 16)}
                        onChange={(e) => {
                          const currentLbs = Math.floor(newProduct.weight || 0);
                          let oz = parseInt(e.target.value) || 0;
                          if (oz >= 16) { oz = 0; }
                          if (oz < 0) { oz = 0; }
                          setNewProduct({...newProduct, weight: currentLbs + (oz / 16)});
                        }}
                        placeholder="0"
                        style={{width: '100%'}}
                      />
                      <small style={{fontSize: '0.75rem', color: '#666'}}>oz</small>
                    </div>
                  </div>
                  <small style={{fontSize: '0.7rem', color: '#999', fontStyle: 'italic'}}>16 oz = 1 lb</small>
                </div>
                <div className="form-group" style={{marginBottom: '0.3rem'}}>
                  <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Dimensions (inches)</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input
                      type="number"
                      step="0.1"
                      value={newProduct.dimensions?.length || ''}
                      onChange={(e) => setNewProduct({
                        ...newProduct, 
                        dimensions: {...(newProduct.dimensions || {}), length: parseFloat(e.target.value) || 0}
                      })}
                      placeholder="L"
                      style={{flex: 1}}
                    />
                    <span style={{alignSelf: 'center', color: '#999'}}>x</span>
                    <input
                      type="number"
                      step="0.1"
                      value={newProduct.dimensions?.width || ''}
                      onChange={(e) => setNewProduct({
                        ...newProduct, 
                        dimensions: {...(newProduct.dimensions || {}), width: parseFloat(e.target.value) || 0}
                      })}
                      placeholder="W"
                      style={{flex: 1}}
                    />
                    <span style={{alignSelf: 'center', color: '#999'}}>x</span>
                    <input
                      type="number"
                      step="0.1"
                      value={newProduct.dimensions?.height || ''}
                      onChange={(e) => setNewProduct({
                        ...newProduct, 
                        dimensions: {...(newProduct.dimensions || {}), height: parseFloat(e.target.value) || 0}
                      })}
                      placeholder="H"
                      style={{flex: 1}}
                    />
                  </div>
                  <small style={{fontSize: '0.75rem', color: '#999'}}>Length x Width x Height</small>
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
                            )}

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
                          const selectedType = e.target.value;
                          const typeData = variationTypes.find(t => t.id.toString() === selectedType);
                          
                          // Load options for selected variation type
                          const typeOptions = selectedType !== 'custom' && typeData
                            ? variationOptions
                                .filter(opt => opt.variation_type_id === typeData.id)
                                .map(opt => ({
                                  name: opt.name,
                                  value: opt.value || opt.name,
                                  hex_color: opt.hex_color || '',
                                  price_modifier: 0,
                                  stock_quantity: 0,
                                  from_management: true
                                }))
                            : [];
                          
                          setNewProduct({
                            ...newProduct, 
                            variation_type: selectedType,
                            variation_name: selectedType === 'custom' ? newProduct.variation_name : (typeData ? typeData.name : ''),
                            variation_options: typeOptions.length > 0 ? typeOptions : newProduct.variation_options
                          });
                        }}
                        required
                      >
                        <option value="">Select Variation Type</option>
                        {variationTypes.filter(t => t.is_active).map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name} ({variationOptions.filter(opt => opt.variation_type_id === type.id).length} options)
                          </option>
                        ))}
                        <option value="custom">➕ Custom Variation</option>
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
                    {newProduct.variation_type && newProduct.variation_type !== 'custom' && 
                     variationOptions.filter(opt => opt.variation_type_id.toString() === newProduct.variation_type).length > 0 ? (
                      <p style={{ color: '#28a745', fontSize: '0.9rem' }}>
                        ✅ Auto-loaded {variationOptions.filter(opt => opt.variation_type_id.toString() === newProduct.variation_type).length} options from Variations Management
                      </p>
                    ) : (
                      <p>Add custom options for this variation:</p>
                    )}
                    
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
                      <div style={{ width: '100px' }}>Sale Price ({currencySymbol})</div>
                      <div style={{ width: '70px' }}>Stock</div>
                      <div style={{ width: '80px' }}>Color</div>
                      <div style={{ width: '30px' }}></div>
                    </div>
                    
                    {newProduct.variation_options.map((option, index) => (
                      <div key={index} style={{ marginBottom: '12px', border: '1px solid #e9ecef', borderRadius: '8px', padding: '10px' }}>
                        <div className="variation-option-item" style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => {
                              const newOptions = [...newProduct.variation_options];
                              newOptions[index] = { ...option, name: e.target.value };
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                            placeholder="Name"
                            style={{ width: '140px', fontSize: '14px' }}
                            readOnly={option.from_management}
                          />
                          <input
                            type="number"
                            value={(() => {
                              const basePrice = parseFloat(newProduct.price) || 0;
                              const modifier = parseFloat(option.price_modifier) || 0;
                              return basePrice + modifier || '';
                            })()}
                            onChange={(e) => {
                              const basePrice = parseFloat(newProduct.price) || 0;
                              const finalPrice = parseFloat(e.target.value) || 0;
                              const newOptions = [...newProduct.variation_options];
                              newOptions[index] = { ...option, price_modifier: parseFloat((finalPrice - basePrice).toFixed(2)) };
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                            placeholder={`${parseFloat(newProduct.price) || 0}`}
                            style={{ width: '100px', fontSize: '14px' }}
                            step="0.01"
                          />
                          <input
                            type="number"
                            value={option.stock_quantity || 0}
                            onChange={(e) => {
                              const newOptions = [...newProduct.variation_options];
                              newOptions[index] = { ...option, stock_quantity: parseInt(e.target.value) || 0 };
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                            placeholder="Stock"
                            style={{ width: '70px', fontSize: '14px' }}
                          />
                          {(newProduct.variation_type === '1' || option.hex_color) && (
                            <input
                              type="color"
                              value={option.hex_color || '#000000'}
                              onChange={(e) => {
                                const newOptions = [...newProduct.variation_options];
                                newOptions[index] = { ...option, hex_color: e.target.value };
                                setNewProduct({...newProduct, variation_options: newOptions});
                              }}
                              style={{ width: '80px', height: '30px' }}
                            />
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const newOptions = newProduct.variation_options.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, variation_options: newOptions});
                            }}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >🗑️</button>
                        </div>
                        
                        {/* Per-Variation Pricing Tiers */}
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #dee2e6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1' }}>📦 Bulk Pricing for "{option.name || '...'}"</span>
                            <button
                              type="button"
                              style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #0369a1', borderRadius: '4px', background: 'none', color: '#0369a1', cursor: 'pointer' }}
                              onClick={() => {
                                const newOptions = [...newProduct.variation_options];
                                const tiers = [...(option.pricing_tiers || [])];
                                tiers.push({ min_qty: 0, price: 0 });
                                newOptions[index] = { ...option, pricing_tiers: tiers };
                                setNewProduct({...newProduct, variation_options: newOptions});
                              }}
                            >+ Add Tier</button>
                          </div>
                          
                          {(option.pricing_tiers || []).map((tier, tIdx) => (
                            <div key={tIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                              <input
                                type="number" min="1"
                                value={tier.min_qty || ''}
                                onChange={(e) => {
                                  const newOptions = [...newProduct.variation_options];
                                  const tiers = [...(option.pricing_tiers || [])];
                                  tiers[tIdx] = { ...tier, min_qty: parseInt(e.target.value) || 0 };
                                  newOptions[index] = { ...option, pricing_tiers: tiers };
                                  setNewProduct({...newProduct, variation_options: newOptions});
                                }}
                                placeholder="Min qty"
                                style={{ width: '80px', fontSize: '12px', padding: '4px 6px' }}
                              />
                              <span style={{ fontSize: '11px', color: '#888' }}>pcs →</span>
                              <input
                                type="number" step="0.01" min="0"
                                value={tier.price || ''}
                                onChange={(e) => {
                                  const newOptions = [...newProduct.variation_options];
                                  const tiers = [...(option.pricing_tiers || [])];
                                  tiers[tIdx] = { ...tier, price: parseFloat(e.target.value) || 0 };
                                  newOptions[index] = { ...option, pricing_tiers: tiers };
                                  setNewProduct({...newProduct, variation_options: newOptions});
                                }}
                                placeholder="Unit price"
                                style={{ width: '80px', fontSize: '12px', padding: '4px 6px' }}
                              />
                              <span style={{ fontSize: '11px', color: '#888' }}>{currencySymbol}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = [...newProduct.variation_options];
                                  const tiers = (option.pricing_tiers || []).filter((_, i) => i !== tIdx);
                                  newOptions[index] = { ...option, pricing_tiers: tiers };
                                  setNewProduct({...newProduct, variation_options: newOptions});
                                }}
                                style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid #dc3545', borderRadius: '3px', background: 'none', color: '#dc3545', cursor: 'pointer' }}
                              >✕</button>
                            </div>
                          ))}
                          
                          {(option.pricing_tiers || []).length > 0 && (
                            <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>
                              Base: {currencySymbol}{(parseFloat(newProduct.price || 0) + (parseFloat(option.price_modifier) || 0)).toFixed(2)}
                              {(option.pricing_tiers || []).filter(t => t.min_qty > 0 && t.price > 0).sort((a, b) => a.min_qty - b.min_qty).map((t, i) => (
                                <span key={i}> → {t.min_qty}+: {currencySymbol}{t.price.toFixed(2)}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        const newOptions = [...newProduct.variation_options];
                        newOptions.push({ 
                          name: '', 
                          price_modifier: 0, 
                          stock_quantity: 0, 
                          hex_color: '',
                          pricing_tiers: [],
                          from_management: false 
                        });
                        setNewProduct({...newProduct, variation_options: newOptions});
                      }}
                    >
                      ➕ Add Custom Option
                    </button>
                  </div>
                </div>
              )}

              {/* Pricing Tiers for New Product */}
              <div className="form-section">
                <h4>📦 General Quantity Pricing (Wholesale)</h4>
                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px' }}>
                  Set default bulk pricing for products without variation-specific tiers.
                </p>
                
                {(newProduct.pricing_tiers || []).length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#555'
                  }}>
                    <div style={{ width: '120px' }}>Min. Quantity</div>
                    <div style={{ width: '120px' }}>Unit Price ({currencySymbol})</div>
                    <div style={{ width: '30px' }}></div>
                  </div>
                )}
                
                {(newProduct.pricing_tiers || []).map((tier, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <input
                      type="number"
                      min="1"
                      value={tier.min_qty || ''}
                      onChange={(e) => {
                        const newTiers = [...(newProduct.pricing_tiers || [])];
                        newTiers[index] = { ...tier, min_qty: parseInt(e.target.value) || 0 };
                        setNewProduct({ ...newProduct, pricing_tiers: newTiers });
                      }}
                      placeholder="e.g. 10"
                      style={{ width: '120px', fontSize: '14px' }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier.price || ''}
                      onChange={(e) => {
                        const newTiers = [...(newProduct.pricing_tiers || [])];
                        newTiers[index] = { ...tier, price: parseFloat(e.target.value) || 0 };
                        setNewProduct({ ...newProduct, pricing_tiers: newTiers });
                      }}
                      placeholder="e.g. 1.50"
                      style={{ width: '120px', fontSize: '14px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        const newTiers = (newProduct.pricing_tiers || []).filter((_, i) => i !== index);
                        setNewProduct({ ...newProduct, pricing_tiers: newTiers });
                      }}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >🗑️</button>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    const newTiers = [...(newProduct.pricing_tiers || [])];
                    newTiers.push({ min_qty: 0, price: 0 });
                    setNewProduct({ ...newProduct, pricing_tiers: newTiers });
                  }}
                >
                  + Add Pricing Tier
                </button>
                
                {(newProduct.pricing_tiers || []).length > 0 && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
                    <strong>Preview:</strong> Base price: {currencySymbol}{parseFloat(newProduct.price || 0).toFixed(2)}
                    {(newProduct.pricing_tiers || [])
                      .filter(t => t.min_qty > 0 && t.price > 0)
                      .sort((a, b) => a.min_qty - b.min_qty)
                      .map((t, i) => (
                        <span key={i}> → {t.min_qty}+ units: {currencySymbol}{t.price.toFixed(2)}</span>
                      ))
                    }
                  </div>
                )}
              </div>

              <div className="form-section">
                <h4>Product Specifications</h4>
                <div className="form-row">
                  <div className="form-group" style={{marginBottom: '0.3rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Material</label>
                    <input
                      type="text"
                      value={newProduct.material || ''}
                      onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                      placeholder="e.g.: Cotton, Leather, Metal"
                    />
                  </div>
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

              <div className="form-actions" style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Create Product
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddProductModal(false)}
                  style={{flex: 1}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          </div>
          )}

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
                            (() => {
                              // Check if variation_type is a number (ID from management)
                              if (editingProduct.variation_type && !isNaN(editingProduct.variation_type)) {
                                const varType = variationTypes.find(t => t.id.toString() === editingProduct.variation_type.toString());
                                return varType ? varType.name : `Type #${editingProduct.variation_type}`;
                              }
                              // Legacy string-based types
                              if (editingProduct.variation_type === 'custom') return editingProduct.variation_name || 'Custom';
                              if (editingProduct.variation_type === 'color') return 'Color';
                              if (editingProduct.variation_type === 'size') return 'Size';
                              if (editingProduct.variation_type === 'weight') return 'Weight';
                              return editingProduct.variation_name || 'Unknown';
                            })()
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
                  
                  {/* SKU Field */}
                  <div className="form-group" style={{marginBottom: '0.5rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>SKU (Stock Keeping Unit)</label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                      placeholder="e.g., PROD-001"
                    />
                  </div>
                  
                  {/* Product Type */}
                  <div className="form-group" style={{marginBottom: '0.5rem'}}>
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Product Type</label>
                    <select
                      value={editingProduct.product_type || 'physical'}
                      onChange={(e) => setEditingProduct({...editingProduct, product_type: e.target.value})}
                    >
                      <option value="physical">📦 Physical Product</option>
                      <option value="software">💻 Software / Digital Product</option>
                    </select>
                  </div>
                  
                  {/* Software File Upload */}
                  {editingProduct.product_type === 'software' && (
                    <div className="form-group" style={{marginBottom: '0.5rem', padding: '12px', backgroundColor: '#f0f7ff', borderRadius: '6px', border: '1px solid #b3d7ff'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>📁 Software File</label>
                      <input
                        type="file"
                        disabled={editingProduct._uploading}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          
                          // Show uploading state
                          setEditingProduct(prev => ({...prev, _uploading: true, _uploadProgress: 0, _uploadFileName: file.name}));
                          
                          try {
                            // Use XMLHttpRequest for progress tracking
                            const result = await new Promise((resolve, reject) => {
                              const xhr = new XMLHttpRequest();
                              xhr.open('POST', createApiUrl('api/products/upload-software'));
                              xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                              xhr.upload.onprogress = (e) => {
                                if (e.lengthComputable) {
                                  const pct = Math.round((e.loaded / e.total) * 100);
                                  setEditingProduct(prev => ({...prev, _uploadProgress: pct}));
                                }
                              };
                              xhr.onload = () => {
                                if (xhr.status >= 200 && xhr.status < 300) {
                                  resolve(JSON.parse(xhr.responseText));
                                } else {
                                  try { reject(JSON.parse(xhr.responseText)); } 
                                  catch { reject({error: `HTTP ${xhr.status}`}); }
                                }
                              };
                              xhr.onerror = () => reject({error: 'Network error'});
                              xhr.send(formData);
                            });
                            
                            setEditingProduct(prev => ({...prev, download_file_path: result.file_url, _uploading: false, _uploadProgress: 100}));
                            const sizeMB = (result.file_size / 1024 / 1024).toFixed(1);
                            toast.success(`✅ File uploaded: ${result.file_name} (${sizeMB} MB)${result.update_copied ? ' — Auto-update ready!' : ''}`);
                          } catch (err) {
                            setEditingProduct(prev => ({...prev, _uploading: false, _uploadProgress: 0}));
                            toast.error(err.error || 'Upload failed');
                          }
                        }}
                      />
                      {/* Upload Progress */}
                      {editingProduct._uploading && (
                        <div style={{marginTop: '8px'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#0066cc'}}>
                            <span>⏳ Uploading {editingProduct._uploadFileName}... {editingProduct._uploadProgress || 0}%</span>
                          </div>
                          <div style={{marginTop: '4px', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden'}}>
                            <div style={{height: '100%', width: `${editingProduct._uploadProgress || 0}%`, background: 'linear-gradient(90deg, #4caf50, #2196f3)', borderRadius: '3px', transition: 'width 0.3s'}} />
                          </div>
                          <small style={{color: '#999', fontSize: '0.75rem'}}>⚠️ Please wait for upload to finish before clicking Update</small>
                        </div>
                      )}
                      {editingProduct.download_file_path && !editingProduct._uploading && (
                        <div style={{marginTop: '8px', fontSize: '0.85rem', color: '#28a745'}}>
                          ✅ File: {editingProduct.download_file_path.split('/').pop()}
                          <button type="button" style={{marginLeft: '10px', fontSize: '0.8rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer'}}
                            onClick={() => setEditingProduct(prev => ({...prev, download_file_path: ''}))}
                          >🗑️ Remove</button>
                          <button type="button" style={{marginLeft: '10px', fontSize: '0.8rem', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
                            onClick={() => {
                              const url = createApiUrl(editingProduct.download_file_path.startsWith('/') ? editingProduct.download_file_path.slice(1) : editingProduct.download_file_path);
                              window.open(url, '_blank');
                            }}
                          >⬇️ Test Download</button>
                        </div>
                      )}
                    </div>
                  )}
                  
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
                    <input
                      type="text"
                      placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
                      value={editingProduct.video_url?.startsWith('/uploads/') ? '' : (editingProduct.video_url || '')}
                      onChange={(e) => setEditingProduct({...editingProduct, video_url: e.target.value})}
                      style={{ marginTop: '0.3rem', width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                    />
                    {editingProduct.video_url && (
                      <div className="video-preview" style={{ marginTop: '0.5rem' }}>
                        {editingProduct.video_url.includes('youtube.com') || editingProduct.video_url.includes('youtu.be') ? (
                          <iframe
                            width="200"
                            height="120"
                            src={`https://www.youtube-nocookie.com/embed/${(() => { const m = editingProduct.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&]+)/); return m ? m[1] : ''; })()}`}
                            title="YouTube video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: '4px' }}
                          />
                        ) : (
                          <video 
                            src={editingProduct.video_url} 
                            controls
                            style={{ width: '200px', height: '120px', borderRadius: '4px' }}
                          />
                        )}
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

                  {editingProduct.product_type !== 'software' && (
                  <>
                  <div className="form-row">
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Weight</label>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <div style={{flex: 1}}>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={Math.floor(editingProduct.weight || 0)}
                            onChange={(e) => {
                              const lbs = parseInt(e.target.value) || 0;
                              const currentOz = Math.round(((editingProduct.weight || 0) % 1) * 16);
                              setEditingProduct({...editingProduct, weight: lbs + (currentOz / 16)});
                            }}
                            placeholder="0"
                            style={{width: '100%'}}
                          />
                          <small style={{fontSize: '0.75rem', color: '#666'}}>lbs</small>
                        </div>
                        <span style={{fontSize: '1rem', color: '#999'}}>+</span>
                        <div style={{flex: 1}}>
                          <input
                            type="number"
                            min="0"
                            max="15"
                            step="1"
                            value={Math.round(((editingProduct.weight || 0) % 1) * 16)}
                            onChange={(e) => {
                              const currentLbs = Math.floor(editingProduct.weight || 0);
                              let oz = parseInt(e.target.value) || 0;
                              if (oz >= 16) { oz = 0; }
                              if (oz < 0) { oz = 0; }
                              setEditingProduct({...editingProduct, weight: currentLbs + (oz / 16)});
                            }}
                            placeholder="0"
                            style={{width: '100%'}}
                          />
                          <small style={{fontSize: '0.75rem', color: '#666'}}>oz</small>
                        </div>
                      </div>
                      <small style={{fontSize: '0.7rem', color: '#999', fontStyle: 'italic'}}>16 oz = 1 lb</small>
                    </div>
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Dimensions (inches)</label>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <input
                          type="number"
                          step="0.1"
                          value={editingProduct.dimensions?.length || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct, 
                            dimensions: {...(editingProduct.dimensions || {}), length: parseFloat(e.target.value) || 0}
                          })}
                          placeholder="L"
                          style={{flex: 1}}
                        />
                        <span style={{alignSelf: 'center', color: '#999'}}>x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={editingProduct.dimensions?.width || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct, 
                            dimensions: {...(editingProduct.dimensions || {}), width: parseFloat(e.target.value) || 0}
                          })}
                          placeholder="W"
                          style={{flex: 1}}
                        />
                        <span style={{alignSelf: 'center', color: '#999'}}>x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={editingProduct.dimensions?.height || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct, 
                            dimensions: {...(editingProduct.dimensions || {}), height: parseFloat(e.target.value) || 0}
                          })}
                          placeholder="H"
                          style={{flex: 1}}
                        />
                      </div>
                      <small style={{fontSize: '0.75rem', color: '#999'}}>Length x Width x Height</small>
                    </div>
                  </div>
                  <div className="form-row">
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
                  </>
                  )}

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
                          style={{
                            width: '20px',   /* Perfect visible checkbox size */
                            height: '20px',  /* Perfect visible checkbox size */
                            transform: 'scale(1.0)',
                            margin: '0 8px 0 0'
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
                              const selectedType = e.target.value;
                              const typeData = variationTypes.find(t => t.id.toString() === selectedType);
                              
                              // Load options for selected variation type
                              const typeOptions = selectedType !== 'custom' && typeData
                                ? variationOptions
                                    .filter(opt => opt.variation_type_id === typeData.id)
                                    .map(opt => ({
                                      name: opt.name,
                                      value: opt.value || opt.name,
                                      hex_color: opt.hex_color || '',
                                      price_modifier: 0,
                                      stock_quantity: 0,
                                      from_management: true
                                    }))
                                : editingProduct.variation_options || [];
                              
                              setEditingProduct({
                                ...editingProduct,
                                variation_type: selectedType,
                                variation_name: selectedType === 'custom' ? editingProduct.variation_name : (typeData ? typeData.name : ''),
                                variation_options: typeOptions
                              });
                            }}
                          >
                            <option value="">Select Variation Type</option>
                            {variationTypes.filter(t => t.is_active).map(type => (
                              <option key={type.id} value={type.id}>
                                {type.name} ({variationOptions.filter(opt => opt.variation_type_id === type.id).length} options)
                              </option>
                            ))}
                            <option value="custom">➕ Custom Variation</option>
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
                                <div style={{ width: '100px' }}>Sale Price ({currencySymbol})</div>
                                <div style={{ width: '70px' }}>Stock</div>
                                <div style={{ width: '30px' }}></div>
                              </div>
                              
                              {(editingProduct.variation_options || []).map((option, index) => (
                                <div key={index} style={{ marginBottom: '12px', border: '1px solid #e9ecef', borderRadius: '8px', padding: '10px' }}>
                                  <div className="variation-option-item" style={{
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'center',
                                    flexWrap: 'wrap'
                                  }}>
                                    <input
                                      type="text"
                                      value={option.name || ''}
                                      onChange={(e) => {
                                        const newOptions = [...(editingProduct.variation_options || [])];
                                        newOptions[index] = { ...option, name: e.target.value };
                                        setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                      }}
                                      placeholder="Option name"
                                      style={{ width: '140px', fontSize: '14px' }}
                                    />
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={(() => {
                                        const basePrice = parseFloat(editingProduct.price) || 0;
                                        const modifier = parseFloat(option.price_modifier) || 0;
                                        return basePrice + modifier || '';
                                      })()}
                                      onChange={(e) => {
                                        const basePrice = parseFloat(editingProduct.price) || 0;
                                        const finalPrice = parseFloat(e.target.value) || 0;
                                        const newOptions = [...(editingProduct.variation_options || [])];
                                        newOptions[index] = { ...option, price_modifier: parseFloat((finalPrice - basePrice).toFixed(2)) };
                                        setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                      }}
                                      placeholder={`${parseFloat(editingProduct.price) || 0}`}
                                      style={{ width: '100px', fontSize: '14px' }}
                                    />
                                    <input
                                      type="number"
                                      value={option.stock || 0}
                                      onChange={(e) => {
                                        const newOptions = [...(editingProduct.variation_options || [])];
                                        newOptions[index] = { ...option, stock: parseInt(e.target.value) || 0 };
                                        setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                      }}
                                      placeholder="Stock"
                                      style={{ width: '70px', fontSize: '14px' }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => {
                                        const newOptions = editingProduct.variation_options.filter((_, i) => i !== index);
                                        setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                      }}
                                      style={{ padding: '4px 8px', fontSize: '12px' }}
                                    >🗑️</button>
                                  </div>
                                  
                                  {/* Per-Variation Pricing Tiers */}
                                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #dee2e6' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1' }}>📦 Bulk Pricing for "{option.name || '...'}"</span>
                                      <button
                                        type="button"
                                        style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #0369a1', borderRadius: '4px', background: 'none', color: '#0369a1', cursor: 'pointer' }}
                                        onClick={() => {
                                          const newOptions = [...(editingProduct.variation_options || [])];
                                          const tiers = [...(option.pricing_tiers || [])];
                                          tiers.push({ min_qty: 0, price: 0 });
                                          newOptions[index] = { ...option, pricing_tiers: tiers };
                                          setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                        }}
                                      >+ Add Tier</button>
                                    </div>
                                    
                                    {(option.pricing_tiers || []).map((tier, tIdx) => (
                                      <div key={tIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                                        <input
                                          type="number" min="1"
                                          value={tier.min_qty || ''}
                                          onChange={(e) => {
                                            const newOptions = [...(editingProduct.variation_options || [])];
                                            const tiers = [...(option.pricing_tiers || [])];
                                            tiers[tIdx] = { ...tier, min_qty: parseInt(e.target.value) || 0 };
                                            newOptions[index] = { ...option, pricing_tiers: tiers };
                                            setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                          }}
                                          placeholder="Min qty"
                                          style={{ width: '80px', fontSize: '12px', padding: '4px 6px' }}
                                        />
                                        <span style={{ fontSize: '11px', color: '#888' }}>pcs →</span>
                                        <input
                                          type="number" step="0.01" min="0"
                                          value={tier.price || ''}
                                          onChange={(e) => {
                                            const newOptions = [...(editingProduct.variation_options || [])];
                                            const tiers = [...(option.pricing_tiers || [])];
                                            tiers[tIdx] = { ...tier, price: parseFloat(e.target.value) || 0 };
                                            newOptions[index] = { ...option, pricing_tiers: tiers };
                                            setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                          }}
                                          placeholder="Unit price"
                                          style={{ width: '80px', fontSize: '12px', padding: '4px 6px' }}
                                        />
                                        <span style={{ fontSize: '11px', color: '#888' }}>{currencySymbol}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newOptions = [...(editingProduct.variation_options || [])];
                                            const tiers = (option.pricing_tiers || []).filter((_, i) => i !== tIdx);
                                            newOptions[index] = { ...option, pricing_tiers: tiers };
                                            setEditingProduct({ ...editingProduct, variation_options: newOptions });
                                          }}
                                          style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid #dc3545', borderRadius: '3px', background: 'none', color: '#dc3545', cursor: 'pointer' }}
                                        >✕</button>
                                      </div>
                                    ))}
                                    
                                    {(option.pricing_tiers || []).length > 0 && (
                                      <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>
                                        Base: {currencySymbol}{(parseFloat(editingProduct.price || 0) + (parseFloat(option.price_modifier) || 0)).toFixed(2)}
                                        {(option.pricing_tiers || []).filter(t => t.min_qty > 0 && t.price > 0).sort((a, b) => a.min_qty - b.min_qty).map((t, i) => (
                                          <span key={i}> → {t.min_qty}+: {currencySymbol}{t.price.toFixed(2)}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const newOptions = [...(editingProduct.variation_options || [])];
                                newOptions.push({ name: '', price_modifier: 0, stock: 0, images: [], pricing_tiers: [] });
                                setEditingProduct({ ...editingProduct, variation_options: newOptions });
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
                    <h4>📦 General Quantity Pricing (Wholesale)</h4>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px' }}>
                      Set default bulk pricing for products without variation-specific tiers.
                    </p>
                    
                    {(editingProduct.pricing_tiers || []).length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        color: '#555'
                      }}>
                        <div style={{ width: '120px' }}>Min. Quantity</div>
                        <div style={{ width: '120px' }}>Unit Price ({currencySymbol})</div>
                        <div style={{ width: '30px' }}></div>
                      </div>
                    )}
                    
                    {(editingProduct.pricing_tiers || []).map((tier, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <input
                          type="number"
                          min="1"
                          value={tier.min_qty || ''}
                          onChange={(e) => {
                            const newTiers = [...(editingProduct.pricing_tiers || [])];
                            newTiers[index] = { ...tier, min_qty: parseInt(e.target.value) || 0 };
                            setEditingProduct({ ...editingProduct, pricing_tiers: newTiers });
                          }}
                          placeholder="e.g. 10"
                          style={{ width: '120px', fontSize: '14px' }}
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.price || ''}
                          onChange={(e) => {
                            const newTiers = [...(editingProduct.pricing_tiers || [])];
                            newTiers[index] = { ...tier, price: parseFloat(e.target.value) || 0 };
                            setEditingProduct({ ...editingProduct, pricing_tiers: newTiers });
                          }}
                          placeholder="e.g. 1.50"
                          style={{ width: '120px', fontSize: '14px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            const newTiers = (editingProduct.pricing_tiers || []).filter((_, i) => i !== index);
                            setEditingProduct({ ...editingProduct, pricing_tiers: newTiers });
                          }}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >🗑️</button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        const newTiers = [...(editingProduct.pricing_tiers || [])];
                        newTiers.push({ min_qty: 0, price: 0 });
                        setEditingProduct({ ...editingProduct, pricing_tiers: newTiers });
                      }}
                    >
                      + Add Pricing Tier
                    </button>
                    
                    {(editingProduct.pricing_tiers || []).length > 0 && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
                        <strong>Preview:</strong> Base price: {currencySymbol}{parseFloat(editingProduct.price || 0).toFixed(2)}
                        {(editingProduct.pricing_tiers || [])
                          .filter(t => t.min_qty > 0 && t.price > 0)
                          .sort((a, b) => a.min_qty - b.min_qty)
                          .map((t, i) => (
                            <span key={i}> → {t.min_qty}+ units: {currencySymbol}{t.price.toFixed(2)}</span>
                          ))
                        }
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h4>Product Specifications</h4>
                    <div className="form-row">
                      <div className="form-group" style={{marginBottom: '0.3rem'}}>
                        <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Material</label>
                        <input
                          type="text"
                          value={editingProduct.material || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                          placeholder="e.g.: Cotton, Leather, Metal"
                        />
                      </div>
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
                    <button type="submit" className="btn btn-primary" disabled={editingProduct._uploading}>
                      {editingProduct._uploading ? '⏳ Wait for upload...' : 'Update Product'}
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
                      <td>${user.total_spent ? user.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
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
                        <span>${selectedUser.user.total_spent ? selectedUser.user.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
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
                              <td>
                                ${order.total_amount ? 
                                  order.total_amount.toLocaleString('en-US', { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  }) : 
                                  '0.00'
                                }
                              </td>
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
                            {(() => {
                              // Check if variation_type is a number (ID from management)
                              if (product.variation_type && !isNaN(product.variation_type)) {
                                const varType = variationTypes.find(t => t.id.toString() === product.variation_type.toString());
                                return varType ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '12px', opacity: 0.7 }}>📋</span>
                                    {varType.name}
                                  </span>
                                ) : `Type #${product.variation_type}`;
                              }
                              // Legacy string-based types
                              if (product.variation_type === 'color') return 'Color';
                              if (product.variation_type === 'size') return 'Size';
                              if (product.variation_type === 'weight') return 'Weight';
                              if (product.variation_type === 'custom') return product.variation_name || 'Custom';
                              return product.variation_name || 'Unknown';
                            })()}
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
                    <th>Options Count</th>
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
                    
                    {/* Show existing options for this variation type */}
                    <div className="form-group" style={{marginBottom: '0.3rem'}}>
                      <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>
                        Existing Options: {variationOptions.filter(opt => opt.variation_type_id === editingVariationType.id).length}
                      </label>
                      {variationOptions.filter(opt => opt.variation_type_id === editingVariationType.id).length > 0 && (
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          padding: '10px',
                          borderRadius: '4px',
                          marginTop: '5px',
                          fontSize: '0.9rem'
                        }}>
                          {variationOptions
                            .filter(opt => opt.variation_type_id === editingVariationType.id)
                            .map(opt => opt.name)
                            .join(', ')}
                        </div>
                      )}
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
                                <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Sale Price ({currencySymbol})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={(() => {
                                    const basePrice = parseFloat(selectedProductForVariations.price) || 0;
                                    const modifier = parseFloat(option.price_modifier) || 0;
                                    return basePrice + modifier || '';
                                  })()}
                                  onChange={(e) => {
                                    const basePrice = parseFloat(selectedProductForVariations.price) || 0;
                                    const finalPrice = parseFloat(e.target.value) || 0;
                                    const newOptions = [...selectedProductForVariations.variation_options];
                                    newOptions[index].price_modifier = parseFloat((finalPrice - basePrice).toFixed(2));
                                    setSelectedProductForVariations({
                                      ...selectedProductForVariations,
                                      variation_options: newOptions
                                    });
                                  }}
                                  placeholder={`${parseFloat(selectedProductForVariations.price) || 0}`}
                                />
                                <small>Base price: {currencySymbol}{parseFloat(selectedProductForVariations.price || 0).toFixed(2)} | Difference: {(option.price_modifier || 0) >= 0 ? '+' : ''}{currencySymbol}{(option.price_modifier || 0).toFixed(2)}</small>
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
                        <strong>${order.total_amount ? order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</strong>
                        <small>
                          <div>Subtotal: ${order.subtotal ? order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                          <div>Shipping: ${order.shipping_cost ? order.shipping_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                          <div>Tax: ${order.tax_amount ? order.tax_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
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
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              if (order.has_shipment) {
                                handleViewOrderDetails(order.id);
                              } else {
                                setSelectedOrderForShipping(order);
                                setShowShipOrderModal(true);
                              }
                            }}
                            title={order.has_shipment ? "View Shipment" : "Ship Order"}
                            style={{
                              backgroundColor: order.has_shipment ? '#10b981' : '#f59e0b',
                              borderColor: order.has_shipment ? '#10b981' : '#f59e0b'
                            }}
                          >
                            {order.has_shipment ? '📦✓' : '📦'}
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
                          onClick={() => handleViewMessage(message)}
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
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteMessage(message.id)}
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

          {/* Message View Modal */}
          {showMessageModal && selectedMessage && (
            <div className="modal-overlay" onClick={handleCloseMessageModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                  <h3>Message Details</h3>
                  <button className="modal-close" onClick={handleCloseMessageModal}>&times;</button>
                </div>
                <div className="modal-body">
                  <div style={{ marginBottom: '15px' }}>
                    <strong>From:</strong> {selectedMessage.name}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Subject:</strong> {selectedMessage.subject}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge ${selectedMessage.is_read ? 'read' : 'unread'}`}>
                      {selectedMessage.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <strong>Message:</strong>
                    <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="btn btn-primary"
                  >
                    Reply via Email
                  </a>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                  >
                    Delete
                  </button>
                  <button className="btn btn-secondary" onClick={handleCloseMessageModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
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

          {/* Invoice Filters - Modern Design */}
          <div className="invoice-filters-section">
            <div className="filter-header">
              <div className="filter-title">
                <h3>🔍 Filter Invoices</h3>
                <p>Search and filter your invoices efficiently</p>
              </div>
              <div className="filter-status">
                <span className="filter-count">{invoicePagination.total || 0} total invoices</span>
              </div>
            </div>
            
            <div className="filter-content">
              <div className="filter-row-primary">
                <div className="filter-input-group">
                  <label>🔍 Search</label>
                  <input
                    type="text"
                    placeholder="Invoice number, customer name, or email..."
                    value={invoiceFilters.search}
                    onChange={(e) => setInvoiceFilters({...invoiceFilters, search: e.target.value})}
                    className="search-input-modern"
                  />
                </div>
                <div className="filter-input-group">
                  <label>📊 Status</label>
                  <select 
                    value={invoiceFilters.status}
                    onChange={(e) => setInvoiceFilters({...invoiceFilters, status: e.target.value})}
                    className="status-select-modern"
                  >
                    <option value="">All Status</option>
                    <option value="draft">📝 Draft</option>
                    <option value="sent">📤 Sent</option>
                    <option value="paid">✅ Paid</option>
                    <option value="overdue">⚠️ Overdue</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="filter-row-secondary">
                <div className="filter-input-group">
                  <label>📅 From Date</label>
                  <input
                    type="date"
                    value={invoiceFilters.date_from}
                    onChange={(e) => setInvoiceFilters({...invoiceFilters, date_from: e.target.value})}
                    className="date-input-modern"
                  />
                </div>
                <div className="filter-input-group">
                  <label>📅 To Date</label>
                  <input
                    type="date"
                    value={invoiceFilters.date_to}
                    onChange={(e) => setInvoiceFilters({...invoiceFilters, date_to: e.target.value})}
                    className="date-input-modern"
                  />
                </div>
                <div className="filter-actions-group">
                  <button 
                    className="btn-modern btn-primary" 
                    onClick={handleFilterInvoices}
                  >
                    ✨ Apply Filters
                  </button>
                  <button 
                    className="btn-modern btn-clear" 
                    onClick={handleClearInvoiceFilters}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>
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
                            className="btn-small btn-secondary"
                            onClick={() => window.open(createApiUrl(`api/invoices/${invoice.id}/preview-pdf`), '_blank')}
                            title="Preview PDF"
                          >
                            🖨️
                          </button>
                          <button 
                            className="btn-small btn-success"
                            onClick={async () => {
                              try {
                                const res = await fetch(createApiUrl(`api/invoices/${invoice.id}/send-email`), {
                                  method: 'POST',
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({ send_copy_to_admin: true })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  toast.success(`Invoice sent to ${data.email_sent_to}`);
                                  fetchInvoices();
                                } else {
                                  toast.error(data.error || 'Failed to send');
                                }
                              } catch (err) {
                                toast.error('Error sending invoice');
                              }
                            }}
                            title={`Email to ${invoice.customer_email}`}
                          >
                            📧
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
                  📄 Download PDF
                </button>
                <button 
                  className="btn btn-info"
                  onClick={() => window.open(createApiUrl(`api/invoices/${selectedInvoice.id}/preview-pdf`), '_blank')}
                >
                  🖨️ Preview PDF
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => {
                    setEditingInvoice(selectedInvoice);
                    setShowInvoiceDetails(false);
                  }}
                >
                  ✏️ Edit Invoice
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
                       selectedOrder.payment_status === 'failed' ? 'Failed' : selectedOrder.payment_status}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label style={{marginBottom: '0.1rem', fontSize: '0.85rem'}}>Payment Method:</label>
                    <span>{selectedOrder.payment_method === 'credit_card' ? 'Credit Card' : selectedOrder.payment_method === 'paypal' ? 'PayPal' : selectedOrder.payment_method || 'N/A'}</span>
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
                              : createApiUrl(item.product.image_url.startsWith('/') ? item.product.image_url.slice(1) : item.product.image_url)
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

              {/* Shipping Labels — All shipments */}
              {(selectedOrder.all_shipments?.length > 0 || selectedOrder.shipment) && (
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>🎫 Shipping Labels ({selectedOrder.all_shipments?.length || 1})</h3>
                  {(selectedOrder.all_shipments || (selectedOrder.shipment ? [selectedOrder.shipment] : [])).map((ship, idx) => (
                    <div key={ship.id || idx} style={{
                      background: ship.status === 'cancelled' ? '#fef2f2' : ship.is_active ? '#f0fdf4' : '#f8fafc',
                      border: `2px solid ${ship.status === 'cancelled' ? '#fca5a5' : ship.is_active ? '#86efac' : '#e2e8f0'}`,
                      borderRadius: 10, padding: '0.75rem', marginBottom: '0.5rem', opacity: ship.status === 'cancelled' ? 0.6 : 1
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                          <span>📦 {ship.carrier} — {ship.service_type}</span>
                          {ship.tracking_number && (
                            <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>
                              {ship.tracking_number}
                            </span>
                          )}
                          {ship.is_active && ship.status !== 'cancelled' && (
                            <span style={{ background: '#22c55e', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>ACTIVE</span>
                          )}
                          {ship.status === 'cancelled' && (
                            <span style={{ background: '#ef4444', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>CANCELLED</span>
                          )}
                          {ship.label_cost > 0 && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>${ship.label_cost?.toFixed(2)}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {ship.label_url && (
                            <button className="btn btn-sm btn-primary" onClick={() => {
                              const printUrl = createApiUrl(`api/shipping-labels/print/${ship.id}`) + `?token=${localStorage.getItem('token')}`;
                              window.open(printUrl, '_blank');
                            }}>🖨️</button>
                          )}
                          {ship.tracking_url && (
                            <button className="btn btn-sm btn-secondary" onClick={() => window.open(ship.tracking_url, '_blank')}>📍</button>
                          )}
                          {!ship.is_active && ship.status !== 'cancelled' && (
                            <button className="btn btn-sm btn-success" title="Set as active" onClick={async () => {
                              try {
                                await fetch(createApiUrl(`api/shipping-labels/shipment/${ship.id}/set-active`), { method: 'POST', headers: getAuthHeaders() });
                                toast.success('Shipment set as active');
                                handleViewOrderDetails(selectedOrder.id);
                              } catch { toast.error('Error'); }
                            }}>✓ Active</button>
                          )}
                          {ship.status !== 'cancelled' && (
                            <button className="btn btn-sm btn-danger" title="Cancel & refund" onClick={async () => {
                              if (!window.confirm('Cancel this shipment? Refund will be requested if possible.')) return;
                              try {
                                const res = await fetch(createApiUrl(`api/shipping-labels/shipment/${ship.id}/cancel`), { method: 'POST', headers: getAuthHeaders() });
                                const data = await res.json();
                                toast.success(`Cancelled. ${data.refund_result || ''}`);
                                handleViewOrderDetails(selectedOrder.id);
                              } catch { toast.error('Error'); }
                            }}>✕</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-warning" onClick={() => {
                  setSelectedOrderForShipping(selectedOrder);
                  setShowShipOrderModal(true);
                  setShowOrderDetails(false);
                }}>🎫 {selectedOrder.has_shipment ? 'New Shipping Label' : 'Create Shipping Label'}</button>
              </div>
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

      {activeTab === 'newsletter-management' && (
        <NewsletterManagement />
      )}

      {activeTab === 'newsletter-campaign' && (
        <NewsletterCampaign />
      )}

      {activeTab === 'payment-methods' && (
        <PaymentMethods />
      )}

      {activeTab === 'shipping' && (
        <ShippingManagement />
      )}

      {activeTab === 'theme-packs' && (
        <ThemePackManager />
      )}

      {activeTab === 'desktop-licenses' && (
        <DesktopLicenseManager />
      )}

      {activeTab === 'demo-settings' && (
        <DemoQuotaSettings />
      )}

      {activeTab === 'visitor-analytics' && (
        <VisitorAnalyticsPanel />
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

      {/* AI Product Modal */}
      <AIProductModal
        isOpen={aiProductModalOpen}
        onClose={() => setAiProductModalOpen(false)}
        onApplyProduct={handleAIProductApply}
        categories={categories}
      />

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={aiSettingsModalOpen}
        onClose={() => setAiSettingsModalOpen(false)}
      />

      {/* Ship Order Modal - EasyPost Integration */}
      {showShipOrderModal && selectedOrderForShipping && (
        <ShippingLabelModal
          order={selectedOrderForShipping}
          onClose={() => {
            setShowShipOrderModal(false);
            setSelectedOrderForShipping(null);
          }}
          onSuccess={() => {
            setShowShipOrderModal(false);
            setSelectedOrderForShipping(null);
            fetchOrders();
            toast.success('Shipping label created successfully!');
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;


// ==================== Visitor Analytics Panel ====================
function VisitorAnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeView, setActiveView] = useState('daily');
  const [excludeLocal, setExcludeLocal] = useState(true);
  const [myIp, setMyIp] = useState('');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetch('/api/analytics/my-ip', { headers: getAuthHeaders() })
      .then(r => r.json()).then(d => setMyIp(d.ip || '')).catch(() => {});
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let url = `/api/analytics/stats?days=${days}`;
      if (excludeLocal) {
        url += '&exclude_local=true';
        if (myIp) url += `&exclude_ip=${encodeURIComponent(myIp)}`;
      }
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Visitor stats error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, [days, excludeLocal, myIp]);

  const handleReset = async () => {
    if (!window.confirm('Tüm ziyaretçi verilerini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/analytics/reset', {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ mode: 'all' })
      });
      const d = await res.json();
      if (d.success) { alert(`${d.deleted} kayıt silindi`); fetchStats(); }
    } catch (e) { alert('Hata: ' + e.message); }
  };

  const FLAG = (code) => {
    if (!code || code === 'XX') return '🏳️';
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
  };

  if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Loading analytics...</div>;
  if (!data) return <div style={{padding: 40, textAlign: 'center'}}>Failed to load analytics</div>;

  return (
    <div style={{padding: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
        <h2 style={{margin: 0}}>🌍 Visitor Analytics</h2>
        <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
          <label style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', background: excludeLocal ? '#e8f5e9' : '#fce4ec', padding: '5px 10px', borderRadius: 6}}>
            <input type="checkbox" checked={excludeLocal} onChange={e => setExcludeLocal(e.target.checked)} />
            {excludeLocal ? '🚫 Admin hariç' : '👁️ Tümü'}
          </label>
          {myIp && <span style={{fontSize: 10, color: '#999'}}>IP: {myIp}</span>}
          {[{d: 1, l: 'Bugün'}, {d: 7, l: '7g'}, {d: 30, l: '30g'}, {d: 90, l: '90g'}, {d: 365, l: '1y'}].map(({d, l}) => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: days === d ? '#3498db' : '#ecf0f1', color: days === d ? '#fff' : '#333',
              fontWeight: days === d ? 600 : 400, fontSize: 12
            }}>{l}</button>
          ))}
          <button onClick={fetchStats} style={{padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#2ecc71', color: '#fff', fontSize: 12}}>🔄</button>
          <button onClick={handleReset} style={{padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#e74c3c', color: '#fff', fontSize: 12}}>🗑️ Reset</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20}}>
        <div style={{background: '#fff3e0', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '2px solid #ffcc80'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#e65100'}}>{data.today_visits || 0}</div>
          <div style={{color: '#bf360c', fontSize: 12, fontWeight: 600}}>📅 Bugün</div>
          <div style={{color: '#999', fontSize: 10}}>{data.today_unique || 0} tekil</div>
        </div>
        <div style={{background: '#e3f2fd', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '2px solid #90caf9'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#1565c0'}}>{data.total_visits}</div>
          <div style={{color: '#1565c0', fontSize: 12, fontWeight: 600}}>📊 Toplam</div>
          <div style={{color: '#999', fontSize: 10}}>{days} gün</div>
        </div>
        <div style={{background: '#e8f5e9', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '2px solid #a5d6a7'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#2e7d32'}}>{data.unique_visitors}</div>
          <div style={{color: '#2e7d32', fontSize: 12, fontWeight: 600}}>👤 Tekil</div>
        </div>
        <div style={{background: '#f3e5f5', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '2px solid #ce93d8'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#7b1fa2'}}>{data.countries?.length || 0}</div>
          <div style={{color: '#7b1fa2', fontSize: 12, fontWeight: 600}}>🌍 Ülke</div>
        </div>
        <div style={{background: '#fff8e1', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '2px solid #ffe082'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#f57f17'}}>{data.total_visits > 0 && data.daily?.length > 0 ? Math.round(data.total_visits / data.daily.length) : 0}</div>
          <div style={{color: '#f57f17', fontSize: 12, fontWeight: 600}}>📈 Günlük Ort.</div>
        </div>
        {data.device_stats && (
          <div style={{background: '#e0f7fa', borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: '2px solid #80deea'}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: 12}}>
              <div><span style={{fontSize: 18}}>📱</span><div style={{fontSize: 16, fontWeight: 700, color: '#00695c'}}>{data.device_stats.mobile || 0}</div></div>
              <div><span style={{fontSize: 18}}>💻</span><div style={{fontSize: 16, fontWeight: 700, color: '#00695c'}}>{data.device_stats.desktop || 0}</div></div>
            </div>
            <div style={{color: '#00695c', fontSize: 11, fontWeight: 600, marginTop: 4}}>Mobil / Masaüstü</div>
          </div>
        )}
      </div>

      {/* Tab Buttons */}
      <div style={{display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap'}}>
        {[
          {key: 'daily', label: '📊 Günlük'}, {key: 'countries', label: '🌍 Ülkeler'},
          {key: 'cities', label: '🏙️ Şehirler'}, {key: 'pages', label: '📄 Sayfalar'},
          {key: 'referrers', label: '🔗 Referrer'}, {key: 'recent', label: '🕐 Son Ziyaretler'},
          {key: 'map', label: '🗺️ Harita'}
        ].map(v => (
          <button key={v.key} onClick={() => setActiveView(v.key)} style={{
            padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: activeView === v.key ? '#3498db' : '#ecf0f1', color: activeView === v.key ? '#fff' : '#333',
            fontWeight: activeView === v.key ? 600 : 400, fontSize: 12
          }}>{v.label}</button>
        ))}
      </div>

      {/* World Map */}
      {activeView === 'map' && (
        <WorldMapChart countries={data.countries || []} />
      )}

      {/* Countries Table */}
      {activeView === 'countries' && (
        <div style={{background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>#</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Country</th>
                <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13}}>Visits</th>
                <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13}}>Unique</th>
                <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13}}>%</th>
              </tr>
            </thead>
            <tbody>
              {data.countries?.map((c, i) => (
                <tr key={c.code} style={{borderTop: '1px solid #eee'}}>
                  <td style={{padding: '10px 16px', fontSize: 13}}>{i + 1}</td>
                  <td style={{padding: '10px 16px', fontSize: 13}}>{FLAG(c.code)} {c.name}</td>
                  <td style={{padding: '10px 16px', textAlign: 'right', fontWeight: 600}}>{c.visits}</td>
                  <td style={{padding: '10px 16px', textAlign: 'right', color: '#888'}}>{c.unique_visitors}</td>
                  <td style={{padding: '10px 16px', textAlign: 'right', color: '#888'}}>{data.total_visits ? ((c.visits / data.total_visits) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
              {(!data.countries || data.countries.length === 0) && (
                <tr><td colSpan={5} style={{padding: 30, textAlign: 'center', color: '#aaa'}}>No visitor data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cities Table */}
      {activeView === 'cities' && (
        <div style={{background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>#</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>City</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Country</th>
                <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13}}>Visits</th>
              </tr>
            </thead>
            <tbody>
              {data.top_cities?.map((c, i) => (
                <tr key={i} style={{borderTop: '1px solid #eee'}}>
                  <td style={{padding: '10px 16px', fontSize: 13}}>{i + 1}</td>
                  <td style={{padding: '10px 16px', fontSize: 13, fontWeight: 500}}>{c.city}</td>
                  <td style={{padding: '10px 16px', fontSize: 13, color: '#888'}}>{c.country}</td>
                  <td style={{padding: '10px 16px', textAlign: 'right', fontWeight: 600}}>{c.visits}</td>
                </tr>
              ))}
              {(!data.top_cities || data.top_cities.length === 0) && (
                <tr><td colSpan={4} style={{padding: 30, textAlign: 'center', color: '#aaa'}}>No city data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Pages Table */}
      {activeView === 'pages' && (
        <div style={{background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>#</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Page</th>
                <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13}}>Visits</th>
              </tr>
            </thead>
            <tbody>
              {data.top_pages?.map((p, i) => (
                <tr key={i} style={{borderTop: '1px solid #eee'}}>
                  <td style={{padding: '10px 16px', fontSize: 13}}>{i + 1}</td>
                  <td style={{padding: '10px 16px', fontSize: 13, fontFamily: 'monospace'}}>{p.page}</td>
                  <td style={{padding: '10px 16px', textAlign: 'right', fontWeight: 600}}>{p.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Chart (simple bar) */}
      {activeView === 'daily' && (
        <div style={{background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{margin: '0 0 16px', fontSize: 15}}>📊 Günlük Ziyaretler</h3>
          {data.daily?.length > 0 ? (
            <div style={{overflowX: 'auto'}}>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 2, height: 220, minWidth: data.daily.length * 28}}>
                {data.daily.map((d, i) => {
                  const maxV = Math.max(...data.daily.map(x => x.visits), 1);
                  const h = (d.visits / maxV) * 180;
                  const isToday = d.date === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 26, flex: 1}}>
                      <div style={{fontSize: 9, color: isToday ? '#e65100' : '#888', fontWeight: isToday ? 700 : 400, marginBottom: 4}}>{d.visits}</div>
                      <div style={{width: '80%', height: h, borderRadius: '4px 4px 0 0', minHeight: 2, background: isToday ? '#ff9800' : '#3498db'}} title={`${d.date}: ${d.visits} ziyaret, ${d.unique_visitors} tekil`} />
                      <div style={{fontSize: 8, color: isToday ? '#e65100' : '#aaa', fontWeight: isToday ? 700 : 400, marginTop: 4, transform: 'rotate(-45deg)', whiteSpace: 'nowrap'}}>{d.date.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', color: '#aaa', padding: 40}}>Henüz günlük veri yok</div>
          )}
        </div>
      )}

      {/* Recent Visitors */}
      {activeView === 'recent' && (
        <div style={{background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Zaman</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Cihaz</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Ülke</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Şehir</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Sayfa</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Kaynak</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>IP</th>
              </tr>
            </thead>
            <tbody>
              {data.recent?.map((v, i) => (
                <tr key={i} style={{borderTop: '1px solid #eee'}}>
                  <td style={{padding: '10px 16px', fontSize: 12, color: '#888', whiteSpace: 'nowrap'}}>{v.time ? new Date(v.time).toLocaleString() : ''}</td>
                  <td style={{padding: '10px 16px', fontSize: 13}} title={v.device?.os + ' / ' + v.device?.browser}>{v.device?.icon} {v.device?.browser}</td>
                  <td style={{padding: '10px 16px', fontSize: 13}}>{FLAG(v.country_code)} {v.country}</td>
                  <td style={{padding: '10px 16px', fontSize: 13, color: '#555'}}>{v.city || '-'}</td>
                  <td style={{padding: '10px 16px', fontSize: 12, fontFamily: 'monospace'}}>{v.page}</td>
                  <td style={{padding: '10px 16px', fontSize: 11, color: '#666', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{v.referrer || '-'}</td>
                  <td style={{padding: '10px 16px', fontSize: 11, color: '#aaa'}}>{v.ip}</td>
                </tr>
              ))}
              {(!data.recent || data.recent.length === 0) && (
                <tr><td colSpan={7} style={{padding: 30, textAlign: 'center', color: '#aaa'}}>Henüz ziyaretçi yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Referrers Table */}
      {activeView === 'referrers' && (
        <div style={{background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>#</th>
                <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13}}>Kaynak (Referrer)</th>
                <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13}}>Ziyaret</th>
              </tr>
            </thead>
            <tbody>
              {data.top_referrers?.map((r, i) => (
                <tr key={i} style={{borderTop: '1px solid #eee'}}>
                  <td style={{padding: '10px 16px', fontSize: 13}}>{i + 1}</td>
                  <td style={{padding: '10px 16px', fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all'}}>{r.referrer || '(Direkt)'}</td>
                  <td style={{padding: '10px 16px', textAlign: 'right', fontWeight: 600}}>{r.visits}</td>
                </tr>
              ))}
              {(!data.top_referrers || data.top_referrers.length === 0) && (
                <tr><td colSpan={3} style={{padding: 30, textAlign: 'center', color: '#aaa'}}>Henüz referrer verisi yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ==================== Desktop License Manager ====================
function DesktopLicenseManager() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLicenseUserId, setNewLicenseUserId] = useState('');
  const [newLicenseProduct, setNewLicenseProduct] = useState('movie-maker');
  const { user } = useAuth();
  const PER_PAGE = 50;

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchLicenses = async (p, search) => {
    const currentPage = p !== undefined ? p : page;
    const currentSearch = search !== undefined ? search : searchDebounce;
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(currentPage), per_page: String(PER_PAGE) });
      if (currentSearch) params.set('search', currentSearch);
      const res = await fetch(createApiUrl('api/desktop/license/admin/list') + '?' + params.toString(), {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLicenses(data.licenses || []);
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLicenses(1, ''); }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
      setPage(1);
      fetchLicenses(1, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleResetMachine = async (id) => {
    if (!window.confirm('Bu lisansın makine bağlantısını sıfırlamak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/reset-machine`), {
        method: 'POST', headers: getAuthHeaders()
      });
      if (res.ok) { toast.success('Machine reset'); fetchLicenses(); }
      else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Bu lisansı iptal etmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/revoke`), {
        method: 'POST', headers: getAuthHeaders()
      });
      if (res.ok) { toast.success('License revoked'); fetchLicenses(); }
      else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleActivate = async (id) => {
    try {
      const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/activate`), {
        method: 'POST', headers: getAuthHeaders()
      });
      if (res.ok) { toast.success('License activated'); fetchLicenses(); }
      else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu lisansı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}`), {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (res.ok) { toast.success('License deleted'); fetchLicenses(); }
      else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleSetMaxMachines = async (id, currentMax) => {
    const input = window.prompt(`Maksimum makine sayısını girin (şu an: ${currentMax}):`, String(currentMax));
    if (!input) return;
    const val = parseInt(input);
    if (isNaN(val) || val < 1) { toast.error('Geçersiz değer (min 1)'); return; }
    try {
      const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/set-max-machines`), {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ max_machines: val })
      });
      if (res.ok) { toast.success(`Max machines: ${val}`); fetchLicenses(); }
      else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleCreate = async () => {
    if (!newLicenseUserId) return;
    try {
      const res = await fetch(createApiUrl('api/desktop/license/admin/create'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: parseInt(newLicenseUserId), product_key: newLicenseProduct })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('License created');
        setShowCreateModal(false);
        setNewLicenseUserId('');
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Error'); }
  };

  const handleGrantPromo = async (id, currentType, currentExpires, productKey) => {
    const isPCode = productKey === 'pebdeq-code';
    const promptText = isPCode ? 'Hangi mod? (ollama / pro / iptal)' : 'Hangi mod? (basic / pro / iptal)';
    const defaultType = isPCode ? (currentType === 'ollama' ? 'pro' : currentType) : (currentType === 'demo' ? 'pro' : currentType);
    const typeChoice = window.prompt(promptText, defaultType);
    if (!typeChoice) return;
    const chosenType = typeChoice.trim().toLowerCase();

    const resetType = isPCode ? 'ollama' : 'demo';
    const resetLabel = isPCode ? 'Ollama' : 'Demo';

    if (chosenType === 'iptal' || chosenType === resetType) {
      if (!window.confirm(`Promosyon iptal edilecek, kullanici ${resetLabel} moduna dusurulecek. Emin misiniz?`)) return;
      try {
        const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/set-type`), {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ license_type: resetType })
        });
        if (res.ok) { toast.success(`${resetLabel} moduna dusuruldu`); fetchLicenses(); }
        else toast.error('Basarisiz');
      } catch { toast.error('Hata'); }
      return;
    }

    const validTypes = isPCode ? ['ollama', 'pro'] : ['basic', 'pro'];
    if (!validTypes.includes(chosenType)) { toast.error(`Gecersiz. ${validTypes.join(', ')} veya iptal yazin.`); return; }

    const days = window.prompt('Bugunden itibaren kac gun ' + chosenType.toUpperCase() + '? (0 = iptal)', '30');
    if (days === null) return;
    const val = parseInt(days);
    if (isNaN(val) || val < 0) { toast.error('Gecersiz gun sayisi'); return; }

    if (val === 0) {
      if (!window.confirm(`0 gun = promosyon iptal. ${resetLabel} moduna dusurulecek. Emin misiniz?`)) return;
      try {
        const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/set-type`), {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ license_type: resetType })
        });
        if (res.ok) { toast.success(`${resetLabel} moduna dusuruldu`); fetchLicenses(); }
        else toast.error('Basarisiz');
      } catch { toast.error('Hata'); }
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + val);

    try {
      const res = await fetch(createApiUrl(`api/desktop/license/admin/${id}/set-type`), {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ license_type: chosenType, expires_at: expiresAt.toISOString() })
      });
      if (res.ok) { toast.success(val + ' gun ' + chosenType.toUpperCase() + ' verildi'); fetchLicenses(); }
      else toast.error('Basarisiz');
    } catch { toast.error('Hata'); }
  };

  const getRemainingDays = (lic) => {
    if (!['pro', 'basic', 'ollama'].includes(lic.license_type) || !lic.expires_at) return null;
    const now = new Date();
    const exp = new Date(lic.expires_at);
    const diff = Math.floor((exp - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Server-side search & pagination — no client-side filter needed
  const filtered = licenses;

  const statusBadge = (status) => {
    const colors = { active: '#10b981', revoked: '#ef4444', expired: '#f59e0b' };
    return (
      <span style={{
        padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
        background: `${colors[status] || '#666'}22`, color: colors[status] || '#666'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>🔐 Desktop Licenses ({totalCount})</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
        >
          + New License
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by email, name, or machine ID..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 16, boxSizing: 'border-box' }}
      />

      {loading ? <p>Loading...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px 6px' }}>User</th>
                <th style={{ padding: '8px 6px' }}>Product</th>
                <th style={{ padding: '8px 6px' }}>Status</th>
                <th style={{ padding: '8px 6px' }}>Lisans Türü</th>
                <th style={{ padding: '8px 6px' }}>Kalan Gün</th>
                <th style={{ padding: '8px 6px' }}>Promosyon Pro</th>
                <th style={{ padding: '8px 6px' }}>Kullanım</th>
                <th style={{ padding: '8px 6px' }}>Machine ID</th>
                <th style={{ padding: '8px 6px' }}>Machines</th>
                <th style={{ padding: '8px 6px' }}>Resets</th>
                <th style={{ padding: '8px 6px' }}>Last Verified</th>
                <th style={{ padding: '8px 6px' }}>IP</th>
                <th style={{ padding: '8px 6px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lic => (
                <tr key={lic.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 6px' }}>
                    <div style={{ fontWeight: 600 }}>{lic.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{lic.user_email}</div>
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                      background: lic.product_key === 'pebdeq-code' ? '#10b98122' : lic.product_key === 'desktop-pro' ? '#8b5cf622' : '#3b82f622',
                      color: lic.product_key === 'pebdeq-code' ? '#10b981' : lic.product_key === 'desktop-pro' ? '#7c3aed' : '#2563eb'
                    }}>
                      {lic.product_key === 'pebdeq-code' ? '💻 P-Code' : lic.product_key === 'desktop-pro' ? 'Desktop Pro' : 'Movie Maker'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 6px' }}>{statusBadge(lic.status)}</td>
                  <td style={{ padding: '8px 6px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                      background: lic.license_type === 'pro' ? '#8b5cf622' : lic.license_type === 'basic' ? '#3b82f622' : lic.license_type === 'ollama' ? '#06b6d422' : '#f9731622',
                      color: lic.license_type === 'pro' ? '#7c3aed' : lic.license_type === 'basic' ? '#2563eb' : lic.license_type === 'ollama' ? '#06b6d4' : '#ea580c'
                    }}>
                      {lic.license_type === 'pro' ? '⭐ Pro' : lic.license_type === 'basic' ? '🔷 Basic' : lic.license_type === 'ollama' ? '🦙 Ollama' : '🔸 Demo'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                    {(lic.license_type === 'pro' || lic.license_type === 'basic' || lic.license_type === 'ollama') && lic.expires_at ? (
                      <span style={{
                        fontWeight: 600,
                        color: getRemainingDays(lic) <= 3 ? '#ef4444' : getRemainingDays(lic) <= 7 ? '#f59e0b' : '#10b981'
                      }}>
                        {getRemainingDays(lic)} gün
                      </span>
                    ) : (lic.license_type === 'pro' || lic.license_type === 'basic') ? '∞' : '—'}
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <button
                      onClick={() => handleGrantPromo(lic.id, lic.license_type, lic.expires_at, lic.product_key)}
                      style={{
                        padding: '3px 8px', borderRadius: 4, border: '1px solid #8b5cf6',
                        background: '#f5f3ff', color: '#6d28d9', fontSize: '0.7rem',
                        cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap'
                      }}
                    >
                      🎁 Pro Ver
                    </button>
                  </td>
                  <td style={{ padding: '8px 6px', fontSize: '0.7rem' }}>
                    {(() => {
                      try {
                        const usage = JSON.parse(lic.daily_usage || '{}');
                        const keys = Object.keys(usage);
                        if (keys.length === 0) return <span style={{ color: '#999' }}>—</span>;
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {keys.filter(k => k !== 'max_avatars').map(k => (
                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                                <span style={{ color: '#6b7280' }}>{k.replace(/_/g, ' ')}</span>
                                <span style={{ fontWeight: 600, color: '#1f2937' }}>{usage[k]}</span>
                              </div>
                            ))}
                            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 2, paddingTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#8b5cf6' }}>👤 avatar</span>
                              <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{lic.avatar_count || 0}</span>
                            </div>
                          </div>
                        );
                      } catch { return <span style={{ color: '#999' }}>—</span>; }
                    })()}
                  </td>
                  <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {lic.machine_id ? lic.machine_id.split(',').map((m, i) => (
                      <div key={i}>{m.trim().substring(0, 12)}...</div>
                    )) : '—'}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                    <span
                      style={{ cursor: 'pointer', fontWeight: 600, color: lic.max_machines > 1 ? '#10b981' : '#666' }}
                      onClick={() => handleSetMaxMachines(lic.id, lic.max_machines)}
                      title="Tıklayarak değiştir"
                    >
                      {(lic.machine_id ? lic.machine_id.split(',').filter(m => m.trim()).length : 0)}/{lic.max_machines}
                    </span>
                  </td>
                  <td style={{ padding: '8px 6px' }}>{lic.reset_count}/{lic.max_resets_per_year}</td>
                  <td style={{ padding: '8px 6px', fontSize: '0.75rem' }}>
                    {lic.last_verified_at ? new Date(lic.last_verified_at).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td style={{ padding: '8px 6px', fontSize: '0.75rem', fontFamily: 'monospace' }}>{lic.last_ip || '—'}</td>
                  <td style={{ padding: '8px 6px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {lic.machine_id && (
                        <button onClick={() => handleResetMachine(lic.id)}
                          style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #f59e0b', background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', cursor: 'pointer' }}>
                          🔄 Reset
                        </button>
                      )}
                      {lic.status === 'active' ? (
                        <button onClick={() => handleRevoke(lic.id)}
                          style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #ef4444', background: '#fef2f2', color: '#991b1b', fontSize: '0.7rem', cursor: 'pointer' }}>
                          ⛔ Revoke
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(lic.id)}
                          style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #10b981', background: '#ecfdf5', color: '#065f46', fontSize: '0.7rem', cursor: 'pointer' }}>
                          ✅ Activate
                        </button>
                      )}
                      <button onClick={() => handleDelete(lic.id)}
                        style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #ccc', background: '#f9fafb', color: '#666', fontSize: '0.7rem', cursor: 'pointer' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={13} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No licenses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => { setPage(p => Math.max(1, p - 1)); fetchLicenses(Math.max(1, page - 1)); }}
            disabled={page <= 1}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', background: page <= 1 ? '#f3f4f6' : '#fff', cursor: page <= 1 ? 'default' : 'pointer', fontSize: '0.8rem' }}
          >← Önceki</button>
          <span style={{ fontSize: '0.85rem', color: '#374151' }}>
            Sayfa {page} / {totalPages}
          </span>
          <button
            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); fetchLicenses(Math.min(totalPages, page + 1)); }}
            disabled={page >= totalPages}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', background: page >= totalPages ? '#f3f4f6' : '#fff', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: '0.8rem' }}
          >Sonraki →</button>
        </div>
      )}

      {/* Create License Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3>Create License</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem' }}>User ID:</label>
              <input
                type="number"
                value={newLicenseUserId}
                onChange={e => setNewLicenseUserId(e.target.value)}
                placeholder="Enter user ID"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem' }}>Product:</label>
              <select
                value={newLicenseProduct}
                onChange={e => setNewLicenseProduct(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
              >
                <option value="movie-maker">🎬 Movie Maker</option>
                <option value="pebdeq-code">💻 P-Code</option>
                <option value="desktop-pro">Desktop Pro</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateModal(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreate}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ==================== Demo Quota Settings ====================
function DemoQuotaSettings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState('demo'); // 'demo' or 'basic'

  // All available sections for locked sections checkboxes
  const ALL_SECTIONS = [
    { id: 'pro_studio', label: '🎨 Pro Studio' },
    { id: 'voiceover', label: '🎙️ Voiceover / TTS' },
    { id: 'openai', label: '🧠 OpenAI Chat' },
    { id: 'music', label: '🎵 Müzik Stüdyo' },
    { id: 'video_editor', label: '🎬 Video Editör' },
    { id: 'image_studio', label: '📸 Image Studio' },
    { id: 'group_scene', label: '👥 Grup Sahne' },
    { id: 'montage', label: '🎬 Montaj' },
    { id: 'chat', label: '💬 Grok Chat' },
    { id: 'avatars', label: '👤 Avatarlar' },
  ];

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch(createApiUrl('api/desktop/license/admin/demo-config'), {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
        setEdits({});
      }
    } catch (err) {
      console.error('Failed to fetch demo configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleChange = (key, value) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = configs.map(c => ({
      config_key: c.config_key,
      config_value: edits[c.config_key] !== undefined ? edits[c.config_key] : c.config_value,
      label: c.label,
      config_type: c.config_type,
    }));
    // Also include any new edits for keys not yet in configs (e.g. new basic_ keys)
    Object.keys(edits).forEach(key => {
      if (!configs.find(c => c.config_key === key)) {
        updates.push({
          config_key: key,
          config_value: edits[key],
          label: key,
          config_type: key.includes('locked') ? 'permission' : 'quota',
        });
      }
    });
    try {
      const res = await fetch(createApiUrl('api/desktop/license/admin/demo-config'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ configs: updates })
      });
      if (res.ok) {
        toast.success('Ayarlar güncellendi');
        fetchConfigs();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch { toast.error('Hata'); }
    finally { setSaving(false); }
  };

  const hasChanges = Object.keys(edits).length > 0;

  // Filter configs by tier
  const prefix = tier === 'basic' ? 'basic_' : '';
  const quotaConfigs = configs.filter(c => {
    if (c.config_type !== 'quota') return false;
    if (tier === 'basic') return c.config_key.startsWith('basic_');
    return !c.config_key.startsWith('basic_');
  });

  // Get locked sections for current tier
  const lockKey = tier === 'basic' ? 'basic_locked_sections' : 'locked_sections';
  const lockConfig = configs.find(c => c.config_key === lockKey);
  const currentLockValue = edits[lockKey] !== undefined ? edits[lockKey] : (lockConfig ? lockConfig.config_value : '');
  const selectedSections = currentLockValue ? currentLockValue.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleSection = (sectionId) => {
    let updated;
    if (selectedSections.includes(sectionId)) {
      updated = selectedSections.filter(s => s !== sectionId);
    } else {
      updated = [...selectedSections, sectionId];
    }
    handleChange(lockKey, updated.join(','));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>⚙️ Kota & İzin Ayarları</h2>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            padding: '8px 20px', borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            background: hasChanges ? '#3b82f6' : '#cbd5e1',
            color: hasChanges ? '#fff' : '#94a3b8',
          }}
        >
          {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </div>

      {/* Tier Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e5e7eb' }}>
        {[
          { key: 'demo', label: '🔸 Demo', color: '#f59e0b' },
          { key: 'basic', label: '🔷 Basic', color: '#3b82f6' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTier(t.key)}
            style={{
              padding: '10px 24px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              background: tier === t.key ? '#fff' : 'transparent',
              color: tier === t.key ? t.color : '#6b7280',
              borderBottom: tier === t.key ? `3px solid ${t.color}` : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 20 }}>
        {tier === 'demo' ? 'Demo' : 'Basic'} kullanıcıların günlük kota limitleri ve kilitli bölüm ayarları. Değişiklikler kullanıcı uygulamayı bir sonraki açışında geçerli olur.
      </p>

      {loading ? <p>Yükleniyor...</p> : (
        <>
          {/* Kota Limitleri */}
          <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: 12 }}>📊 Günlük Kota Limitleri ({tier === 'demo' ? 'Demo' : 'Basic'})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 28 }}>
            {quotaConfigs.map(c => {
              const val = edits[c.config_key] !== undefined ? edits[c.config_key] : c.config_value;
              const isEdited = edits[c.config_key] !== undefined;
              const displayLabel = (c.label || c.config_key).replace(/ \(Basic\)$/, '').replace(/ \(Demo\)$/, '');
              return (
                <div key={c.id} style={{
                  padding: 14, background: '#fff', borderRadius: 8,
                  border: isEdited ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937' }}>
                      {displayLabel}
                    </label>
                    {isEdited && <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 600 }}>değişti</span>}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{c.config_key}</span>
                  <input
                    type="number"
                    min="0"
                    value={val}
                    onChange={e => handleChange(c.config_key, e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db',
                      fontSize: '1.1rem', fontWeight: 700, width: 120, textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Günlük maksimum kullanım</span>
                </div>
              );
            })}
            {quotaConfigs.length === 0 && (
              <p style={{ color: '#999', fontSize: '0.85rem' }}>Bu tier için kota ayarı bulunamadı. Backend yeniden başlatıldığında oluşturulacak.</p>
            )}
          </div>

          {/* Kilitli Bölümler — Checkbox */}
          <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: 12 }}>🔒 Kilitli Bölümler ({tier === 'demo' ? 'Demo' : 'Basic'}'da Erişilemez)</h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8,
            padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb',
          }}>
            {ALL_SECTIONS.map(sec => {
              const checked = selectedSections.includes(sec.id);
              return (
                <label key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 6, cursor: 'pointer',
                  background: checked ? '#fef2f2' : '#f9fafb',
                  border: checked ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSection(sec.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: checked ? 600 : 400, color: checked ? '#dc2626' : '#374151' }}>
                    {sec.label}
                  </span>
                  {checked && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>🔒</span>}
                </label>
              );
            })}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 8 }}>
            İşaretli bölümler {tier === 'demo' ? 'Demo' : 'Basic'} kullanıcılar için kilitli olacak.
          </p>

          {/* İzinli Arka Plan Modelleri — Checkbox */}
          {(() => {
            const ALL_BG_MODELS = [
              { id: 'bria-rmbg', label: '🏆 Ultra Pro (bria-rmbg)' },
              { id: 'birefnet-general', label: '⭐ Pro (birefnet-general)' },
              { id: 'birefnet-general-lite', label: '🔹 Pro Lite (birefnet-general-lite)' },
              { id: 'birefnet-portrait', label: '👤 Portre (birefnet-portrait)' },
              { id: 'isnet-general-use', label: '⚡ Hızlı (isnet-general-use)' },
              { id: 'isnet-anime', label: '🎌 Anime (isnet-anime)' },
              { id: 'u2net', label: '🔧 Standart (u2net)' },
              { id: 'u2net_human_seg', label: '🧑 İnsan (u2net_human_seg)' },
              { id: 'silueta', label: '💨 Hafif (silueta)' },
            ];
            const bgKey = tier === 'basic' ? 'basic_allowed_bg_models' : 'allowed_bg_models';
            const bgConfig = configs.find(c => c.config_key === bgKey);
            const currentBgValue = edits[bgKey] !== undefined ? edits[bgKey] : (bgConfig ? bgConfig.config_value : '');
            const selectedBgModels = currentBgValue ? currentBgValue.split(',').map(s => s.trim()).filter(Boolean) : [];
            const toggleBgModel = (modelId) => {
              let updated;
              if (selectedBgModels.includes(modelId)) {
                updated = selectedBgModels.filter(s => s !== modelId);
              } else {
                updated = [...selectedBgModels, modelId];
              }
              handleChange(bgKey, updated.join(','));
            };
            return (
              <>
                <h3 style={{ fontSize: '1rem', color: '#374151', marginTop: 28, marginBottom: 12 }}>✂️ İzinli Arka Plan Modelleri ({tier === 'demo' ? 'Demo' : 'Basic'})</h3>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8,
                  padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb',
                }}>
                  {ALL_BG_MODELS.map(model => {
                    const checked = selectedBgModels.includes(model.id);
                    return (
                      <label key={model.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        borderRadius: 6, cursor: 'pointer',
                        background: checked ? '#f0fdf4' : '#f9fafb',
                        border: checked ? '1px solid #86efac' : '1px solid #e5e7eb',
                      }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBgModel(model.id)}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: checked ? 600 : 400, color: checked ? '#16a34a' : '#374151' }}>
                          {model.label}
                        </span>
                        {checked && <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>✓</span>}
                      </label>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 8 }}>
                  İşaretli modeller {tier === 'demo' ? 'Demo' : 'Basic'} kullanıcılar için kullanılabilir olacak. İşaretsiz modeller 🔒 Pro olarak görünecek.
                </p>
              </>
            );
          })()}

          {/* Pricing Tier Settings — Landing Page */}
          <h3 style={{ fontSize: '1rem', color: '#374151', marginTop: 32, marginBottom: 12 }}>💰 Landing Page Fiyat Kartları</h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 16 }}>
            Ana sayfadaki Demo / Basic / Pro karşılaştırma kartlarının başlık, alt başlık ve fiyat bilgileri.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {['demo', 'basic', 'pro'].map(tierKey => {
              const prefix = `pricing_${tierKey}_`;
              const fields = [
                { key: `${prefix}title`, label: 'Başlık', placeholder: tierKey === 'demo' ? 'Demo' : tierKey === 'basic' ? 'Basic' : 'Pro' },
                { key: `${prefix}subtitle`, label: 'Alt Başlık', placeholder: tierKey === 'demo' ? 'Ücretsiz deneyin' : tierKey === 'basic' ? 'Başlangıç paketi' : 'Sınırsız erişim' },
                { key: `${prefix}price`, label: '💰 İndirimli Fiyat', placeholder: tierKey === 'demo' ? '0' : tierKey === 'basic' ? '9.99' : '24.99' },
                { key: `${prefix}real_price`, label: '~~Gerçek Fiyat~~ (üzeri çizili)', placeholder: tierKey === 'demo' ? '0' : tierKey === 'basic' ? '19.99' : '49.99' },
                { key: `${prefix}period`, label: 'Periyot', placeholder: tierKey === 'demo' ? '' : '/ay' },
              ];
              const color = tierKey === 'demo' ? '#f59e0b' : tierKey === 'basic' ? '#3b82f6' : '#8b5cf6';
              return (
                <div key={tierKey} style={{ padding: 16, background: '#fff', borderRadius: 10, border: `2px solid ${color}20` }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color, marginBottom: 12, textTransform: 'uppercase' }}>
                    {tierKey === 'demo' ? '🔸 Demo' : tierKey === 'basic' ? '🔷 Basic' : '💎 Pro'}
                  </div>
                  {fields.map(f => {
                    const val = edits[f.key] !== undefined ? edits[f.key] : (configs.find(c => c.config_key === f.key)?.config_value || '');
                    return (
                      <div key={f.key} style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: 3 }}>{f.label}</label>
                        <input
                          value={val}
                          onChange={e => handleChange(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    );
                  })}
                  {/* Önizleme */}
                  {(() => {
                    const priceVal = edits[`${prefix}price`] !== undefined ? edits[`${prefix}price`] : (configs.find(c => c.config_key === `${prefix}price`)?.config_value || '');
                    const realVal  = edits[`${prefix}real_price`] !== undefined ? edits[`${prefix}real_price`] : (configs.find(c => c.config_key === `${prefix}real_price`)?.config_value || '');
                    const periodVal = edits[`${prefix}period`] !== undefined ? edits[`${prefix}period`] : (configs.find(c => c.config_key === `${prefix}period`)?.config_value || '');
                    return (
                      <div style={{ marginTop: 8, padding: '10px 14px', background: '#0f0c29', borderRadius: 8, textAlign: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block', marginBottom: 4 }}>Önizleme</span>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                            {parseFloat(priceVal) === 0 ? 'Ücretsiz' : (priceVal ? '$' + priceVal : '—')}
                          </span>
                          {realVal && parseFloat(realVal) !== parseFloat(priceVal) && (
                            <span style={{ position: 'absolute', top: -4, right: -48, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                              ${realVal}
                            </span>
                          )}
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{periodVal}</span>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {configs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <p style={{ fontSize: '1.2rem' }}>📭</p>
              <p>Henüz kota ayarı yok.</p>
              <p style={{ fontSize: '0.85rem' }}>Backend yeniden başlatıldığında varsayılan değerler otomatik oluşturulacak.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
