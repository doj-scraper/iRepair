import { PrismaClient, Brand, PartCategory, QualityGrade } from '@prisma/client';

const prisma = new PrismaClient();

function getRandomStock(): number {
  const rand = Math.random();
  if (rand < 0.1) return 0;
  if (rand < 0.25) return Math.floor(Math.random() * 10) + 1;
  return Math.floor(Math.random() * 150) + 20;
}

function generateSKU(brand: string, model: string, category: string, quality: string): string {
  const brandCode = brand.toUpperCase().substring(0, 6);
  const modelCode = model.toUpperCase().replace(/\s+/g, '').replace(/\+/g, 'P').replace(/-/g, '');
  const catCode = category.toUpperCase().replace(/_/g, '').substring(0, 6);
  const qualityCode = quality === 'OEM' ? 'OEM' : quality === 'Aftermarket' ? 'AF' : 'REF';
  return `${brandCode}-${modelCode}-${catCode}-${qualityCode}`;
}

const deviceModels: Record<string, string[]> = {
  Apple: ['iPhone 14', 'iPhone 14 Pro', 'iPhone 14 Pro Max', 'iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max'],
  Samsung: ['Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra', 'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra', 'Galaxy A54'],
  Motorola: ['Moto G Power', 'Moto G Stylus', 'Moto Edge']
};

const productTemplates: Record<string, { namePrefix: string; descTemplate: string; basePriceRange: [number, number] }> = {
  Screens: {
    namePrefix: 'Display Assembly',
    descTemplate: 'Complete display assembly with digitizer and panel. Professional grade repair part.',
    basePriceRange: [45, 180]
  },
  Batteries: {
    namePrefix: 'Replacement Battery',
    descTemplate: 'Lithium-ion replacement battery with built-in BMS for safety.',
    basePriceRange: [12, 55]
  },
  Charging_Ports: {
    namePrefix: 'Charging Port Assembly',
    descTemplate: 'Charging port flex cable assembly. Professional replacement part.',
    basePriceRange: [8, 35]
  },
  Cameras: {
    namePrefix: 'Camera Module',
    descTemplate: 'Camera module with sensor and flex cable. Tested for quality.',
    basePriceRange: [25, 120]
  },
  Back_Glass: {
    namePrefix: 'Back Glass Panel',
    descTemplate: 'Back glass replacement panel with adhesive. OEM-grade tempered glass.',
    basePriceRange: [15, 65]
  }
};

const qualityMultipliers: Record<string, number> = {
  OEM: 1.0,
  Aftermarket: 0.6,
  Refurbished: 0.75
};

async function main() {
  console.log('Starting seed data generation...');

  await prisma.product.deleteMany({});
  console.log('Cleared existing products');

  const products: Array<{
    sku: string;
    name: string;
    description: string;
    brand: Brand;
    deviceModel: string;
    category: PartCategory;
    qualityGrade: QualityGrade;
    price: number;
    wholesalePrice: number;
    stockQuantity: number;
    imageUrl: string | null;
    isActive: boolean;
    moq: number;
  }> = [];

  const categories: PartCategory[] = ['Screens', 'Batteries', 'Charging_Ports', 'Cameras', 'Back_Glass'];
  const qualities: QualityGrade[] = ['OEM', 'Aftermarket', 'Refurbished'];
  const brands: Brand[] = ['Apple', 'Samsung', 'Motorola'];

  for (const brand of brands) {
    const models = deviceModels[brand];
    
    for (const model of models) {
      for (const category of categories) {
        if (Math.random() < 0.15) continue;
        
        for (const quality of qualities) {
          if (quality === 'OEM' && Math.random() < 0.3) continue;
          if (quality === 'Refurbished' && Math.random() < 0.5) continue;
          
          const sku = generateSKU(brand, model, category, quality);
          const template = productTemplates[category];
          
          const name = `${brand} ${model} ${template.namePrefix} - ${quality}`;
          const description = `${template.descTemplate} Designed for ${brand} ${model}.`;
          let price = template.basePriceRange[0] + Math.random() * (template.basePriceRange[1] - template.basePriceRange[0]);
          price *= qualityMultipliers[quality];
          if (brand === 'Apple') price *= 1.3;
          else if (brand === 'Samsung') price *= 1.15;
          price = Math.round(price * 100) / 100;
          
          const wholesalePrice = Math.round(price * 0.7 * 100) / 100;
          const stockQuantity = getRandomStock();
          const moq = Math.random() < 0.7 ? 5 : Math.random() < 0.9 ? 10 : 20;

          products.push({
            sku,
            name,
            description,
            brand: brand as Brand,
            deviceModel: model,
            category: category as PartCategory,
            qualityGrade: quality as QualityGrade,
            price,
            wholesalePrice,
            stockQuantity,
            imageUrl: null,
            isActive: Math.random() > 0.05,
            moq
          });
        }
      }
    }
  }

  console.log(`Generating ${products.length} products...`);

  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await prisma.product.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + batchSize, products.length)} of ${products.length} products`);
  }

  console.log('\n=== Seed Data Summary ===');
  console.log(`Total Products: ${products.length}`);
  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
