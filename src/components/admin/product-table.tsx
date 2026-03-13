"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand, PartCategory, QualityGrade } from "@/types";
import type { Product } from "@/types";

// Helper to format enum values for display
const formatEnumValue = (value: string) => {
  return value.replace(/_/g, " ");
};

// Quality grade badge colors
const getQualityBadgeVariant = (grade: QualityGrade) => {
  switch (grade) {
    case QualityGrade.OEM:
      return "bg-success text-white hover:bg-success/80";
    case QualityGrade.Aftermarket:
      return "bg-warning text-white hover:bg-warning/80";
    case QualityGrade.Refurbished:
      return "secondary";
    default:
      return "secondary";
  }
};

// Stock status helper
const getStockStatus = (quantity: number) => {
  if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
  if (quantity < 10) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
};

interface ProductTableProps {
  products: Product[];
  totalProducts: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: ProductFilters) => void;
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  isLoading?: boolean;
}

interface ProductFilters {
  brand?: Brand;
  category?: PartCategory;
  quality?: QualityGrade;
  inStock?: boolean;
}

export function ProductTable({
  products,
  totalProducts,
  page = 1,
  limit = 10,
  onPageChange,
  onSearch,
  onFilter,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
  isLoading = false,
}: ProductTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | "all">("all");
  const [selectedCategory, setSelectedCategory] = React.useState<PartCategory | "all">("all");
  const [selectedQuality, setSelectedQuality] = React.useState<QualityGrade | "all">("all");
  const [stockFilter, setStockFilter] = React.useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

  const totalPages = Math.ceil(totalProducts / limit);

  // Debounced search
  const debouncedSearch = React.useCallback(
    (query: string) => {
      const timer = setTimeout(() => {
        onSearch?.(query);
      }, 300);
      return () => clearTimeout(timer);
    },
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFilterChange = () => {
    onFilter?.({
      brand: selectedBrand !== "all" ? selectedBrand : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      quality: selectedQuality !== "all" ? selectedQuality : undefined,
      inStock: stockFilter === "in-stock" ? true : undefined,
    });
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [selectedBrand, selectedCategory, selectedQuality, stockFilter]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct?.(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const clearFilters = () => {
    setSelectedBrand("all");
    setSelectedCategory("all");
    setSelectedQuality("all");
    setStockFilter("all");
    setSearchQuery("");
    onSearch?.("");
    onFilter?.({});
  };

  const hasActiveFilters =
    selectedBrand !== "all" ||
    selectedCategory !== "all" ||
    selectedQuality !== "all" ||
    stockFilter !== "all" ||
    searchQuery !== "";

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Products</CardTitle>
          <Button
            onClick={onAddProduct}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            {/* Filter Dropdowns */}
            <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v as Brand | "all")}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {Object.values(Brand).map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as PartCategory | "all")}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(PartCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatEnumValue(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedQuality} onValueChange={(v) => setSelectedQuality(v as QualityGrade | "all")}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                {Object.values(QualityGrade).map((quality) => (
                  <SelectItem key={quality} value={quality}>
                    {quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as typeof stockFilter)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-16 bg-muted animate-pulse rounded mx-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-10 w-10 mb-2" />
                      <p className="font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Product rows
                products.map((product) => {
                  const stockStatus = getStockStatus(product.stockQuantity);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs uppercase">
                        {product.sku}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[250px]" title={product.name}>
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.brand} • {product.deviceModel}
                        </div>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{formatEnumValue(product.category)}</TableCell>
                      <TableCell>
                        <Badge className={getQualityBadgeVariant(product.qualityGrade)}>
                          {product.qualityGrade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${product.wholesalePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{product.stockQuantity}</span>
                          <Badge
                            variant={stockStatus.variant === "success" ? "default" : stockStatus.variant}
                            className={cn(
                              "text-xs",
                              stockStatus.variant === "success" && "bg-success text-white",
                              stockStatus.variant === "warning" && "bg-warning text-white"
                            )}
                          >
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onViewProduct && (
                              <DropdownMenuItem onClick={() => onViewProduct(product)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            )}
                            {onEditProduct && (
                              <DropdownMenuItem onClick={() => onEditProduct(product)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDeleteProduct && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(product)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalProducts)} of{" "}
              {totalProducts} products
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(pageNum)}
                      className={cn(
                        "w-8 h-8 p-0",
                        page === pageNum && "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Product Form Dialog Component
interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  brand: Brand;
  deviceModel: string;
  category: PartCategory;
  qualityGrade: QualityGrade;
  pricePerUnit: number;
  stockQty: number;
  isActive: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading = false,
}: ProductFormDialogProps) {
  const [formData, setFormData] = React.useState<ProductFormData>({
    sku: "",
    name: "",
    description: "",
    brand: Brand.Apple,
    deviceModel: "",
    category: PartCategory.Screens,
    qualityGrade: QualityGrade.OEM,
    pricePerUnit: 0,
    stockQty: 0,
    isActive: true,
  });

  // Populate form when editing
  React.useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        brand: product.brand,
        deviceModel: product.deviceModel,
        category: product.category,
        qualityGrade: product.qualityGrade,
        pricePerUnit: product.wholesalePrice,
        stockQty: product.stockQuantity,
        isActive: product.isActive,
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        description: "",
        brand: Brand.Apple,
        deviceModel: "",
        category: PartCategory.Screens,
        qualityGrade: QualityGrade.OEM,
        pricePerUnit: 0,
        stockQty: 0,
        isActive: true,
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product information below."
              : "Fill in the product details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="APPLE-IPHONE15-SCREEN-OEM"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iPhone 15 OLED Display Assembly"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Select
                value={formData.brand}
                onValueChange={(v) => setFormData({ ...formData, brand: v as Brand })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Brand).map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceModel">Device Model *</Label>
              <Input
                id="deviceModel"
                value={formData.deviceModel}
                onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                placeholder="iPhone 15 Pro Max"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as PartCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PartCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatEnumValue(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">Quality Grade *</Label>
              <Select
                value={formData.qualityGrade}
                onValueChange={(v) => setFormData({ ...formData, qualityGrade: v as QualityGrade })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QualityGrade).map((quality) => (
                    <SelectItem key={quality} value={quality}>
                      {quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerUnit}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stockQty}
                onChange={(e) =>
                  setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductTable;
