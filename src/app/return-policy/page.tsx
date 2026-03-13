import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Truck, RefreshCw, Shield, Clock, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Return Policy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We stand behind our products. Here&apos;s everything you need to know about
          returns, exchanges, and warranties.
        </p>
      </div>

      {/* Quick Summary */}
      <Card className="mb-8 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">90</p>
              <p className="text-sm text-muted-foreground">Day Warranty</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">30</p>
              <p className="text-sm text-muted-foreground">Day Return Window</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Free</p>
              <p className="text-sm text-muted-foreground">Defective Replacements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warranty Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            90-Day Warranty
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            All products sold by CellTech Distributor come with a comprehensive 90-day
            warranty against manufacturing defects. This warranty covers:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3">
            <li>Manufacturing defects in materials and workmanship</li>
            <li>Functional failures under normal use conditions</li>
            <li>DOA (Dead on Arrival) units</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            The warranty does <strong>not</strong> cover:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3">
            <li>Damage caused by improper installation or handling</li>
            <li>Physical damage (cracks, scratches, water damage)</li>
            <li>Normal wear and tear</li>
            <li>Products modified or repaired by third parties</li>
          </ul>
        </CardContent>
      </Card>

      {/* Return Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            Return Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Email us at support@celltechdist.com with your order number and reason
                for return. Include photos of any defects.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Receive RMA Number</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ll issue a Return Merchandise Authorization (RMA) number within
                1-2 business days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Ship the Product</h3>
              <p className="text-sm text-muted-foreground">
                Package the item securely with the RMA number visible on the outside.
                Ship to our returns address.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium text-sm shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Receive Refund/Replacement</h3>
              <p className="text-sm text-muted-foreground">
                Once we receive and inspect the item, we&apos;ll process your refund
                or ship a replacement within 3-5 business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Conditions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Return Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="success" className="shrink-0">Eligible</Badge>
              <div>
                <p className="font-medium text-foreground">Defective Items</p>
                <p className="text-sm text-muted-foreground">
                  Full refund or replacement. Free return shipping.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="warning" className="shrink-0">Partial</Badge>
              <div>
                <p className="font-medium text-foreground">Non-Defective Returns</p>
                <p className="text-sm text-muted-foreground">
                  15% restocking fee applies. Customer pays return shipping.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="destructive" className="shrink-0">Not Eligible</Badge>
              <div>
                <p className="font-medium text-foreground">Items Outside Return Window</p>
                <p className="text-sm text-muted-foreground">
                  Returns must be initiated within 30 days of delivery.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Contact CTA */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>Need to initiate a return?</span>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:support@celltechdist.com">Email Us</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
