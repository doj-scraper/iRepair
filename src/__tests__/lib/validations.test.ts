/**
 * Unit Tests — Zod Validation Schemas
 */

import { describe, it, expect } from "vitest";
import {
  contactFormSchema,
  addToCartSchema,
  productAdminSchema,
  checkoutSchema,
  quoteRequestSchema,
  loginSchema,
  registerSchema,
  addressSchema,
  MOQ,
} from "@/lib/validations";

// ─── Contact Form ────────────────────────────────────────────────────────────

describe("contactFormSchema", () => {
  const validContact = {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567",
    company: "Acme Corp",
    subject: "Wholesale inquiry",
    message: "I would like to order 100 screens for iPhone 15.",
  };

  it("accepts valid contact form data", () => {
    const result = contactFormSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short message", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional phone as empty string", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      phone: "",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Add to Cart ─────────────────────────────────────────────────────────────

describe("addToCartSchema", () => {
  it("accepts valid add-to-cart data", () => {
    const result = addToCartSchema.safeParse({
      productId: "prod_123",
      quantity: MOQ,
    });
    expect(result.success).toBe(true);
  });

  it("rejects quantity below MOQ", () => {
    const result = addToCartSchema.safeParse({
      productId: "prod_123",
      quantity: MOQ - 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing productId", () => {
    const result = addToCartSchema.safeParse({
      productId: "",
      quantity: MOQ,
    });
    expect(result.success).toBe(false);
  });
});

// ─── Address ─────────────────────────────────────────────────────────────────

describe("addressSchema", () => {
  const validAddress = {
    recipientName: "Jane Doe",
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    country: "US",
  };

  it("accepts valid address", () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("rejects missing city", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      city: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid zip code characters", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      zipCode: "<script>",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Product Admin ───────────────────────────────────────────────────────────

describe("productAdminSchema", () => {
  const validProduct = {
    sku: "IP15-LCD-OEM",
    name: "iPhone 15 OLED Display",
    description: "High quality OEM display",
    brand: "Apple",
    deviceModel: "iPhone 15",
    category: "Screens",
    qualityGrade: "OEM",
    price: 189.99,
    wholesalePrice: 149.99,
    stockQuantity: 100,
    imageUrl: "https://example.com/image.jpg",
    isActive: true,
  };

  it("accepts valid product data", () => {
    const result = productAdminSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = productAdminSchema.safeParse({
      ...validProduct,
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing SKU", () => {
    const result = productAdminSchema.safeParse({
      ...validProduct,
      sku: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid brand enum", () => {
    const result = productAdminSchema.safeParse({
      ...validProduct,
      brand: "Nokia",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Register ────────────────────────────────────────────────────────────────

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
      confirmPassword: "Password2",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Checkout ────────────────────────────────────────────────────────────────

describe("checkoutSchema", () => {
  const validCheckout = {
    email: "buyer@example.com",
    name: "Buyer Name",
    phone: "555-000-1234",
    shippingAddress: {
      recipientName: "Buyer Name",
      street: "456 Commerce Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "US",
    },
    billingSameAsShipping: true,
  };

  it("accepts valid checkout data", () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("rejects checkout with billingSameAsShipping=false and no billing address", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      billingSameAsShipping: false,
    });
    expect(result.success).toBe(false);
  });
});

// ─── Quote Request ───────────────────────────────────────────────────────────

describe("quoteRequestSchema", () => {
  const validQuote = {
    email: "buyer@example.com",
    name: "Buyer Name",
    phone: "555-000-1234",
    message: "I need a bulk order of screens and batteries.",
    items: [
      {
        productName: "iPhone 15 Screen",
        quantity: 50,
      },
    ],
  };

  it("accepts valid quote request", () => {
    const result = quoteRequestSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
  });

  it("rejects empty items array", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects item quantity below MOQ", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      items: [{ productName: "Screen", quantity: 2 }],
    });
    expect(result.success).toBe(false);
  });
});
