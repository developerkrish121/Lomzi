import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

const prisma = new PrismaClient();
const adminCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(12)
    .max(72)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;

const categories = [
  {
    name: 'Fruits',
    slug: 'fruits',
    icon: 'Apple',
    description: 'Fresh, naturally sweet fruit for every day.',
  },
  {
    name: 'Vegetables',
    slug: 'vegetables',
    icon: 'Carrot',
    description: 'Crisp seasonal vegetables sourced for freshness.',
  },
  {
    name: 'Dairy',
    slug: 'dairy',
    icon: 'Milk',
    description: 'Milk, paneer, cheese and everyday dairy essentials.',
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    icon: 'Croissant',
    description: 'Fresh breads and soft baked favourites.',
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    icon: 'CupSoda',
    description: 'Tea, coffee, juices and refreshing drinks.',
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    icon: 'Cookie',
    description: 'Sweet and savoury bites for every craving.',
  },
  {
    name: 'Staples',
    slug: 'staples',
    icon: 'Wheat',
    description: 'Kitchen essentials for wholesome everyday cooking.',
  },
  {
    name: 'Frozen Food',
    slug: 'frozen-food',
    icon: 'Snowflake',
    description: 'Convenient frozen favourites ready when you are.',
  },
];

const products = [
  [
    'Royal Gala Apples',
    'royal-gala-apples',
    'fruits',
    'Crisp, juicy apples with a naturally sweet finish.',
    189,
    159,
    44,
    '4 pcs',
    'photo-1560806887-1e4cd0b6cbd6',
  ],
  [
    'Robusta Bananas',
    'robusta-bananas',
    'fruits',
    'Naturally ripened bananas, rich in energy and potassium.',
    65,
    null,
    70,
    '6 pcs',
    'photo-1603833665858-e61d17a86224',
  ],
  [
    'Nagpur Oranges',
    'nagpur-oranges',
    'fruits',
    'Bright, citrusy oranges packed with refreshing juice.',
    149,
    129,
    36,
    '1 kg',
    'photo-1547514701-42782101795e',
  ],
  [
    'Alphonso Mangoes',
    'alphonso-mangoes',
    'fruits',
    'Fragrant, golden mangoes with a rich creamy sweetness.',
    399,
    349,
    24,
    '6 pcs',
    'photo-1553279768-865429fa0078',
  ],
  [
    'Pomegranate',
    'pomegranate',
    'fruits',
    'Ruby-red arils with a balanced sweet-tart flavour.',
    239,
    null,
    28,
    '2 pcs',
    'photo-1541344999736-83eca272f6fc',
  ],
  [
    'Farm Fresh Tomatoes',
    'farm-fresh-tomatoes',
    'vegetables',
    'Firm red tomatoes for curries, salads and sauces.',
    49,
    39,
    80,
    '500 g',
    'photo-1662370761575-05ff1ee40d7d',
  ],
  [
    'Everyday Potatoes',
    'everyday-potatoes',
    'vegetables',
    'Versatile, clean potatoes selected for everyday cooking.',
    55,
    null,
    100,
    '1 kg',
    'photo-1518977676601-b53f82aba655',
  ],
  [
    'Red Onions',
    'red-onions',
    'vegetables',
    'Fresh red onions with balanced sharpness and crunch.',
    59,
    49,
    85,
    '1 kg',
    'photo-1685399246790-917f3b59934e',
  ],
  [
    'Broccoli',
    'broccoli',
    'vegetables',
    'Tender green florets, ideal for stir-fries and salads.',
    99,
    null,
    30,
    '1 pc',
    'photo-1459411621453-7b03977f4bfc',
  ],
  [
    'Baby Spinach',
    'baby-spinach',
    'vegetables',
    'Washed tender spinach leaves for quick healthy meals.',
    79,
    69,
    22,
    '200 g',
    'photo-1576045057995-568f588f82fb',
  ],
  [
    'Full Cream Milk',
    'full-cream-milk',
    'dairy',
    'Rich pasteurised milk with a smooth, creamy body.',
    72,
    null,
    120,
    '1 L',
    'photo-1563636619-e9143da7973b',
  ],
  [
    'Fresh Paneer',
    'fresh-paneer',
    'dairy',
    'Soft, fresh paneer made for curries, grills and snacks.',
    135,
    119,
    55,
    '200 g',
    'photo-1631452180519-c014fe946bc7',
  ],
  [
    'Cheddar Cheese Slices',
    'cheddar-cheese-slices',
    'dairy',
    'Creamy cheddar slices that melt beautifully.',
    165,
    149,
    42,
    '200 g',
    'photo-1486297678162-eb2a19b0a32d',
  ],
  [
    'Cultured Butter',
    'cultured-butter',
    'dairy',
    'Smooth salted butter with a clean dairy flavour.',
    125,
    null,
    64,
    '200 g',
    'photo-1589985270826-4b7bb135bc9d',
  ],
  [
    'Greek Yogurt',
    'greek-yogurt',
    'dairy',
    'Thick, protein-rich yogurt with a delicate tang.',
    95,
    85,
    40,
    '400 g',
    'photo-1488477181946-6428a0291777',
  ],
  [
    'Whole Wheat Bread',
    'whole-wheat-bread',
    'bakery',
    'Soft whole-wheat loaf with a nutty, hearty crumb.',
    55,
    null,
    60,
    '400 g',
    'photo-1509440159596-0249088772ff',
  ],
  [
    'Milk Bread',
    'milk-bread',
    'bakery',
    'Pillowy-soft sliced bread with a subtle milky sweetness.',
    48,
    42,
    45,
    '400 g',
    'photo-1549931319-a545dcf3bc73',
  ],
  [
    'Butter Croissants',
    'butter-croissants',
    'bakery',
    'Flaky, layered croissants baked with real butter.',
    179,
    159,
    22,
    '4 pcs',
    'photo-1555507036-ab1f4038808a',
  ],
  [
    'Classic Pav',
    'classic-pav',
    'bakery',
    'Fresh, soft pav for bhaji, vada pav and quick snacks.',
    42,
    null,
    50,
    '6 pcs',
    'photo-1509722747041-616f39b57569',
  ],
  [
    'Chocolate Muffins',
    'chocolate-muffins',
    'bakery',
    'Moist cocoa muffins studded with chocolate chips.',
    149,
    129,
    26,
    '4 pcs',
    'photo-1607958996333-41aef7caefaa',
  ],
  [
    'Assam Masala Tea',
    'assam-masala-tea',
    'beverages',
    'Bold Assam tea blended with warming whole spices.',
    249,
    219,
    35,
    '250 g',
    'photo-1594631252845-29fc4cc8cde9',
  ],
  [
    'Arabica Coffee',
    'arabica-coffee',
    'beverages',
    'Medium-roast Arabica coffee with cocoa and caramel notes.',
    399,
    359,
    32,
    '200 g',
    'photo-1447933601403-0c6688de566e',
  ],
  [
    'Cold Pressed Orange Juice',
    'cold-pressed-orange-juice',
    'beverages',
    'No-added-sugar orange juice with fresh citrus flavour.',
    145,
    129,
    25,
    '1 L',
    'photo-1600271886742-f049cd451bba',
  ],
  [
    'Sparkling Lime Soda',
    'sparkling-lime-soda',
    'beverages',
    'Crisp sparkling soda with a bright lime twist.',
    60,
    null,
    72,
    '750 ml',
    'photo-1544145945-f90425340c7e',
  ],
  [
    'Tender Coconut Water',
    'tender-coconut-water',
    'beverages',
    'Naturally hydrating coconut water with no added sugar.',
    99,
    89,
    44,
    '1 L',
    'photo-1520342868574-5fa3804e551c',
  ],
  [
    'Dark Chocolate',
    'dark-chocolate',
    'snacks',
    'Rich 70% cocoa chocolate with a clean bittersweet snap.',
    199,
    179,
    40,
    '100 g',
    'photo-1575377427642-087cf684f29d',
  ],
  [
    'Jeera Biscuits',
    'jeera-biscuits',
    'snacks',
    'Crisp savoury biscuits seasoned with roasted cumin.',
    75,
    null,
    65,
    '250 g',
    'photo-1558961363-fa8fdf82db35',
  ],
  [
    'Classic Salted Chips',
    'classic-salted-chips',
    'snacks',
    'Thin, crunchy potato chips finished with sea salt.',
    50,
    45,
    90,
    '90 g',
    'photo-1566478989037-eec170784d0b',
  ],
  [
    'Roasted Almonds',
    'roasted-almonds',
    'snacks',
    'Crunchy roasted almonds lightly seasoned with salt.',
    349,
    319,
    38,
    '200 g',
    'photo-1508061253366-f7da158b6d46',
  ],
  [
    'Instant Masala Noodles',
    'instant-masala-noodles',
    'snacks',
    'Quick-cooking noodles with a familiar masala blend.',
    84,
    75,
    110,
    '4 pack',
    'photo-1612929633738-8fe44f7ec841',
  ],
  [
    'Premium Basmati Rice',
    'premium-basmati-rice',
    'staples',
    'Long-grain aged basmati rice with an aromatic finish.',
    699,
    629,
    48,
    '5 kg',
    'photo-1586201375761-83865001e31c',
  ],
  [
    'Whole Wheat Atta',
    'whole-wheat-atta',
    'staples',
    'Stone-ground whole wheat flour for soft everyday rotis.',
    299,
    279,
    65,
    '5 kg',
    'photo-1509440159596-0249088772ff',
  ],
  [
    'Cold Pressed Groundnut Oil',
    'groundnut-oil',
    'staples',
    'Nutty cold-pressed oil suited to Indian cooking.',
    329,
    299,
    38,
    '1 L',
    'photo-1474979266404-7eaacbcd87c5',
  ],
  [
    'Natural Cane Sugar',
    'natural-cane-sugar',
    'staples',
    'Fine-grain cane sugar for beverages, baking and desserts.',
    65,
    null,
    80,
    '1 kg',
    'photo-1581441363689-1f3c3c414635',
  ],
  [
    'Iodised Sea Salt',
    'iodised-sea-salt',
    'staples',
    'Free-flowing iodised salt for balanced everyday seasoning.',
    28,
    null,
    120,
    '1 kg',
    'photo-1518110925495-5fe2fda0442c',
  ],
  [
    'Classic Vanilla Ice Cream',
    'vanilla-ice-cream',
    'frozen-food',
    'Creamy vanilla ice cream made with real dairy.',
    249,
    219,
    30,
    '700 ml',
    'photo-1560008581-09826d1de69e',
  ],
  [
    'Frozen Green Peas',
    'frozen-green-peas',
    'frozen-food',
    'Sweet green peas flash-frozen to preserve freshness.',
    135,
    119,
    54,
    '500 g',
    'photo-1587735243615-c03f25aaff15',
  ],
  [
    'Vegetable Momos',
    'vegetable-momos',
    'frozen-food',
    'Thin wrappers filled with a seasoned vegetable mix.',
    199,
    179,
    34,
    '20 pcs',
    'photo-1496116218417-1a781b1c416c',
  ],
  [
    'Crispy French Fries',
    'crispy-french-fries',
    'frozen-food',
    'Golden straight-cut fries ready for the oven or air fryer.',
    175,
    159,
    45,
    '750 g',
    'photo-1573080496219-bb080dd4f877',
  ],
  [
    'Sweet Corn',
    'frozen-sweet-corn',
    'frozen-food',
    'Tender sweet corn kernels, cleaned and flash-frozen.',
    125,
    null,
    50,
    '500 g',
    'photo-1551754655-cd27e38d2076',
  ],
];

export async function seedDefaultAdmin(database = prisma, environment = process.env) {
  const credentials = adminCredentialsSchema.safeParse({
    email: environment.SEED_ADMIN_EMAIL,
    password: environment.SEED_ADMIN_PASSWORD,
  });

  if (!credentials.success) {
    if (environment.NODE_ENV === 'production') {
      throw new Error(
        'Production admin seeding requires a valid SEED_ADMIN_EMAIL and a strong SEED_ADMIN_PASSWORD',
      );
    }
    return null;
  }

  const existing = await database.user.findUnique({ where: { email: credentials.data.email } });
  if (existing) return existing;

  const password = await bcrypt.hash(credentials.data.password, 12);
  return database.user.create({
    data: {
      name: 'Lomzi Administrator',
      email: credentials.data.email,
      password,
      role: 'ADMIN',
    },
  });
}

async function main() {
  await seedDefaultAdmin();
  const categoryIds = new Map();
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const [
    name,
    slug,
    categorySlug,
    description,
    price,
    discountPrice,
    stock,
    unit,
    imageId,
  ] of products) {
    const data = {
      name,
      slug,
      description,
      price,
      discountPrice,
      stock,
      unit,
      image: image(imageId),
      isAvailable: stock > 0,
      categoryId: categoryIds.get(categorySlug),
    };
    await prisma.product.upsert({ where: { slug }, update: data, create: data });
  }
  console.log(
    `Seeded the default administrator, ${categories.length} categories and ${products.length} products.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().finally(async () => prisma.$disconnect());
}
