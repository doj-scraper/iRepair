import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Truck,
  Shield,
  DollarSign,
  Users,
  Award,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          About CellTech Distributor
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your trusted B2B partner for high-quality cell phone repair parts.
          We&apos;ve been serving repair shops across the USA since 2015.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            To become the definitive digital sourcing hub for independent repair shops —
            delivering a fast, trustworthy, and friction-free wholesale parts experience
            that makes every order feel effortless.
          </p>
        </CardContent>
      </Card>

      {/* Story Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Founded by Technicians</h3>
              <p className="text-muted-foreground">
                CellTech Distributor was founded by repair technicians who understood
                the frustrations of sourcing quality parts. We&apos;ve been in your shoes
                and built the company we wished existed when we were running repair shops.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Direct from Manufacturers</h3>
              <p className="text-muted-foreground">
                We source directly from trusted manufacturers in China, cutting out
                middlemen and passing the savings on to you. Our quality control team
                inspects every shipment before it reaches our warehouse.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
          Why Choose CellTech?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Same-Day Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Orders placed before 2 PM EST ship the same business day.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">90-Day Warranty</h3>
              <p className="text-sm text-muted-foreground">
                All parts backed by our comprehensive 90-day warranty.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Wholesale Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Competitive B2B pricing with MOQ starting at just 5 units.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quality Assured</h3>
              <p className="text-sm text-muted-foreground">
                OEM, Aftermarket, and Refurbished options clearly labeled.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">1,000+ Partners</h3>
              <p className="text-sm text-muted-foreground">
                Trusted by repair shops in all 50 states.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Our team responds to inquiries within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ready to Partner with Us?
        </h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of repair shops who trust CellTech for their parts needs.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/">Browse Products</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
