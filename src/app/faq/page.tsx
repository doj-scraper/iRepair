import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const faqItems = [
  {
    category: 'Orders & Pricing',
    questions: [
      {
        q: 'What is the minimum order quantity (MOQ)?',
        a: 'Our minimum order quantity is 5 units per product. This applies to all SKUs across our catalog. The MOQ helps us maintain competitive wholesale pricing for all our B2B partners.',
      },
      {
        q: 'Do you offer discounts for bulk orders?',
        a: 'Yes! We offer tiered pricing for larger orders. Contact us for a custom quote on orders of 100+ units of the same SKU. Registered wholesale customers may also qualify for volume discounts.',
      },
      {
        q: 'Can I place an order without creating an account?',
        a: 'Absolutely! We offer guest checkout for your convenience. You can browse our catalog, add items to cart, and complete your purchase without creating an account. You\'ll have the option to create an account after your order is placed.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay. All payments are processed securely through Stripe.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'We offer same-day shipping for orders placed before 2 PM EST. Standard shipping typically takes 3-5 business days. Expedited options are available at checkout.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Currently, we only ship within the United States. We\'re working on expanding our shipping capabilities to serve international customers in the future.',
      },
      {
        q: 'How much does shipping cost?',
        a: 'Shipping costs are calculated based on order weight and destination. We offer free standard shipping on orders over $500. Flat-rate options are also available.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Once your order ships, you\'ll receive an email with tracking information. You can also view tracking details in your order history if you have an account.',
      },
    ],
  },
  {
    category: 'Returns & Warranty',
    questions: [
      {
        q: 'What is your warranty policy?',
        a: 'All parts come with a 90-day warranty against manufacturing defects. If a part fails within the warranty period, we\'ll replace it free of charge.',
      },
      {
        q: 'How do I request a return or exchange?',
        a: 'Contact our support team within 30 days of delivery to initiate a return. Items must be unused and in original packaging. A restocking fee may apply for non-defective returns.',
      },
      {
        q: 'What if I receive a defective part?',
        a: 'We stand behind our products. If you receive a defective part, contact us immediately with your order number and photos of the issue. We\'ll ship a replacement right away.',
      },
    ],
  },
  {
    category: 'Products & Quality',
    questions: [
      {
        q: 'What quality grades do you offer?',
        a: 'We offer three quality grades: OEM (Original Equipment Manufacturer), Aftermarket (third-party manufactured), and Refurbished. Each grade is clearly labeled on product listings.',
      },
      {
        q: 'Are your parts compatible with all device models?',
        a: 'Each product listing includes a compatibility list. Always check the compatibility information before ordering. If you\'re unsure, our team can help verify compatibility.',
      },
      {
        q: 'Can I request a part that\'s not in your catalog?',
        a: 'Absolutely! Use our "Request a Quote" feature to let us know what you need. We have extensive supplier relationships and can often source parts not listed in our standard catalog.',
      },
    ],
  },
  {
    category: 'Account & Support',
    questions: [
      {
        q: 'What are the benefits of creating an account?',
        a: 'Account holders enjoy saved cart functionality, order history, saved addresses, faster checkout, and access to exclusive wholesale pricing tiers. It\'s completely free to create an account.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a link to reset your password. If you don\'t receive the email, check your spam folder or contact support.',
      },
      {
        q: 'How can I contact customer support?',
        a: 'You can reach us via email at support@celltechdist.com, by phone at (800) 555-1234, or through the contact form on our website. We typically respond within 24 hours.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about orders, shipping, returns, and more.
        </p>
      </div>

      <div className="space-y-8">
        {faqItems.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-xl">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${category.category}-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-4">
            Can&apos;t find the answer you&apos;re looking for? Our team is here to help.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
