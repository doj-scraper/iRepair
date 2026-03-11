'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  PanelTop,
  Battery,
  Usb,
  Camera,
  Wrench,
  Truck,
  Shield,
  DollarSign,
  Headphones,
  ArrowRight,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { WizardModal, WizardTrigger, useFirstVisit } from '@/components/wizard';
import { ProductGrid } from '@/components/product';
import type { Product, PartCategory, QualityGrade, Brand } from '@/types';
import { cn } from '@/lib/utils';

// ====================
// Mock Featured Products Data
// ====================

const mockFeaturedProducts: Product[] = [
  {
    id: '1',
    sku: 'IP15PM-LCD-OEM',
    name: 'iPhone 15 Pro Max OLED Display Assembly',
    description: 'Original OEM quality OLED display assembly with frame',
    brand: 'Apple' as Brand,
    deviceModel: 'iPhone 15 Pro Max',
    category: 'Screens' as PartCategory,
    qualityGrade: 'OEM' as QualityGrade,
    price: 189.99,
    wholesalePrice: 149.99,
    stockQuantity: 45,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    sku: 'SAM-S24U-LCD',
    name: 'Samsung Galaxy S24 Ultra AMOLED Screen',
    description: 'High-quality AMOLED display replacement',
    brand: 'Samsung' as Brand,
    deviceModel: 'Galaxy S24 Ultra',
    category: 'Screens' as PartCategory,
    qualityGrade: 'Aftermarket' as QualityGrade,
    price: 159.99,
    wholesalePrice: 119.99,
    stockQuantity: 32,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    sku: 'IP14-BAT-OEM',
    name: 'iPhone 14 Battery Replacement Kit',
    description: 'OEM battery with adhesive and tools',
    brand: 'Apple' as Brand,
    deviceModel: 'iPhone 14',
    category: 'Batteries' as PartCategory,
    qualityGrade: 'OEM' as QualityGrade,
    price: 39.99,
    wholesalePrice: 29.99,
    stockQuantity: 120,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    sku: 'MOTO-G-USB',
    name: 'Motorola Moto G Power Charging Port',
    description: 'USB-C charging port flex cable assembly',
    brand: 'Motorola' as Brand,
    deviceModel: 'Moto G Power (2023)',
    category: 'ChargingPorts' as PartCategory,
    qualityGrade: 'Aftermarket' as QualityGrade,
    price: 14.99,
    wholesalePrice: 9.99,
    stockQuantity: 85,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    sku: 'IP13PM-CAM',
    name: 'iPhone 13 Pro Max Rear Camera Module',
    description: 'Original rear camera lens assembly',
    brand: 'Apple' as Brand,
    deviceModel: 'iPhone 13 Pro Max',
    category: 'Cameras' as PartCategory,
    qualityGrade: 'OEM' as QualityGrade,
    price: 79.99,
    wholesalePrice: 59.99,
    stockQuantity: 28,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    sku: 'SAM-S23-BAT',
    name: 'Samsung Galaxy S23 Battery',
    description: 'High-capacity lithium polymer battery',
    brand: 'Samsung' as Brand,
    deviceModel: 'Galaxy S23',
    category: 'Batteries' as PartCategory,
    qualityGrade: 'OEM' as QualityGrade,
    price: 34.99,
    wholesalePrice: 24.99,
    stockQuantity: 67,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    sku: 'IP15-GLASS',
    name: 'iPhone 15 Back Glass Replacement',
    description: 'Premium back glass with adhesive pre-installed',
    brand: 'Apple' as Brand,
    deviceModel: 'iPhone 15',
    category: 'BackGlass' as PartCategory,
    qualityGrade: 'Aftermarket' as QualityGrade,
    price: 24.99,
    wholesalePrice: 17.99,
    stockQuantity: 95,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    sku: 'IP12PM-LCD-REF',
    name: 'iPhone 12 Pro Max Refurbished Display',
    description: 'Refurbished OEM display in excellent condition',
    brand: 'Apple' as Brand,
    deviceModel: 'iPhone 12 Pro Max',
    category: 'Screens' as PartCategory,
    qualityGrade: 'Refurbished' as QualityGrade,
    price: 89.99,
    wholesalePrice: 69.99,
    stockQuantity: 18,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ====================
// Categories Data
// ====================

const categories = [
  {
    name: 'Screens & LCDs',
    icon: PanelTop,
    description: 'Display assemblies, digitizers, and LCD screens',
    count: 156,
    href: '/products?category=Screens',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Batteries',
    icon: Battery,
    description: 'Original and aftermarket batteries',
    count: 89,
    href: '/products?category=Batteries',
    color: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Charging Ports',
    icon: Usb,
    description: 'USB-C, Lightning, and charging flex cables',
    count: 45,
    href: '/products?category=ChargingPorts',
    color: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Cameras',
    icon: Camera,
    description: 'Front and rear camera modules',
    count: 67,
    href: '/products?category=Cameras',
    color: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'Back Glass',
    icon: PanelTop,
    description: 'Back glass panels and housings',
    count: 34,
    href: '/products?category=BackGlass',
    color: 'bg-rose-50 dark:bg-rose-950/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    name: 'Other Parts',
    icon: Wrench,
    description: 'Buttons, speakers, sensors, and more',
    count: 23,
    href: '/products?category=Other',
    color: 'bg-slate-50 dark:bg-slate-950/30',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
];

// ====================
// Brands Data
// ====================

const brands = [
  {
    name: 'Apple',
    logo: '🍎',
    deviceCount: 18,
    href: '/products?brand=Apple',
    description: 'iPhone parts and accessories',
  },
  {
    name: 'Samsung',
    logo: '📱',
    deviceCount: 20,
    href: '/products?brand=Samsung',
    description: 'Galaxy series replacement parts',
  },
  {
    name: 'Motorola',
    logo: '🔧',
    deviceCount: 12,
    href: '/products?brand=Motorola',
    description: 'Moto G and Edge series parts',
  },
];

// ====================
// Features Data
// ====================

const features = [
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Same-day shipping on orders placed before 2 PM EST. Free shipping on orders over $200.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'All parts tested before shipping. 90-day warranty on all products.',
  },
  {
    icon: DollarSign,
    title: 'Wholesale Pricing',
    description: 'Competitive wholesale prices with volume discounts available.',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Dedicated support team to help with technical questions and orders.',
  },
];

// ====================
// Hero Section Component
// ====================

function HeroSection() {
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const { isFirstVisit } = useFirstVisit();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-emerald-700 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="outline" className="mb-6 border-white/30 bg-white/10 text-white backdrop-blur-sm">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Trusted by 1,000+ repair shops across the USA
          </Badge>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Quality Cell Phone Repair Parts at{' '}
            <span className="text-primary-light">Wholesale Prices</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Your trusted B2B partner for OEM and aftermarket cell phone repair parts. 
            Fast shipping, quality guaranteed, bulk discounts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WizardTrigger
              onClick={() => setIsWizardOpen(true)}
              variant="hero"
              className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20"
            />
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/products">
                Browse All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span className="text-sm">Same-day shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">90-day warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="text-sm">500+ products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>

      {/* Wizard Modal */}
      <WizardModal
        forceOpen={isWizardOpen}
        onOpenChange={(open) => setIsWizardOpen(open)}
      />
    </section>
  );
}

// ====================
// Category Card Component
// ====================

interface CategoryCardProps {
  name: string;
  icon: React.ElementType;
  description: string;
  count: number;
  href: string;
  color: string;
  iconColor: string;
}

function CategoryCard({ name, icon: Icon, description, count, href, color, iconColor }: CategoryCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50">
        <CardContent className="p-6">
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors',
            color,
            'group-hover:bg-primary/10'
          )}>
            <Icon className={cn('h-6 w-6', iconColor, 'group-hover:text-primary transition-colors')} />
          </div>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
          <Badge variant="secondary" className="text-xs">
            {count} products
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

// ====================
// Categories Section Component
// ====================

function CategoriesSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the exact parts you need from our comprehensive catalog of cell phone repair components
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ====================
// Featured Products Section Component
// ====================

function FeaturedProductsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Popular parts chosen by repair professionals
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={mockFeaturedProducts}
          useMemoization={true}
        />
      </div>
    </section>
  );
}

// ====================
// Brand Card Component
// ====================

interface BrandCardProps {
  name: string;
  logo: string;
  deviceCount: number;
  href: string;
  description: string;
}

function BrandCard({ name, logo, deviceCount, href, description }: BrandCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-3xl flex-shrink-0">
              {logo}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {deviceCount} devices
                </Badge>
                <span className="text-primary font-medium inline-flex items-center group-hover:underline">
                  Shop {name}
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ====================
// Brands Section Component
// ====================

function BrandsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Shop by Brand
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We carry parts for all major smartphone brands
          </p>
        </div>

        {/* Brand Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.name} {...brand} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ====================
// Features Section Component
// ====================

function FeaturesSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Why Choose CellTech Distributor?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are committed to providing the best service and quality parts for your repair business
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center border-border/50">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====================
// CTA Banner Component
// ====================

function CTABanner() {
  return (
    <section className="py-16 bg-primary-dark text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Can&apos;t Find What You Need?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            We can source parts for almost any device. Request a quote and our team will help you find exactly what you need.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-white/90 shadow-lg"
            asChild
          >
            <Link href="/quote">
              Request a Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ====================
// Main Homepage Component
// ====================

function HomePageContent() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Separator */}
      <Separator className="container mx-auto max-w-7xl" />

      {/* Brands Section */}
      <BrandsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Banner */}
      <CTABanner />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
