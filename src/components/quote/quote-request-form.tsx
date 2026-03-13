'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Plus,
  Trash2,
  Package,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOQ = 5;

const quoteItemSchema = z.object({
  productName: z.string().min(2, 'Product name required'),
  productSku: z.string().optional(),
  quantity: z.number().int().min(MOQ, `Minimum order quantity is ${MOQ}`),
  notes: z.string().optional(),
});

const quoteRequestSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Valid phone required'),
  companyName: z.string().optional(),
  message: z.string().min(10, 'Please provide more details'),
  items: z.array(quoteItemSchema).min(1, 'At least one item required'),
});

type QuoteFormData = z.infer<typeof quoteRequestSchema>;

interface QuoteRequestFormProps {
  trigger?: React.ReactNode;
  prefilledItem?: {
    productName?: string;
    productSku?: string;
    quantity?: number;
  };
  onSuccess?: (data: QuoteFormData) => void;
}

export function QuoteRequestForm({ trigger, prefilledItem, onSuccess }: QuoteRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [items, setItems] = useState<Array<{
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    notes: string;
  }>>([
    {
      id: '1',
      productName: prefilledItem?.productName || '',
      productSku: prefilledItem?.productSku || '',
      quantity: prefilledItem?.quantity || MOQ,
      notes: '',
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      companyName: '',
      message: '',
      items: items.map(item => ({
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        notes: item.notes,
      })),
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productName: '',
        productSku: '',
        quantity: MOQ,
        notes: '',
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map(item => ({
            productName: item.productName,
            productSku: item.productSku || undefined,
            quantity: item.quantity,
            notes: item.notes || undefined,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        onSuccess?.(data);
        setTimeout(() => {
          setOpen(false);
          setIsSuccess(false);
          reset();
          setItems([{
            id: '1',
            productName: '',
            productSku: '',
            quantity: MOQ,
            notes: '',
          }]);
        }, 2000);
      } else {
        console.error('Quote request failed:', result.error);
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Request a Quote
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Request a Quote
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Quote Request Submitted!</h3>
            <p className="text-muted-foreground mt-2">
              We&apos;ll review your request and get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="John Smith"
                      className={cn(errors.name && 'border-red-500')}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@repairshop.com"
                      className={cn(errors.email && 'border-red-500')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="(555) 123-4567"
                      className={cn(errors.phone && 'border-red-500')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      {...register('companyName')}
                      placeholder="Repair Shop Inc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Items Requested</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    MOQ: {MOQ} units
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Item {index + 1}
                      </span>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-8 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Product Name *</Label>
                          <Input
                            value={item.productName}
                            onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                            placeholder="iPhone 14 Pro Screen"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">SKU (Optional)</Label>
                          <Input
                            value={item.productSku}
                            onChange={(e) => updateItem(item.id, 'productSku', e.target.value)}
                            placeholder="IPHONE14PRO-SCREEN"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity *</Label>
                          <Input
                            type="number"
                            min={MOQ}
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || MOQ)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Notes</Label>
                          <Input
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                            placeholder="Color preference, etc."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Item
                </Button>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Tell us more about what you're looking for, any specific requirements, timeline, etc."
                    rows={4}
                    className={cn(errors.message && 'border-red-500')}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default QuoteRequestForm;
