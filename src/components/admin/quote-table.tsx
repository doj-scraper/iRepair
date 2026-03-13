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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  MessageSquare,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteStatus } from "@/types";
import type { QuoteRequest, QuoteRequestItem } from "@/types";

// Quote status badge styles
const getStatusConfig = (status: QuoteStatus) => {
  switch (status) {
    case QuoteStatus.Pending:
      return {
        label: "Pending",
        variant: "secondary" as const,
        icon: Clock,
        className: "bg-warning/20 text-warning border-warning/30",
      };
    case QuoteStatus.Quoted:
      return {
        label: "Quoted",
        variant: "default" as const,
        icon: CheckCircle,
        className: "bg-success/20 text-success border-success/30",
      };
    case QuoteStatus.Closed:
      return {
        label: "Closed",
        variant: "destructive" as const,
        icon: XCircle,
        className: "bg-muted text-muted-foreground border-muted",
      };
    default:
      return {
        label: status,
        variant: "secondary" as const,
        icon: Clock,
        className: "",
      };
  }
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

interface QuoteTableProps {
  quotes: QuoteRequest[];
  totalQuotes: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: QuoteStatus | "all") => void;
  onViewQuote?: (quote: QuoteRequest) => void;
  onRespond?: (quote: QuoteRequest, response: QuoteResponse) => void;
  onStatusChange?: (quote: QuoteRequest, status: QuoteStatus) => void;
  isLoading?: boolean;
}

interface QuoteResponse {
  quotedTotal: number;
  adminNotes: string;
}

export function QuoteTable({
  quotes,
  totalQuotes,
  page = 1,
  limit = 10,
  onPageChange,
  onSearch,
  onStatusFilter,
  onViewQuote,
  onRespond,
  onStatusChange,
  isLoading = false,
}: QuoteTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<QuoteStatus | "all">("all");
  const [selectedQuote, setSelectedQuote] = React.useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [respondOpen, setRespondOpen] = React.useState(false);
  const [quoteResponse, setQuoteResponse] = React.useState<QuoteResponse>({
    quotedTotal: 0,
    adminNotes: "",
  });

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

  const handleStatusFilterChange = (status: QuoteStatus | "all") => {
    setSelectedStatus(status);
    onStatusFilter?.(status);
  };

  const handleViewQuote = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
    onViewQuote?.(quote);
  };

  const handleRespondClick = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setQuoteResponse({
      quotedTotal: quote.quotedTotal || 0,
      adminNotes: quote.adminNotes || "",
    });
    setRespondOpen(true);
  };

  const handleSubmitResponse = () => {
    if (selectedQuote && onRespond) {
      onRespond(selectedQuote, quoteResponse);
      setRespondOpen(false);
    }
  };

  const totalPages = Math.ceil(totalQuotes / limit);

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Quote Requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <Select value={selectedStatus} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(QuoteStatus).map((status) => {
                  const config = getStatusConfig(status);
                  return (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Quote #</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : quotes.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-10 w-10 mb-2" />
                        <p className="font-medium">No quote requests found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Quote rows
                  quotes.map((quote) => {
                    const statusConfig = getStatusConfig(quote.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={quote.id}>
                        <TableCell className="font-mono text-sm">
                          #Q{quote.id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{quote.guestName || "Guest"}</div>
                          <div className="text-xs text-muted-foreground">
                            {quote.guestEmail || "No email"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {quote.companyName ? (
                            <span className="text-sm">{quote.companyName}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {quote.items?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig.variant}
                            className={cn("gap-1", statusConfig.className)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(quote.createdAt)}
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
                              <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {quote.status === QuoteStatus.Pending && (
                                <DropdownMenuItem onClick={() => handleRespondClick(quote)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Respond
                                </DropdownMenuItem>
                              )}
                              {onStatusChange && (
                                <>
                                  <DropdownMenuSeparator />
                                  {Object.values(QuoteStatus)
                                    .filter((s) => s !== quote.status)
                                    .map((status) => {
                                      const config = getStatusConfig(status);
                                      const Icon = config.icon;
                                      return (
                                        <DropdownMenuItem
                                          key={status}
                                          onClick={() => onStatusChange(quote, status)}
                                        >
                                          <Icon className="h-4 w-4 mr-2" />
                                          Mark as {config.label}
                                        </DropdownMenuItem>
                                      );
                                    })}
                                </>
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
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalQuotes)} of{" "}
                {totalQuotes} quotes
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
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Request #Q{selectedQuote?.id?.slice(-6).toUpperCase()}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedQuote && formatDate(selectedQuote.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {(() => {
                  const config = getStatusConfig(selectedQuote.status);
                  const Icon = config.icon;
                  return (
                    <Badge
                      variant={config.variant}
                      className={cn("gap-1", config.className)}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  );
                })()}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedQuote.guestEmail || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedQuote.guestPhone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedQuote.companyName && (
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedQuote.companyName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Quote Items */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Requested Items
                </h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuote.items?.map((item: QuoteRequestItem) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {item.productSku || "—"}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.notes || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Message */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Message
                </h4>
                <div className="flex gap-2 bg-muted p-3 rounded-md">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{selectedQuote.message}</p>
                </div>
              </div>

              {/* Quoted Total (if quoted) */}
              {selectedQuote.quotedTotal && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Quoted Amount
                    </h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedQuote.quotedTotal)}
                    </p>
                  </div>
                </>
              )}

              {/* Admin Notes */}
              {selectedQuote.adminNotes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Admin Notes
                    </h4>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedQuote.adminNotes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond to Quote Dialog */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Quote Request</DialogTitle>
            <DialogDescription>
              Provide a quote for the customer&apos;s request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quotedTotal">Quoted Total ($)</Label>
              <Input
                id="quotedTotal"
                type="number"
                step="0.01"
                min="0"
                value={quoteResponse.quotedTotal}
                onChange={(e) =>
                  setQuoteResponse({
                    ...quoteResponse,
                    quotedTotal: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Notes for Customer</Label>
              <Textarea
                id="adminNotes"
                value={quoteResponse.adminNotes}
                onChange={(e) =>
                  setQuoteResponse({
                    ...quoteResponse,
                    adminNotes: e.target.value,
                  })
                }
                placeholder="Enter any additional notes or details about the quote..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QuoteTable;
