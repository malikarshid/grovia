const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GROVIA database seeding...');

  // 1. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      storeName: 'GROVIA',
      storeEmail: 'support@grovia.in',
      storePhone: '+91 80 4965 2000',
      storeAddress: 'Grovia HQ, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      businessHours: '06:00 AM - 11:00 PM',
      deliveryFee: 30.0,
      freeDeliveryThreshold: 499.0,
      isDemoPayment: true,
      taxRate: 5.0,
    },
  });

  // 2. Roles & Permissions
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Full access to all system features' },
    { code: 'ADMIN', name: 'Administrator', description: 'General administrative access' },
    { code: 'INVENTORY_MGR', name: 'Inventory Manager', description: 'Manages products, stocks, and suppliers' },
    { code: 'ORDER_MGR', name: 'Order Manager', description: 'Manages customer orders and processing' },
    { code: 'DELIVERY_MGR', name: 'Delivery Manager', description: 'Manages dispatch and driver assignments' },
  ];

  for (const role of roles) {
    await prisma.staffRole.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }

  // 3. Users (Admin, Staff, Customers)
  const adminPassword = await bcrypt.hash('Grovia@Admin2026', 10);
  const staffPassword = await bcrypt.hash('Grovia@Staff2026', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@grovia.in' },
    update: {},
    create: {
      name: 'Vikramaditya Rao',
      email: 'admin@grovia.in',
      phone: '+91 98765 43210',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const inventoryMgr = await prisma.user.upsert({
    where: { email: 'inventory@grovia.in' },
    update: {},
    create: {
      name: 'Rajesh Nair',
      email: 'inventory@grovia.in',
      phone: '+91 98450 11223',
      passwordHash: staffPassword,
      role: 'INVENTORY_MGR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'rahul.sharma@example.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98200 12345',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      customerProfile: {
        create: {
          loyaltyPoints: 180,
        },
      },
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'priya.patel@example.com' },
    update: {},
    create: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 97123 45678',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      customerProfile: {
        create: {
          loyaltyPoints: 340,
        },
      },
    },
  });

  // 4. Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'Rahul Sharma',
      phone: '+91 98200 12345',
      houseNumber: 'Flat 402, Green Meadows',
      street: '14th Main Road, HAL 2nd Stage',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      instructions: 'Ring doorbell twice. Leave at security if unavailable.',
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: customer2.id,
      fullName: 'Priya Patel',
      phone: '+91 97123 45678',
      houseNumber: 'Villa 12, Palm Grove',
      street: 'Sarjapur Main Road',
      area: 'Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      instructions: 'Call on arrival at the main gate.',
      isDefault: true,
    },
  });

  // 5. Suppliers
  const suppliersData = [
    {
      name: 'FreshFarm Agro Direct',
      company: 'FreshFarm Agro Foods Pvt Ltd',
      email: 'orders@freshfarmagro.in',
      phone: '+91 253 2345678',
      address: 'Plot 45, APMC Market Yard, Nashik, Maharashtra 422003',
      leadTimeDays: 1,
      status: 'ACTIVE',
    },
    {
      name: 'Amul Dairy Federation',
      company: 'Gujarat Co-operative Milk Marketing Federation Ltd',
      email: 'sales@amul.coop',
      phone: '+91 2692 258506',
      address: 'Amul Dairy Road, Anand, Gujarat 388001',
      leadTimeDays: 2,
      status: 'ACTIVE',
    },
    {
      name: 'Tata Consumer Foods',
      company: 'Tata Consumer Products Limited',
      email: 'b2b@tataconsumer.com',
      phone: '+91 80 6732 4000',
      address: 'Kirloskar Business Park, Hebbal, Bengaluru 560024',
      leadTimeDays: 2,
      status: 'ACTIVE',
    },
    {
      name: 'ITC Agribusiness & FMCG',
      company: 'ITC Limited',
      email: 'groceryorders@itc.in',
      phone: '+91 33 2288 9371',
      address: 'Virginia House, 37 J.L. Nehru Road, Kolkata 700071',
      leadTimeDays: 3,
      status: 'ACTIVE',
    },
  ];

  const suppliers = [];
  for (const s of suppliersData) {
    const supp = await prisma.supplier.upsert({
      where: { email: s.email },
      update: s,
      create: s,
    });
    suppliers.push(supp);
  }

  // 6. Categories (10 categories)
  const categoriesData = [
    {
      name: 'Fresh Fruits',
      slug: 'fresh-fruits',
      description: 'Hand-picked fresh, seasonal and exotic fruits directly from orchards.',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
      displayOrder: 1,
    },
    {
      name: 'Fresh Vegetables',
      slug: 'fresh-vegetables',
      description: 'Farm-fresh green vegetables, root crops, herbs, and organic produce.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      displayOrder: 2,
    },
    {
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      description: 'Farm fresh milk, paneer, curd, butter, ghee, cheese, and farm eggs.',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      displayOrder: 3,
    },
    {
      name: 'Bakery & Breads',
      slug: 'bakery-breads',
      description: 'Artisanal sourdough, multigrain breads, buns, croissants, and rusks.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      displayOrder: 4,
    },
    {
      name: 'Beverages & Juices',
      slug: 'beverages-juices',
      description: 'Fresh coconut water, cold-pressed juices, premium teas, and artisanal coffees.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      displayOrder: 5,
    },
    {
      name: 'Snacks & Munchies',
      slug: 'snacks-munchies',
      description: 'Crisps, roasted nuts, fox nuts (makhana), bhujia, and healthy cookies.',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
      displayOrder: 6,
    },
    {
      name: 'Rice, Grains & Pulses',
      slug: 'rice-grains-pulses',
      description: 'Aromatic basmati rice, organic whole wheat flour (atta), dals, and pulses.',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      displayOrder: 7,
    },
    {
      name: 'Household Essentials',
      slug: 'household-essentials',
      description: 'Premium dishwashing liquids, laundry detergents, surface cleaners, and paper products.',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
      displayOrder: 8,
    },
    {
      name: 'Personal Care',
      slug: 'personal-care',
      description: 'Skin care, natural soaps, shampoos, oral hygiene, and wellness products.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      displayOrder: 9,
    },
    {
      name: 'Frozen Foods',
      slug: 'frozen-foods',
      description: 'Green peas, sweet corn, french fries, frozen parathas, and ice creams.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      displayOrder: 10,
    },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    catMap[c.slug] = cat.id;
  }

  // 7. Products (Realistic Indian Grocery Products)
  const productsData = [
    // Fruits
    {
      name: 'Ratnagiri Alphonso Mangoes (Grade A)',
      slug: 'ratnagiri-alphonso-mangoes',
      categorySlug: 'fresh-fruits',
      sku: 'FRU-MAN-001',
      price: 649.0,
      originalPrice: 799.0,
      unit: '6 pcs (approx 1.5 kg)',
      weight: 1.5,
      stock: 45,
      minStock: 10,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 142,
      description: 'GI-tagged authentic Ratnagiri Alphonso mangoes. Naturally ripened, ultra-sweet with rich aromatic golden pulp.',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Shimla Royal Gala Apples',
      slug: 'shimla-royal-gala-apples',
      categorySlug: 'fresh-fruits',
      sku: 'FRU-APP-002',
      price: 189.0,
      originalPrice: 220.0,
      unit: '4 pcs (approx 500 g)',
      weight: 0.5,
      stock: 60,
      minStock: 15,
      isFeatured: true,
      isBestSeller: false,
      rating: 4.7,
      reviewCount: 88,
      description: 'Crisp, sweet, and juicy Himachal apples directly sourced from high-altitude orchards in Shimla.',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Robusta Golden Bananas',
      slug: 'robusta-golden-bananas',
      categorySlug: 'fresh-fruits',
      sku: 'FRU-BAN-003',
      price: 49.0,
      originalPrice: 60.0,
      unit: '1 kg (approx 5-6 pcs)',
      weight: 1.0,
      stock: 120,
      minStock: 25,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.6,
      reviewCount: 310,
      description: 'Rich in potassium and natural energy. Farm-ripened without artificial chemicals.',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Nagpur Sweet Oranges (Santra)',
      slug: 'nagpur-sweet-oranges',
      categorySlug: 'fresh-fruits',
      sku: 'FRU-ORA-004',
      price: 99.0,
      originalPrice: 125.0,
      unit: '1 kg',
      weight: 1.0,
      stock: 35,
      minStock: 10,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.5,
      reviewCount: 64,
      description: 'Juicy, vitamin-C packed Nagpur oranges with a balanced sweet and tangy flavor.',
      image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },

    // Vegetables
    {
      name: 'Farm Fresh Desi Tomatoes',
      slug: 'farm-fresh-desi-tomatoes',
      categorySlug: 'fresh-vegetables',
      sku: 'VEG-TOM-001',
      price: 36.0,
      originalPrice: 45.0,
      unit: '1 kg',
      weight: 1.0,
      stock: 95,
      minStock: 20,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 420,
      description: 'Firm, naturally tangy, sun-ripened tomatoes grown sustainably without chemical sprays.',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Nashik Red Onions (Export Quality)',
      slug: 'nashik-red-onions',
      categorySlug: 'fresh-vegetables',
      sku: 'VEG-ONI-002',
      price: 48.0,
      originalPrice: 55.0,
      unit: '1 kg',
      weight: 1.0,
      stock: 140,
      minStock: 30,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 380,
      description: 'Premium medium-sized red onions with high pungency and extended shelf-life.',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Pahadi Baby Potatoes',
      slug: 'pahadi-baby-potatoes',
      categorySlug: 'fresh-vegetables',
      sku: 'VEG-POT-003',
      price: 42.0,
      originalPrice: 50.0,
      unit: '1 kg',
      weight: 1.0,
      stock: 80,
      minStock: 20,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.6,
      reviewCount: 195,
      description: 'Earthy, waxy potatoes ideal for Dum Aloo, curries, and roasting.',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Hydroponic English Cucumber',
      slug: 'hydroponic-english-cucumber',
      categorySlug: 'fresh-vegetables',
      sku: 'VEG-CUC-004',
      price: 55.0,
      originalPrice: 70.0,
      unit: '500 g (2 pcs)',
      weight: 0.5,
      stock: 50,
      minStock: 15,
      isFeatured: true,
      isBestSeller: false,
      rating: 4.8,
      reviewCount: 112,
      description: 'Zero pesticide, extra crunchy and seedless hydroponic cucumbers for salads.',
      image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'Organic Palak (Spinach)',
      slug: 'organic-palak-spinach',
      categorySlug: 'fresh-vegetables',
      sku: 'VEG-SPN-005',
      price: 28.0,
      originalPrice: 35.0,
      unit: '250 g bunch',
      weight: 0.25,
      stock: 40,
      minStock: 10,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.7,
      reviewCount: 156,
      description: 'Tender green iron-rich spinach leaves harvested on the morning of delivery.',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },

    // Dairy & Eggs
    {
      name: 'Amul Taaza Homogenised Toned Milk',
      slug: 'amul-taaza-toned-milk',
      categorySlug: 'dairy-eggs',
      sku: 'DAI-MLK-001',
      price: 74.0,
      originalPrice: 76.0,
      unit: '1 Litre Tetra Pak',
      weight: 1.0,
      stock: 150,
      minStock: 30,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 820,
      description: 'Fresh and pure toned milk with 3.0% fat and 8.5% SNF. No preservatives added.',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 1,
    },
    {
      name: 'Nandini Malai Fresh Paneer',
      slug: 'nandini-fresh-paneer',
      categorySlug: 'dairy-eggs',
      sku: 'DAI-PAN-002',
      price: 115.0,
      originalPrice: 125.0,
      unit: '200 g block',
      weight: 0.2,
      stock: 65,
      minStock: 15,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 310,
      description: 'Soft, melt-in-the-mouth cottage cheese crafted from 100% cow milk.',
      image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 1,
    },
    {
      name: 'Amul Salted Butter Block',
      slug: 'amul-salted-butter',
      categorySlug: 'dairy-eggs',
      sku: 'DAI-BUT-003',
      price: 275.0,
      originalPrice: 285.0,
      unit: '500 g',
      weight: 0.5,
      stock: 45,
      minStock: 12,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 540,
      description: 'The taste of India. Pure wholesome creamy butter made from fresh cream.',
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 1,
    },
    {
      name: 'Farm Fresh Brown Eggs (Pack of 6)',
      slug: 'farm-fresh-brown-eggs',
      categorySlug: 'dairy-eggs',
      sku: 'DAI-EGG-004',
      price: 68.0,
      originalPrice: 80.0,
      unit: 'Pack of 6',
      weight: 0.35,
      stock: 90,
      minStock: 20,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.7,
      reviewCount: 220,
      description: 'Nutrient-rich, grain-fed free-range brown eggs with deep orange yolks.',
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },

    // Bakery
    {
      name: 'Harvest Gold 100% Atta Multigrain Bread',
      slug: 'harvest-gold-multigrain-bread',
      categorySlug: 'bakery-breads',
      sku: 'BAK-BRD-001',
      price: 55.0,
      originalPrice: 60.0,
      unit: '450 g loaf',
      weight: 0.45,
      stock: 40,
      minStock: 10,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.6,
      reviewCount: 215,
      description: 'Baked with oats, sunflower seeds, linseeds, and 100% whole wheat. Zero maida.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 2,
    },
    {
      name: "The Baker's Dozen Whole Wheat Sourdough",
      slug: 'bakers-dozen-sourdough',
      categorySlug: 'bakery-breads',
      sku: 'BAK-SRD-002',
      price: 130.0,
      originalPrice: 150.0,
      unit: '300 g',
      weight: 0.3,
      stock: 22,
      minStock: 8,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.8,
      reviewCount: 76,
      description: 'Naturally fermented artisanal sourdough with a chewy crumb and golden crust.',
      image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 2,
    },

    // Beverages
    {
      name: 'Paper Boat Tender Coconut Water',
      slug: 'paper-boat-tender-coconut-water',
      categorySlug: 'beverages-juices',
      sku: 'BEV-COC-001',
      price: 50.0,
      originalPrice: 60.0,
      unit: '200 ml bottle',
      weight: 0.2,
      stock: 110,
      minStock: 25,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 390,
      description: 'Electrolyte-rich 100% pure tender coconut water with zero added sugar.',
      image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 2,
    },
    {
      name: 'Tata Tea Gold Leaf Tea',
      slug: 'tata-tea-gold-leaf',
      categorySlug: 'beverages-juices',
      sku: 'BEV-TEA-002',
      price: 295.0,
      originalPrice: 320.0,
      unit: '500 g pouch',
      weight: 0.5,
      stock: 75,
      minStock: 15,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 460,
      description: 'Exquisite blend of rich Assam CTC tea with 15% gently rolled long aromatic leaves.',
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 2,
    },

    // Snacks
    {
      name: "Haldiram's Nagpur Bhujia Sev",
      slug: 'haldirams-nagpur-bhujia-sev',
      categorySlug: 'snacks-munchies',
      sku: 'SNK-BHU-001',
      price: 110.0,
      originalPrice: 125.0,
      unit: '400 g pack',
      weight: 0.4,
      stock: 85,
      minStock: 20,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 512,
      description: 'Spiced moth bean flour crispy noodles seasoned with secret Indian spices.',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },
    {
      name: 'Roasted & Salted California Almonds',
      slug: 'roasted-california-almonds',
      categorySlug: 'snacks-munchies',
      sku: 'SNK-ALM-002',
      price: 349.0,
      originalPrice: 420.0,
      unit: '250 g jar',
      weight: 0.25,
      stock: 50,
      minStock: 15,
      isFeatured: true,
      isBestSeller: false,
      rating: 4.9,
      reviewCount: 168,
      description: 'Slow-roasted jumbo California almonds seasoned with Himalayan pink salt.',
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },

    // Rice & Grains
    {
      name: 'India Gate Super Basmati Rice',
      slug: 'india-gate-super-basmati-rice',
      categorySlug: 'rice-grains-pulses',
      sku: 'RIC-BAS-001',
      price: 495.0,
      originalPrice: 580.0,
      unit: '5 kg bag',
      weight: 5.0,
      stock: 65,
      minStock: 15,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 380,
      description: 'Aged long-grain basmati rice with irresistible aroma and pearly white grains.',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },
    {
      name: 'Aashirvaad Superior MP Shudh Chakki Atta',
      slug: 'aashirvaad-shudh-chakki-atta',
      categorySlug: 'rice-grains-pulses',
      sku: 'RIC-ATT-002',
      price: 245.0,
      originalPrice: 275.0,
      unit: '5 kg bag',
      weight: 5.0,
      stock: 90,
      minStock: 20,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 670,
      description: '100% whole wheat flour made from MP golden grains. Produces soft rotis.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },
    {
      name: 'Tata Sampann Unpolished Toor Dal',
      slug: 'tata-sampann-unpolished-toor-dal',
      categorySlug: 'rice-grains-pulses',
      sku: 'RIC-DAL-003',
      price: 185.0,
      originalPrice: 210.0,
      unit: '1 kg pouch',
      weight: 1.0,
      stock: 80,
      minStock: 20,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.7,
      reviewCount: 290,
      description: 'Naturally protein-rich, chemical-free unpolished yellow pigeon peas.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 2,
    },

    // Household
    {
      name: 'Surf Excel Matic Front Load Liquid Detergent',
      slug: 'surf-excel-matic-liquid-detergent',
      categorySlug: 'household-essentials',
      sku: 'HOU-DET-001',
      price: 399.0,
      originalPrice: 460.0,
      unit: '2 Litre Pouch',
      weight: 2.0,
      stock: 45,
      minStock: 10,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 310,
      description: 'Tough stain removal in 1 wash inside the machine. Gentle on clothes.',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },
    {
      name: 'Vim Dishwash Gel with Lemon',
      slug: 'vim-dishwash-gel-lemon',
      categorySlug: 'household-essentials',
      sku: 'HOU-VIM-002',
      price: 195.0,
      originalPrice: 220.0,
      unit: '750 ml Bottle',
      weight: 0.75,
      stock: 70,
      minStock: 15,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 250,
      description: 'Powered by 100 lemons power. Removes tough grease effortlessly without residue.',
      image: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },

    // Personal Care
    {
      name: 'Dettol Original Germ Protection Liquid Handwash',
      slug: 'dettol-original-handwash',
      categorySlug: 'personal-care',
      sku: 'PER-DET-001',
      price: 129.0,
      originalPrice: 145.0,
      unit: '675 ml Refill',
      weight: 0.675,
      stock: 60,
      minStock: 15,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 410,
      description: 'Kills 99.9% germs with 100% better skin protection. Enriched with moisturizers.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },

    // Frozen Foods
    {
      name: 'Safal Frozen Select Green Peas',
      slug: 'safal-frozen-green-peas',
      categorySlug: 'frozen-foods',
      sku: 'FRZ-PEA-001',
      price: 110.0,
      originalPrice: 130.0,
      unit: '1 kg pack',
      weight: 1.0,
      stock: 45,
      minStock: 10,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 190,
      description: 'Naturally sweet green peas individually quick frozen (IQF) to lock in farm-fresh goodness.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 0,
    },
    {
      name: 'McCain French Fries (Crispy Cut)',
      slug: 'mccain-french-fries',
      categorySlug: 'frozen-foods',
      sku: 'FRZ-FFR-002',
      price: 145.0,
      originalPrice: 165.0,
      unit: '420 g pack',
      weight: 0.42,
      stock: 35,
      minStock: 8,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.6,
      reviewCount: 145,
      description: 'Golden crispy potato french fries. Ready in 3 minutes via deep frying or air frying.',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
      supplierIndex: 3,
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const categoryId = catMap[p.categorySlug];
    const supplier = suppliers[p.supplierIndex] || suppliers[0];

    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        unit: p.unit,
        weight: p.weight,
        stock: p.stock,
        minStock: p.minStock,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        rating: p.rating,
        reviewCount: p.reviewCount,
        description: p.description,
        image: p.image,
      },
      create: {
        name: p.name,
        slug: p.slug,
        categoryId: categoryId,
        sku: p.sku,
        price: p.price,
        originalPrice: p.originalPrice,
        unit: p.unit,
        weight: p.weight,
        stock: p.stock,
        minStock: p.minStock,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isActive: true,
        rating: p.rating,
        reviewCount: p.reviewCount,
        description: p.description,
        image: p.image,
      },
    });

    createdProducts.push(prod);

    // Create primary image
    await prisma.productImage.create({
      data: {
        productId: prod.id,
        url: p.image,
        isPrimary: true,
        altText: p.name,
      },
    });

    // Create inventory record
    await prisma.inventory.upsert({
      where: { productId: prod.id },
      update: {
        currentStock: p.stock,
        minThreshold: p.minStock,
        status: p.stock <= 0 ? 'OUT_OF_STOCK' : p.stock <= p.minStock ? 'LOW_STOCK' : 'IN_STOCK',
      },
      create: {
        productId: prod.id,
        currentStock: p.stock,
        minThreshold: p.minStock,
        reorderQuantity: 50,
        status: p.stock <= 0 ? 'OUT_OF_STOCK' : p.stock <= p.minStock ? 'LOW_STOCK' : 'IN_STOCK',
        supplierId: supplier.id,
        leadTimeDays: supplier.leadTimeDays,
      },
    });

    // Record initial stock movement
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        type: 'IN',
        quantity: p.stock,
        previousStock: 0,
        newStock: p.stock,
        reason: 'Initial stock intake from supplier',
        createdBy: 'Inventory Manager',
      },
    });
  }

  // 8. Delivery Slots
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const slotsData = [
    { date: dateStr, startTime: '07:00 AM', endTime: '09:00 AM', capacity: 25, bookedCount: 8 },
    { date: dateStr, startTime: '10:00 AM', endTime: '12:00 PM', capacity: 30, bookedCount: 14 },
    { date: dateStr, startTime: '02:00 PM', endTime: '04:00 PM', capacity: 25, bookedCount: 6 },
    { date: dateStr, startTime: '06:00 PM', endTime: '08:00 PM', capacity: 30, bookedCount: 18 },
    { date: tomorrowStr, startTime: '07:00 AM', endTime: '09:00 AM', capacity: 30, bookedCount: 4 },
    { date: tomorrowStr, startTime: '10:00 AM', endTime: '12:00 PM', capacity: 30, bookedCount: 7 },
    { date: tomorrowStr, startTime: '06:00 PM', endTime: '08:00 PM', capacity: 30, bookedCount: 5 },
  ];

  const deliverySlots = [];
  for (const slot of slotsData) {
    const s = await prisma.deliverySlot.create({
      data: slot,
    });
    deliverySlots.push(s);
  }

  // 9. Coupons
  const couponsData = [
    {
      code: 'GROVIA100',
      description: 'Flat ₹100 off on grocery orders above ₹500',
      discountType: 'FIXED',
      discountValue: 100.0,
      minOrderAmount: 500.0,
      maxDiscount: 100.0,
      usageLimit: 500,
      usedCount: 38,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    {
      code: 'FRESH15',
      description: '15% instant discount on fresh fruits and vegetables',
      discountType: 'PERCENTAGE',
      discountValue: 15.0,
      minOrderAmount: 399.0,
      maxDiscount: 150.0,
      usageLimit: 300,
      usedCount: 74,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    {
      code: 'WELCOME20',
      description: '20% welcome discount for new shoppers up to ₹200',
      discountType: 'PERCENTAGE',
      discountValue: 20.0,
      minOrderAmount: 299.0,
      maxDiscount: 200.0,
      usageLimit: 1000,
      usedCount: 182,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  // 10. Sample Customer Orders & Deliveries
  const p1 = createdProducts[0]; // Alphonso Mangoes
  const p2 = createdProducts[4]; // Desi Tomatoes
  const p3 = createdProducts[9]; // Amul Milk
  const p4 = createdProducts[16]; // Paper Boat Coconut Water

  // Order 1 (Delivered)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'GRO-2026-8812',
      userId: customer1.id,
      addressId: address1.id,
      deliverySlotId: deliverySlots[0].id,
      subtotal: 759.0,
      discount: 100.0,
      deliveryFee: 0.0,
      tax: 32.95,
      total: 691.95,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      channel: 'MOBILE',
      notes: 'Delivered at morning slot.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            unit: p1.unit,
            price: p1.price,
            quantity: 1,
            total: p1.price,
          },
          {
            productId: p3.id,
            productName: p3.name,
            unit: p3.unit,
            price: p3.price,
            quantity: 1,
            total: p3.price,
          },
          {
            productId: p2.id,
            productName: p2.name,
            unit: p2.unit,
            price: p2.price,
            quantity: 1,
            total: p2.price,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      transactionId: 'TXN_UPI_99214488',
      provider: 'DEMO',
      method: 'UPI',
      amount: 691.95,
      status: 'SUCCESS',
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order1.id,
      trackingNumber: 'TRK-BLR-8812',
      status: 'DELIVERED',
      deliveryPersonName: 'Sunil Gowda',
      deliveryPersonPhone: '+91 99801 23456',
      departureTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000),
      deliveredTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7200000),
      notes: 'Package safely handed over to resident.',
    },
  });

  // Order 2 (Out for Delivery - active order for tracking verification)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'GRO-2026-9045',
      userId: customer1.id,
      addressId: address1.id,
      deliverySlotId: deliverySlots[1].id,
      subtotal: 549.0,
      discount: 0.0,
      deliveryFee: 0.0,
      tax: 27.45,
      total: 576.45,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      orderStatus: 'OUT_FOR_DELIVERY',
      channel: 'WEB',
      notes: 'Please verify gate code.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: p3.id,
            productName: p3.name,
            unit: p3.unit,
            price: p3.price,
            quantity: 2,
            total: p3.price * 2,
          },
          {
            productId: p4.id,
            productName: p4.name,
            unit: p4.unit,
            price: p4.price,
            quantity: 4,
            total: p4.price * 4,
          },
          {
            productId: p2.id,
            productName: p2.name,
            unit: p2.unit,
            price: p2.price,
            quantity: 2,
            total: p2.price * 2,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      transactionId: 'TXN_CARD_88771122',
      provider: 'DEMO',
      method: 'CARD',
      amount: 576.45,
      status: 'SUCCESS',
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order2.id,
      trackingNumber: 'TRK-BLR-9045',
      status: 'OUT_FOR_DELIVERY',
      deliveryPersonName: 'Karthik Somanna',
      deliveryPersonPhone: '+91 98450 77889',
      departureTime: new Date(Date.now() - 30 * 60 * 1000),
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
      notes: 'Out for dispatch in temperature-controlled bag.',
    },
  });

  // Order 3 (Pending - Priya Patel)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'GRO-2026-9110',
      userId: customer2.id,
      addressId: address2.id,
      deliverySlotId: deliverySlots[3].id,
      subtotal: 940.0,
      discount: 141.0, // 15% discount
      deliveryFee: 0.0,
      tax: 39.95,
      total: 838.95,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'CONFIRMED',
      channel: 'WEB',
      notes: 'Evening delivery requested.',
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            unit: p1.unit,
            price: p1.price,
            quantity: 1,
            total: p1.price,
          },
          {
            productId: createdProducts[18].id, // Roasted Almonds
            productName: createdProducts[18].name,
            unit: createdProducts[18].unit,
            price: createdProducts[18].price,
            quantity: 1,
            total: createdProducts[18].price,
          },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order3.id,
      trackingNumber: 'TRK-BLR-9110',
      status: 'PENDING',
      notes: 'Order confirmed and allocated for packaging.',
    },
  });

  // 11. Customer Favourites
  await prisma.favorite.create({
    data: {
      userId: customer1.id,
      productId: p1.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: customer1.id,
      productId: p3.id,
    },
  });

  // 12. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        title: 'Order Dispatched! 🛵',
        message: 'Your order #GRO-2026-9045 is on the way with delivery partner Karthik.',
        type: 'ORDER',
        link: '/orders',
        isRead: false,
      },
      {
        userId: customer1.id,
        title: 'Fresh Mango Season is Here!',
        message: 'Authentic Ratnagiri Alphonso Mangoes are back in stock. Enjoy flat ₹100 off with code GROVIA100.',
        type: 'PROMO',
        link: '/products/ratnagiri-alphonso-mangoes',
        isRead: true,
      },
      {
        userId: null,
        title: 'Low Stock Alert: Organic Palak',
        message: 'Organic Palak (Spinach) has reached threshold (10 units remaining).',
        type: 'STOCK',
        link: '/admin/inventory',
        isRead: false,
      },
      {
        userId: null,
        title: 'New Online Order #GRO-2026-9110',
        message: 'New order placed by Priya Patel for ₹838.95 via COD.',
        type: 'ORDER',
        link: '/admin/orders',
        isRead: false,
      },
    ],
  });

  // 13. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'StoreSettings',
      entityId: 'default-settings',
      details: 'Store parameters and seed catalog successfully initialized for GROVIA.',
    },
  });

  console.log('✅ GROVIA database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
