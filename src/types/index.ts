// ============================================
// CellTech Distributor B2B Portal - Type Definitions
// ============================================

// ====================
// Enums (matching database schema)
// ====================

export enum Brand {
  Apple = 'Apple',
  Samsung = 'Samsung',
  Motorola = 'Motorola',
  Other = 'Other',
}

export enum PartCategory {
  Screens = 'Screens',
  Batteries = 'Batteries',
  ChargingPorts = 'ChargingPorts',
  Cameras = 'Cameras',
  BackGlass = 'BackGlass',
  Other = 'Other',
}

export enum QualityGrade {
  OEM = 'OEM',
  Aftermarket = 'Aftermarket',
  Refurbished = 'Refurbished',
}

export enum OrderStatus {
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export enum UserRole {
  Guest = 'Guest',
  WholesaleCustomer = 'WholesaleCustomer',
  Admin = 'Admin',
}

export enum QuoteStatus {
  Pending = 'Pending',
  Quoted = 'Quoted',
  Closed = 'Closed',
}

// ====================
// Entity Types (matching Prisma schema)
// ====================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  brand: Brand;
  deviceModel: string;
  category: PartCategory;
  qualityGrade: QualityGrade;
  price: number;
  wholesalePrice: number;
  stockQuantity: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string;
  billingAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  product?: Product;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  taxId: string | null;
  role: UserRole;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string | null;
  guestId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

export interface QuoteRequest {
  id: string;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  companyName: string | null;
  message: string;
  status: QuoteStatus;
  quotedTotal: number | null;
  adminNotes: string | null;
  items: QuoteRequestItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteRequestItem {
  id: string;
  quoteRequestId: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  notes: string | null;
  createdAt: Date;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// API Types
// ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ====================
// Filter Types
// ====================

export interface ProductFilters {
  search?: string;
  brand?: Brand | Brand[];
  category?: PartCategory | PartCategory[];
  qualityGrade?: QualityGrade | QualityGrade[];
  priceRange?: PriceRange;
  inStock?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';
}

export interface PriceRange {
  min?: number;
  max?: number;
}

// ====================
// Form Types
// ====================

export interface CheckoutFormData {
  // Guest Information
  email: string;
  name: string;
  phone: string;
  
  // Company Information (optional)
  companyName?: string;
  taxId?: string;
  
  // Shipping Address
  shippingAddress: AddressFormData;
  
  // Billing Address
  billingSameAsShipping: boolean;
  billingAddress?: AddressFormData;
  
  // Order Details
  notes?: string;
  
  // Account Creation (optional)
  createAccount?: boolean;
  password?: string;
}

export interface AddressFormData {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface QuoteRequestFormData {
  // Contact Information
  email: string;
  name: string;
  phone: string;
  
  // Company Information
  companyName?: string;
  
  // Quote Details
  message: string;
  items: QuoteItemFormData[];
}

export interface QuoteItemFormData {
  productName: string;
  productSku?: string;
  quantity: number;
  notes?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

// ====================
// Cart Types
// ====================

export interface CartWithProducts extends Cart {
  items: (CartItem & { product: Product })[];
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
}

// ====================
// Auth Types
// ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  company?: string;
  taxId?: string;
}

// ====================
// Dashboard Types
// ====================

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: Product[];
}

export interface AdminDashboardStats extends DashboardStats {
  totalUsers: number;
  pendingQuotes: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByMonth: { month: string; revenue: number }[];
}

// ====================
// Navigation Types
// ====================

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
