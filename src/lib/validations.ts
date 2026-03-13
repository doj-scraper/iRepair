// ============================================
// CellTech Distributor B2B Portal - Validation Schemas
// ============================================

import { z } from 'zod';
import {
  Brand,
  PartCategory,
  QualityGrade,
  OrderStatus,
  UserRole,
  QuoteStatus,
} from '@/types';

// ====================
// Constants
// ====================

export const MOQ = 5; // Minimum Order Quantity

// ====================
// Enum Schemas
// ====================

export const brandSchema = z.nativeEnum(Brand);
export const partCategorySchema = z.nativeEnum(PartCategory);
export const qualityGradeSchema = z.nativeEnum(QualityGrade);
export const orderStatusSchema = z.nativeEnum(OrderStatus);
export const userRoleSchema = z.nativeEnum(UserRole);
export const quoteStatusSchema = z.nativeEnum(QuoteStatus);

// ====================
// Address Schema
// ====================

export const addressSchema = z.object({
  recipientName: z
    .string()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name must be less than 100 characters'),
  street: z
    .string()
    .min(1, 'Street address is required')
    .max(200, 'Street address must be less than 200 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .max(20, 'ZIP code must be less than 20 characters')
    .regex(/^[\w\s-]+$/, 'Invalid ZIP code format'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),
});

// ====================
// Product Filter Schema
// ====================

export const productFilterSchema = z.object({
  search: z.string().max(200).optional(),
  brand: z.union([
    brandSchema,
    z.array(brandSchema),
  ]).optional(),
  category: z.union([
    partCategorySchema,
    z.array(partCategorySchema),
  ]).optional(),
  qualityGrade: z.union([
    qualityGradeSchema,
    z.array(qualityGradeSchema),
  ]).optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum([
    'price-asc',
    'price-desc',
    'name-asc',
    'name-desc',
    'newest',
    'oldest',
  ]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
}).refine(
  (data) => {
    if (data.priceRange?.min !== undefined && data.priceRange?.max !== undefined) {
      return data.priceRange.min <= data.priceRange.max;
    }
    return true;
  },
  {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['priceRange'],
  }
);

// ====================
// Checkout Schema
// ====================

export const checkoutSchema = z.object({
  // Guest Information
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format'),
  
  // Company Information (optional)
  companyName: z.string().max(100).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal('')),
  
  // Shipping Address
  shippingAddress: addressSchema,
  
  // Billing Address
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  
  // Order Details
  notes: z.string().max(1000).optional().or(z.literal('')),
  
  // Account Creation (optional)
  createAccount: z.boolean().default(false).optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // If billingSameAsShipping is false, billingAddress is required
    if (!data.billingSameAsShipping && !data.billingAddress) {
      return false;
    }
    return true;
  },
  {
    message: 'Billing address is required when not same as shipping',
    path: ['billingAddress'],
  }
).refine(
  (data) => {
    // If createAccount is true, password is required
    if (data.createAccount && !data.password) {
      return false;
    }
    return true;
  },
  {
    message: 'Password is required when creating an account',
    path: ['password'],
  }
);

// ====================
// Quote Request Schema
// ====================

export const quoteItemSchema = z.object({
  productName: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters'),
  productSku: z.string().max(50).optional().or(z.literal('')),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(MOQ, `Minimum order quantity is ${MOQ} units`),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const quoteRequestSchema = z.object({
  // Contact Information
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format'),
  
  // Company Information
  companyName: z.string().max(100).optional().or(z.literal('')),
  
  // Quote Details
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  items: z
    .array(quoteItemSchema)
    .min(1, 'At least one item is required'),
});

// ====================
// Contact Form Schema
// ====================

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  company: z.string().max(100).optional().or(z.literal('')),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

// ====================
// Cart Schemas
// ====================

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(MOQ, `Minimum order quantity is ${MOQ} units`),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1, 'Cart item ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
});

// ====================
// Auth Schemas
// ====================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  name: z.string().max(100).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  company: z.string().max(100).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal('')),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// ====================
// User Profile Schema
// ====================

export const userProfileSchema = z.object({
  name: z.string().max(100).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  company: z.string().max(100).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal('')),
});

// ====================
// Product Admin Schema
// ====================

export const productAdminSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters'),
  description: z.string().max(5000).optional().or(z.literal('')),
  brand: brandSchema,
  deviceModel: z
    .string()
    .min(1, 'Device model is required')
    .max(100, 'Device model must be less than 100 characters'),
  category: partCategorySchema,
  qualityGrade: qualityGradeSchema,
  price: z
    .number()
    .min(0, 'Price must be non-negative'),
  wholesalePrice: z
    .number()
    .min(0, 'Wholesale price must be non-negative'),
  stockQuantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

// ====================
// Order Admin Schema
// ====================

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: orderStatusSchema,
  notes: z.string().max(500).optional().or(z.literal('')),
});
