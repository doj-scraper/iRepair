import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Terms & Conditions
        </h1>
        <p className="text-xl text-muted-foreground">
          Last updated: March 2026
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              By accessing or using the CellTech Distributor website and services,
              you agree to be bound by these Terms and Conditions. If you do not agree
              to these terms, please do not use our services.
            </p>
            <p className="mt-3">
              These terms apply to all visitors, users, and others who access or use
              the Service. By accessing or using the Service, you agree to be bound by
              these Terms. If you are using the Service on behalf of an organization,
              you are agreeing to these Terms on behalf of that organization.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Products and Services</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              CellTech Distributor is a wholesale distributor of cell phone repair parts.
              We sell products in bulk quantities with a minimum order quantity (MOQ) of
              5 units per SKU unless otherwise specified.
            </p>
            <p className="mt-3">
              Product descriptions, images, and specifications are provided for informational
              purposes only. We do not warrant that product descriptions are accurate,
              complete, or error-free. Actual products may vary from images shown.
            </p>
            <p className="mt-3">
              We reserve the right to limit quantities, refuse service, or discontinue
              any product at any time without notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Pricing and Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              All prices are displayed in US dollars and are subject to change without
              notice. Prices shown are wholesale prices for B2B customers.
            </p>
            <p className="mt-3">
              We accept major credit cards, Apple Pay, and Google Pay. Payment must be
              received before orders are processed and shipped.
            </p>
            <p className="mt-3">
              Applicable sales tax will be added to orders based on shipping destination.
              Tax-exempt customers must provide valid exemption certificates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Shipping and Delivery</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We ship to addresses within the United States only. Shipping times and
              costs are estimates and not guaranteed delivery dates.
            </p>
            <p className="mt-3">
              Risk of loss passes to you upon delivery to the carrier. We are not
              responsible for delays caused by carriers or events beyond our control.
            </p>
            <p className="mt-3">
              Orders typically ship within 1-2 business days. Orders placed after 2 PM EST
              on business days will be processed the next business day.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Returns and Warranty</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              All products are covered by our 90-day warranty against manufacturing
              defects. Returns must be initiated within 30 days of delivery.
            </p>
            <p className="mt-3">
              Defective items will be replaced or refunded at our discretion. Non-defective
              returns are subject to a 15% restocking fee. Items must be returned in
              original, unused condition.
            </p>
            <p className="mt-3">
              Please see our{' '}
              <a href="/return-policy" className="text-emerald-600 hover:underline">
                Return Policy
              </a>{' '}
              page for complete details.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              The Service and its original content, features, and functionality are owned
              by CellTech Distributor and are protected by international copyright,
              trademark, and other intellectual property laws.
            </p>
            <p className="mt-3">
              Our trademarks and trade dress may not be used without our prior written
              consent. Product names, logos, and brands are property of their respective
              owners.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              In no event shall CellTech Distributor, its directors, employees, partners,
              agents, suppliers, or affiliates be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without limitation,
              loss of profits, data, use, or goodwill.
            </p>
            <p className="mt-3">
              Our total liability for any claim arising from or related to the Service
              or products purchased shall not exceed the amount paid by you for the
              specific product giving rise to the claim.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              These Terms shall be governed and construed in accordance with the laws
              of the State of California, United States, without regard to its conflict
              of law provisions.
            </p>
            <p className="mt-3">
              Any disputes arising under these Terms shall be resolved exclusively in
              the state or federal courts located in Los Angeles County, California.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              For questions about these Terms, please contact us:
            </p>
            <ul className="mt-3 space-y-1 list-none">
              <li>Email: legal@celltechdist.com</li>
              <li>Phone: (800) 555-1234</li>
              <li>Address: 123 Distribution Way, Los Angeles, CA 90001</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <p className="text-sm text-muted-foreground text-center">
        By using our services, you acknowledge that you have read, understood, and
        agree to be bound by these Terms and Conditions.
      </p>
    </div>
  );
}
