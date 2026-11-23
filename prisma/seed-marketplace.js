const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMarketplace() {
  console.log('🇮🇳 Starting GROVIA India-Wide Marketplace Seeding...');

  // 1. 30 Departments
  const departmentsData = [
    { name: 'Fruits and Vegetables', slug: 'fruits-vegetables', icon: 'Apple', displayOrder: 1, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' },
    { name: 'Dairy, Bread and Eggs', slug: 'dairy-bread-eggs', icon: 'Milk', displayOrder: 2, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
    { name: 'Atta, Rice and Dal', slug: 'atta-rice-dal', icon: 'Wheat', displayOrder: 3, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Masala, Oil and Dry Fruits', slug: 'masala-oil-dry-fruits', icon: 'Flame', displayOrder: 4, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' },
    { name: 'Snacks and Munchies', slug: 'snacks-munchies', icon: 'Cookie', displayOrder: 5, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cold Drinks and Juices', slug: 'cold-drinks-juices', icon: 'CupSoda', displayOrder: 6, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80' },
    { name: 'Breakfast and Instant Food', slug: 'breakfast-instant-food', icon: 'Coffee', displayOrder: 7, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Bakery and Biscuits', slug: 'bakery-biscuits', icon: 'CakeSlice', displayOrder: 8, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
    { name: 'Chocolates and Sweets', slug: 'chocolates-sweets', icon: 'Candy', displayOrder: 9, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Tea and Coffee', slug: 'tea-coffee', icon: 'CupSoda', displayOrder: 10, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80' },
    { name: 'Meat, Fish and Seafood', slug: 'meat-fish-seafood', icon: 'Fish', displayOrder: 11, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Frozen Food', slug: 'frozen-food', icon: 'Snowflake', displayOrder: 12, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Baby Care', slug: 'baby-care', icon: 'Baby', displayOrder: 13, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80' },
    { name: 'Personal Care', slug: 'personal-care', icon: 'Sparkles', displayOrder: 14, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
    { name: 'Beauty and Hygiene', slug: 'beauty-hygiene', icon: 'Heart', displayOrder: 15, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Bath and Body', slug: 'bath-body', icon: 'Droplets', displayOrder: 16, image: 'https://images.unsplash.com/photo-1608248597359-59800539c366?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cleaning Essentials', slug: 'cleaning-essentials', icon: 'SprayCan', displayOrder: 17, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80' },
    { name: 'Household Supplies', slug: 'household-supplies', icon: 'Home', displayOrder: 18, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Kitchen Essentials', slug: 'kitchen-essentials', icon: 'Utensils', displayOrder: 19, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Pet Care', slug: 'pet-care', icon: 'Dog', displayOrder: 20, image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80' },
    { name: 'Health and Wellness', slug: 'health-wellness', icon: 'Activity', displayOrder: 21, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
    { name: 'Organic and Natural Products', slug: 'organic-natural-products', icon: 'Leaf', displayOrder: 22, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Regional Indian Foods', slug: 'regional-indian-foods', icon: 'MapPin', displayOrder: 23, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
    { name: 'Pooja Essentials', slug: 'pooja-essentials', icon: 'Sun', displayOrder: 24, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80' },
    { name: 'Stationery and Daily Needs', slug: 'stationery-daily-needs', icon: 'BookOpen', displayOrder: 25, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80' },
    { name: 'Packaged Food', slug: 'packaged-food', icon: 'Package', displayOrder: 26, image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=600&q=80' },
    { name: 'Home and Lifestyle', slug: 'home-lifestyle', icon: 'Compass', displayOrder: 27, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Seasonal Products', slug: 'seasonal-products', icon: 'Calendar', displayOrder: 28, image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80' },
    { name: 'Festival Essentials', slug: 'festival-essentials', icon: 'Gift', displayOrder: 29, image: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Other Grocery Products', slug: 'other-grocery-products', icon: 'ShoppingBag', displayOrder: 30, image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80' },
  ];

  const deptMap = {};
  for (const dept of departmentsData) {
    const created = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: dept,
      create: dept,
    });
    deptMap[dept.slug] = created;
  }
  console.log(`✅ Upserted ${departmentsData.length} Marketplace Departments.`);

  // Link existing categories to departments
  const catMappings = [
    { catSlug: 'fresh-fruits', deptSlug: 'fruits-vegetables' },
    { catSlug: 'fresh-vegetables', deptSlug: 'fruits-vegetables' },
    { catSlug: 'dairy-eggs', deptSlug: 'dairy-bread-eggs' },
    { catSlug: 'bakery-breads', deptSlug: 'bakery-biscuits' },
    { catSlug: 'staples-grains', deptSlug: 'atta-rice-dal' },
    { catSlug: 'snacks-beverages', deptSlug: 'snacks-munchies' },
    { catSlug: 'household-essentials', deptSlug: 'cleaning-essentials' },
    { catSlug: 'personal-care', deptSlug: 'personal-care' },
  ];

  for (const mapping of catMappings) {
    const dept = deptMap[mapping.deptSlug];
    if (dept) {
      await prisma.category.updateMany({
        where: { slug: mapping.catSlug },
        data: { departmentId: dept.id },
      });
    }
  }

  // 2. Subcategories
  const subcategoriesData = [
    // Fruits & Vegetables
    { name: 'Apples & Pears', slug: 'apples-pears', categorySlug: 'fresh-fruits', displayOrder: 1 },
    { name: 'Bananas & Melons', slug: 'bananas-melons', categorySlug: 'fresh-fruits', displayOrder: 2 },
    { name: 'Mangoes & Seasonal', slug: 'mangoes-seasonal', categorySlug: 'fresh-fruits', displayOrder: 3 },
    { name: 'Citrus & Berries', slug: 'citrus-berries', categorySlug: 'fresh-fruits', displayOrder: 4 },
    { name: 'Onions, Potatoes & Tomatoes', slug: 'onions-potatoes-tomatoes', categorySlug: 'fresh-vegetables', displayOrder: 1 },
    { name: 'Leafy Greens & Herbs', slug: 'leafy-greens-herbs', categorySlug: 'fresh-vegetables', displayOrder: 2 },
    { name: 'Exotic & Organic Veggies', slug: 'exotic-organic-veggies', categorySlug: 'fresh-vegetables', displayOrder: 3 },
    // Dairy
    { name: 'Milk & Cream', slug: 'milk-cream', categorySlug: 'dairy-eggs', displayOrder: 1 },
    { name: 'Paneer, Butter & Cheese', slug: 'paneer-butter-cheese', categorySlug: 'dairy-eggs', displayOrder: 2 },
    { name: 'Curd & Yogurt', slug: 'curd-yogurt', categorySlug: 'dairy-eggs', displayOrder: 3 },
    { name: 'Farm Fresh Eggs', slug: 'farm-fresh-eggs', categorySlug: 'dairy-eggs', displayOrder: 4 },
    // Staples
    { name: 'Atta & Flours', slug: 'atta-flours', categorySlug: 'staples-grains', displayOrder: 1 },
    { name: 'Rice & Rice Products', slug: 'rice-products', categorySlug: 'staples-grains', displayOrder: 2 },
    { name: 'Dals & Pulses', slug: 'dals-pulses', categorySlug: 'staples-grains', displayOrder: 3 },
    { name: 'Cooking Oils & Ghee', slug: 'cooking-oils-ghee', categorySlug: 'staples-grains', displayOrder: 4 },
    // Snacks
    { name: 'Namkeen & Indian Snacks', slug: 'namkeen-indian-snacks', categorySlug: 'snacks-beverages', displayOrder: 1 },
    { name: 'Chips & Crisps', slug: 'chips-crisps', categorySlug: 'snacks-beverages', displayOrder: 2 },
    { name: 'Tea & Coffee Powders', slug: 'tea-coffee-powders', categorySlug: 'snacks-beverages', displayOrder: 3 },
    // Cleaning
    { name: 'Laundry Detergents', slug: 'laundry-detergents', categorySlug: 'household-essentials', displayOrder: 1 },
    { name: 'Dishwashing & Surface Cleaners', slug: 'dishwashing-surface-cleaners', categorySlug: 'household-essentials', displayOrder: 2 },
    { name: 'Soaps & Handwash', slug: 'soaps-handwash', categorySlug: 'personal-care', displayOrder: 1 },
  ];

  for (const sub of subcategoriesData) {
    const parentCat = await prisma.category.findUnique({ where: { slug: sub.categorySlug } });
    if (parentCat) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, categoryId: parentCat.id, displayOrder: sub.displayOrder },
        create: { name: sub.name, slug: sub.slug, categoryId: parentCat.id, displayOrder: sub.displayOrder },
      });
    }
  }
  console.log(`✅ Upserted subcategories.`);

  // 3. Indian Brands
  const brandsData = [
    { name: 'Amul', slug: 'amul', origin: 'Anand, Gujarat', isFeatured: true, description: 'The Taste of India. Trusted dairy cooperative.' },
    { name: 'Aashirvaad', slug: 'aashirvaad', origin: 'Kolkata, West Bengal', isFeatured: true, description: 'ITC staple brand famous for 100% whole wheat chakki atta.' },
    { name: 'Tata Sampann', slug: 'tata-sampann', origin: 'Mumbai, Maharashtra', isFeatured: true, description: 'Unpolished pulses and pure Indian spices by Tata Consumer.' },
    { name: 'Fortune', slug: 'fortune', origin: 'Ahmedabad, Gujarat', isFeatured: true, description: 'Leading edible oils, soya chunks, and basmati rice from Adani Wilmar.' },
    { name: 'Haldiram\'s', slug: 'haldirams', origin: 'Nagpur, Maharashtra', isFeatured: true, description: 'Iconic traditional Indian sweets, namkeens, and ready snacks.' },
    { name: 'India Gate', slug: 'india-gate', origin: 'New Delhi', isFeatured: true, description: 'World renowned aged aromatic basmati rice by KRBL.' },
    { name: 'Dettol', slug: 'dettol', origin: 'Gurugram, Haryana', isFeatured: true, description: 'India’s most trusted antiseptic and hygiene brand.' },
    { name: 'Surf Excel', slug: 'surf-excel', origin: 'Mumbai, Maharashtra', isFeatured: true, description: 'Market leader in superior laundry care and stain removal.' },
    { name: 'Dabur', slug: 'dabur', origin: 'Ghaziabad, Uttar Pradesh', isFeatured: true, description: 'Ayurvedic health, wellness, and 100% pure honey.' },
    { name: 'Nescafe', slug: 'nescafe', origin: 'New Delhi', isFeatured: false, description: 'Rich premium instant coffee granules.' },
    { name: 'Saffola', slug: 'saffola', origin: 'Mumbai, Maharashtra', isFeatured: true, description: 'Heart-healthy blended oils and oats by Marico.' },
    { name: 'Britannia', slug: 'britannia', origin: 'Bengaluru, Karnataka', isFeatured: true, description: 'Good Day, Marie Gold, and beloved bakery products.' },
    { name: 'Everest', slug: 'everest', origin: 'Mumbai, Maharashtra', isFeatured: false, description: 'Pure blended spices, masala powders, and seasoning.' },
    { name: 'Epigamia', slug: 'epigamia', origin: 'Mumbai, Maharashtra', isFeatured: true, description: 'All-natural Greek yogurts, smoothies, and almond milk.' },
    { name: 'Nandini', slug: 'nandini', origin: 'Bengaluru, Karnataka', isFeatured: true, description: 'Karnataka Milk Federation (KMF) fresh farm milk, butter, and ghee.' },
    { name: 'Grovia Organic Farm', slug: 'grovia-organic', origin: 'Bengaluru, Karnataka', isFeatured: true, description: 'GROVIA exclusive certified chemical-free produce directly from partnered farmers.' },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brandMap[b.slug] = brand;
  }
  console.log(`✅ Upserted ${brandsData.length} Leading Indian Brands.`);

  // 4. Fulfilment Centres (Dark Stores & Hubs)
  const centresData = [
    {
      code: 'BLR-IND-01',
      name: 'Bengaluru Central Dark Store (Indiranagar)',
      type: 'DARK_STORE',
      address: 'Plot 45, 100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      deliveryRadiusKm: 10.0,
      operationalHours: '06:00 AM - 11:30 PM',
      capacityOrdersPerHour: 150,
      isActive: true,
    },
    {
      code: 'BLR-KOR-02',
      name: 'Bengaluru South Dark Store (Koramangala/HSR)',
      type: 'DARK_STORE',
      address: '17th Main Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
      deliveryRadiusKm: 12.0,
      operationalHours: '06:00 AM - 11:30 PM',
      capacityOrdersPerHour: 180,
      isActive: true,
    },
    {
      code: 'BOM-AND-01',
      name: 'Mumbai Western Dark Store (Andheri West)',
      type: 'DARK_STORE',
      address: 'Lokhandwala Complex, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      latitude: 19.1363,
      longitude: 72.8277,
      deliveryRadiusKm: 8.0,
      operationalHours: '06:00 AM - 11:30 PM',
      capacityOrdersPerHour: 200,
      isActive: true,
    },
    {
      code: 'DEL-GUR-01',
      name: 'Delhi NCR Fulfilment Hub (DLF Cybercity)',
      type: 'DARK_STORE',
      address: 'Sector 25, Phase 2, DLF Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      latitude: 28.4907,
      longitude: 77.0898,
      deliveryRadiusKm: 15.0,
      operationalHours: '06:00 AM - 11:30 PM',
      capacityOrdersPerHour: 160,
      isActive: true,
    },
    {
      code: 'HYD-HIT-01',
      name: 'Hyderabad Tech Hub Dark Store (HITEC City)',
      type: 'DARK_STORE',
      address: 'Madhapur Main Road, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      latitude: 17.4474,
      longitude: 78.3762,
      deliveryRadiusKm: 12.0,
      operationalHours: '06:00 AM - 11:30 PM',
      capacityOrdersPerHour: 140,
      isActive: true,
    },
    {
      code: 'NAT-NAG-01',
      name: 'GROVIA Central National Distribution Centre',
      type: 'WAREHOUSE',
      address: 'MIHAN Multi-modal Logistics Park',
      city: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441108',
      latitude: 21.0560,
      longitude: 79.0530,
      deliveryRadiusKm: 2500.0,
      operationalHours: '24 Hours',
      capacityOrdersPerHour: 1000,
      isActive: true,
    },
  ];

  const centreMap = {};
  for (const c of centresData) {
    const centre = await prisma.fulfilmentCentre.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    centreMap[c.code] = centre;
  }
  console.log(`✅ Upserted ${centresData.length} Fulfilment Centres.`);

  // 5. Serviceable PIN Codes
  const pinCodesData = [
    // Bengaluru (Quick Local 15-25m)
    { pincode: '560038', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 15, estimatedDeliveryDays: 0, centreCode: 'BLR-IND-01' },
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 20, estimatedDeliveryDays: 0, centreCode: 'BLR-IND-01' },
    { pincode: '560008', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 18, estimatedDeliveryDays: 0, centreCode: 'BLR-IND-01' },
    { pincode: '560034', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 15, estimatedDeliveryDays: 0, centreCode: 'BLR-KOR-02' },
    { pincode: '560102', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 15, estimatedDeliveryDays: 0, centreCode: 'BLR-KOR-02' },
    { pincode: '560103', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 20, estimatedDeliveryDays: 0, centreCode: 'BLR-KOR-02' },
    { pincode: '560100', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 25, estimatedDeliveryDays: 0, centreCode: 'BLR-KOR-02' },
    // Mumbai (Quick Local 20-30m)
    { pincode: '400053', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 18, estimatedDeliveryDays: 0, centreCode: 'BOM-AND-01' },
    { pincode: '400050', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 22, estimatedDeliveryDays: 0, centreCode: 'BOM-AND-01' },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 25, estimatedDeliveryDays: 0, centreCode: 'BOM-AND-01' },
    // Delhi NCR (Quick Local 20-30m)
    { pincode: '122002', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 18, estimatedDeliveryDays: 0, centreCode: 'DEL-GUR-01' },
    { pincode: '122001', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 20, estimatedDeliveryDays: 0, centreCode: 'DEL-GUR-01' },
    { pincode: '110001', city: 'New Delhi', state: 'Delhi', district: 'Central Delhi', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 25, estimatedDeliveryDays: 0, centreCode: 'DEL-GUR-01' },
    // Hyderabad (Quick Local 20m)
    { pincode: '500081', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 15, estimatedDeliveryDays: 0, centreCode: 'HYD-HIT-01' },
    { pincode: '500032', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', deliveryMode: 'QUICK_LOCAL', estimatedDeliveryMinutes: 20, estimatedDeliveryDays: 0, centreCode: 'HYD-HIT-01' },
    // Nationwide Courier Cities (2-4 Days)
    { pincode: '411001', city: 'Pune', state: 'Maharashtra', district: 'Pune', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 2880, estimatedDeliveryDays: 2, centreCode: 'NAT-NAG-01' },
    { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 2880, estimatedDeliveryDays: 2, centreCode: 'NAT-NAG-01' },
    { pincode: '700001', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 4320, estimatedDeliveryDays: 3, centreCode: 'NAT-NAG-01' },
    { pincode: '302001', city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 4320, estimatedDeliveryDays: 3, centreCode: 'NAT-NAG-01' },
    { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 4320, estimatedDeliveryDays: 3, centreCode: 'NAT-NAG-01' },
    { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 2880, estimatedDeliveryDays: 2, centreCode: 'NAT-NAG-01' },
    { pincode: '682001', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 4320, estimatedDeliveryDays: 3, centreCode: 'NAT-NAG-01' },
    { pincode: '440001', city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', deliveryMode: 'NATIONWIDE', estimatedDeliveryMinutes: 1440, estimatedDeliveryDays: 1, centreCode: 'NAT-NAG-01' },
  ];

  for (const p of pinCodesData) {
    const centre = centreMap[p.centreCode];
    await prisma.serviceablePinCode.upsert({
      where: { pincode: p.pincode },
      update: {
        city: p.city,
        state: p.state,
        district: p.district,
        deliveryMode: p.deliveryMode,
        estimatedDeliveryMinutes: p.estimatedDeliveryMinutes,
        estimatedDeliveryDays: p.estimatedDeliveryDays,
        fulfilmentCentreId: centre ? centre.id : null,
      },
      create: {
        pincode: p.pincode,
        city: p.city,
        state: p.state,
        district: p.district,
        deliveryMode: p.deliveryMode,
        estimatedDeliveryMinutes: p.estimatedDeliveryMinutes,
        estimatedDeliveryDays: p.estimatedDeliveryDays,
        fulfilmentCentreId: centre ? centre.id : null,
      },
    });
  }
  console.log(`✅ Upserted ${pinCodesData.length} Serviceable PIN Codes.`);

  // 6. Delivery Pricing Rules
  await prisma.deliveryPricingRule.upsert({
    where: { id: 'default-pricing-rule' },
    update: {},
    create: {
      id: 'default-pricing-rule',
      name: 'GROVIA Standard National & Quick Rules',
      minOrderValue: 99.0,
      standardDeliveryFee: 99.0,
      freeDeliveryThreshold: 499.0,
      quickExpressFee: 25.0,
      smallOrderFee: 20.0,
      handlingFee: 5.0,
      isFreeDeliveryCampaign: true,
      campaignDescription: '🎉 Free Delivery on orders over ₹499 across all serviceable PIN codes!',
      isActive: true,
    },
  });

  // 7. Delivery Fleet Partners
  const driversData = [
    { name: 'Karthik Varma', phone: '+91 98450 99881', vehicleType: 'EV_BIKE', vehicleRegistration: 'KA-01-EV-2024', centreCode: 'BLR-IND-01', lat: 12.9789, lng: 77.6415, rating: 4.9, deliveries: 432 },
    { name: 'Suresh Kumar', phone: '+91 98450 99882', vehicleType: 'SCOOTER', vehicleRegistration: 'KA-05-MH-8812', centreCode: 'BLR-KOR-02', lat: 12.9360, lng: 77.6250, rating: 4.8, deliveries: 310 },
    { name: 'Amit Patil', phone: '+91 98200 99883', vehicleType: 'EV_BIKE', vehicleRegistration: 'MH-02-EV-7721', centreCode: 'BOM-AND-01', lat: 19.1370, lng: 77.8285, rating: 4.9, deliveries: 520 },
    { name: 'Deepak Verma', phone: '+91 98110 99884', vehicleType: 'MOTORCYCLE', vehicleRegistration: 'HR-26-DJ-9011', centreCode: 'DEL-GUR-01', lat: 28.4915, lng: 77.0910, rating: 4.7, deliveries: 280 },
  ];

  for (const d of driversData) {
    const centre = centreMap[d.centreCode];
    await prisma.deliveryPartner.upsert({
      where: { phone: d.phone },
      update: {
        name: d.name,
        vehicleType: d.vehicleType,
        vehicleRegistration: d.vehicleRegistration,
        currentLatitude: d.lat,
        currentLongitude: d.lng,
        lastLocationUpdate: new Date(),
        fulfilmentCentreId: centre ? centre.id : null,
      },
      create: {
        name: d.name,
        phone: d.phone,
        vehicleType: d.vehicleType,
        vehicleRegistration: d.vehicleRegistration,
        status: 'AVAILABLE',
        currentLatitude: d.lat,
        currentLongitude: d.lng,
        lastLocationUpdate: new Date(),
        fulfilmentCentreId: centre ? centre.id : null,
        rating: d.rating,
        totalDeliveries: d.deliveries,
      },
    });
  }
  console.log(`✅ Upserted ${driversData.length} Delivery Partners.`);

  // 8. Courier Providers
  const courierProviders = [
    { code: 'SHIPROCKET', name: 'Shiprocket Multi-Carrier Surface', isConfigured: true },
    { code: 'DELHIVERY', name: 'Delhivery Surface & Express Air', isConfigured: true },
    { code: 'BLUEDART', name: 'Blue Dart Aviation', isConfigured: false },
  ];

  for (const cp of courierProviders) {
    await prisma.courierProvider.upsert({
      where: { code: cp.code },
      update: cp,
      create: cp,
    });
  }

  // 9. Multi-Supplier Price Engine: Additional Suppliers
  const extraSuppliers = [
    { name: 'Metro Cash & Carry India', company: 'Metro India Retail Pvt Ltd', email: 'b2b@metro.co.in', phone: '+91 80 4000 7000', address: 'Yeshwanthpur Industrial Area, Bengaluru', leadTimeDays: 1 },
    { name: 'Bangalore Wholesale FMCG Mart', company: 'Bangalore FMCG Wholesalers Ltd', email: 'orders@blrwholesale.in', phone: '+91 80 2222 3333', address: 'APMC Yard, Yeshwanthpur, Bengaluru', leadTimeDays: 2 },
    { name: 'Reliance Consumer Direct', company: 'Reliance Retail Wholesale', email: 'wholesale@ril.com', phone: '+91 22 3555 3000', address: 'RIL Complex, Ghansoli, Navi Mumbai', leadTimeDays: 1 },
  ];

  const supplierMap = {};
  for (const s of extraSuppliers) {
    const sup = await prisma.supplier.upsert({
      where: { email: s.email },
      update: s,
      create: s,
    });
    supplierMap[s.company] = sup;
  }
  // Also get the original supplier
  const freshFarm = await prisma.supplier.findFirst({ where: { name: { contains: 'FreshFarm' } } });
  if (freshFarm) supplierMap['FreshFarm'] = freshFarm;

  // 10. Update existing products with Department & Brand links
  const attaRiceDal = deptMap['atta-rice-dal'];
  const dairyDept = deptMap['dairy-bread-eggs'];
  const fruitsDept = deptMap['fruits-vegetables'];
  const snacksDept = deptMap['snacks-munchies'];
  const householdDept = deptMap['cleaning-essentials'];

  // Link existing products to department and brand
  const existingUpdates = [
    { slug: 'aashirvaad-shudh-chakki-atta', deptId: attaRiceDal?.id, brandId: brandMap['aashirvaad']?.id },
    { slug: 'amul-taaza-toned-milk', deptId: dairyDept?.id, brandId: brandMap['amul']?.id },
    { slug: 'tata-sampann-unpolished-toor-dal', deptId: attaRiceDal?.id, brandId: brandMap['tata-sampann']?.id },
    { slug: 'fortune-sunlite-sunflower-oil', deptId: attaRiceDal?.id, brandId: brandMap['fortune']?.id },
    { slug: 'haldirams-nagpur-bhujia-sev', deptId: snacksDept?.id, brandId: brandMap['haldirams']?.id },
    { slug: 'surf-excel-matic-liquid-detergent', deptId: householdDept?.id, brandId: brandMap['surf-excel']?.id },
    { slug: 'dettol-liquid-handwash', deptId: householdDept?.id, brandId: brandMap['dettol']?.id },
    { slug: 'ratnagiri-alphonso-mangoes', deptId: fruitsDept?.id, brandId: brandMap['grovia-organic']?.id },
  ];

  for (const up of existingUpdates) {
    if (up.deptId) {
      await prisma.product.updateMany({
        where: { slug: up.slug },
        data: { departmentId: up.deptId, brandId: up.brandId },
      });
    }
  }

  // 11. Create Product Variants & Supplier Offers for Price Comparison
  // Product 1: Aashirvaad Atta
  const aashirvaad = await prisma.product.findUnique({ where: { slug: 'aashirvaad-shudh-chakki-atta' } });
  if (aashirvaad) {
    // Variants: 1kg, 5kg, 10kg
    const v1kg = await prisma.productVariant.upsert({
      where: { sku: 'AASH-SHAR-1KG' },
      update: {},
      create: {
        productId: aashirvaad.id,
        title: '1 kg Pouch',
        sku: 'AASH-SHAR-1KG',
        price: 68.0,
        mrp: 75.0,
        weight: 1.0,
        unit: '1 kg',
        stock: 120,
        isDefault: false,
      },
    });

    const v5kg = await prisma.productVariant.upsert({
      where: { sku: 'AASH-SHAR-5KG' },
      update: {},
      create: {
        productId: aashirvaad.id,
        title: '5 kg Bag',
        sku: 'AASH-SHAR-5KG',
        price: 310.0,
        mrp: 345.0,
        weight: 5.0,
        unit: '5 kg',
        stock: 85,
        isDefault: true,
      },
    });

    const v10kg = await prisma.productVariant.upsert({
      where: { sku: 'AASH-SHAR-10KG' },
      update: {},
      create: {
        productId: aashirvaad.id,
        title: '10 kg Family Pack',
        sku: 'AASH-SHAR-10KG',
        price: 595.0,
        mrp: 670.0,
        weight: 10.0,
        unit: '10 kg',
        stock: 50,
        isDefault: false,
      },
    });

    // Supplier Offers for Aashirvaad 5kg: Compare 3 suppliers
    const metro = supplierMap['Metro India Retail Pvt Ltd'];
    const blrWholesale = supplierMap['Bangalore FMCG Wholesalers Ltd'];
    const reliance = supplierMap['Reliance Retail Wholesale'];

    if (metro && blrWholesale && reliance) {
      await prisma.supplierOffer.deleteMany({ where: { productId: aashirvaad.id } });
      await prisma.supplierOffer.createMany({
        data: [
          {
            productId: aashirvaad.id,
            variantId: v5kg.id,
            supplierId: blrWholesale.id,
            supplierPrice: 285.0,
            procurementCost: 285.0,
            sellingPrice: 310.0,
            mrp: 345.0,
            stockAvailable: 200,
            leadTimeHours: 24,
            isCheapest: true, // Lowest Offer!
          },
          {
            productId: aashirvaad.id,
            variantId: v5kg.id,
            supplierId: metro.id,
            supplierPrice: 292.0,
            procurementCost: 292.0,
            sellingPrice: 318.0,
            mrp: 345.0,
            stockAvailable: 150,
            leadTimeHours: 12,
            isCheapest: false,
          },
          {
            productId: aashirvaad.id,
            variantId: v5kg.id,
            supplierId: reliance.id,
            supplierPrice: 298.0,
            procurementCost: 298.0,
            sellingPrice: 325.0,
            mrp: 345.0,
            stockAvailable: 400,
            leadTimeHours: 6,
            isCheapest: false,
          },
        ],
      });
    }

    // Allocate stock across dark stores
    const blrCentre = centreMap['BLR-IND-01'];
    const bomCentre = centreMap['BOM-AND-01'];
    if (blrCentre && bomCentre) {
      await prisma.fulfilmentCentreProduct.upsert({
        where: { fulfilmentCentreId_productId: { fulfilmentCentreId: blrCentre.id, productId: aashirvaad.id } },
        update: { stock: 120 },
        create: { fulfilmentCentreId: blrCentre.id, productId: aashirvaad.id, stock: 120, bayLocation: 'Aisle-A-3' },
      });
      await prisma.fulfilmentCentreProduct.upsert({
        where: { fulfilmentCentreId_productId: { fulfilmentCentreId: bomCentre.id, productId: aashirvaad.id } },
        update: { stock: 85 },
        create: { fulfilmentCentreId: bomCentre.id, productId: aashirvaad.id, stock: 85, bayLocation: 'Aisle-B-1' },
      });
    }
  }

  // Product 2: Amul Milk
  const amulMilk = await prisma.product.findUnique({ where: { slug: 'amul-taaza-toned-milk' } });
  if (amulMilk) {
    const v500ml = await prisma.productVariant.upsert({
      where: { sku: 'AMUL-TZ-500ML' },
      update: {},
      create: {
        productId: amulMilk.id,
        title: '500 ml Pouch',
        sku: 'AMUL-TZ-500ML',
        price: 27.0,
        mrp: 27.0,
        weight: 0.5,
        unit: '500 ml',
        stock: 200,
        isDefault: false,
      },
    });

    const v1L = await prisma.productVariant.upsert({
      where: { sku: 'AMUL-TZ-1L' },
      update: {},
      create: {
        productId: amulMilk.id,
        title: '1 Litre Tetra Pak',
        sku: 'AMUL-TZ-1L',
        price: 74.0,
        mrp: 78.0,
        weight: 1.0,
        unit: '1 Litre',
        stock: 150,
        isDefault: true,
      },
    });

    // Metro vs FreshFarm offers
    const metro = supplierMap['Metro India Retail Pvt Ltd'];
    const freshFarm = supplierMap['FreshFarm'];
    if (metro && freshFarm) {
      await prisma.supplierOffer.deleteMany({ where: { productId: amulMilk.id } });
      await prisma.supplierOffer.createMany({
        data: [
          {
            productId: amulMilk.id,
            variantId: v1L.id,
            supplierId: freshFarm.id,
            supplierPrice: 66.0,
            procurementCost: 66.0,
            sellingPrice: 74.0,
            mrp: 78.0,
            stockAvailable: 200,
            leadTimeHours: 6,
            isCheapest: true,
          },
          {
            productId: amulMilk.id,
            variantId: v1L.id,
            supplierId: metro.id,
            supplierPrice: 68.5,
            procurementCost: 68.5,
            sellingPrice: 76.0,
            mrp: 78.0,
            stockAvailable: 150,
            leadTimeHours: 12,
            isCheapest: false,
          },
        ],
      });
    }

    const blrCentre = centreMap['BLR-IND-01'];
    if (blrCentre) {
      await prisma.fulfilmentCentreProduct.upsert({
        where: { fulfilmentCentreId_productId: { fulfilmentCentreId: blrCentre.id, productId: amulMilk.id } },
        update: { stock: 180 },
        create: { fulfilmentCentreId: blrCentre.id, productId: amulMilk.id, stock: 180, bayLocation: 'Chiller-C-02' },
      });
    }
  }

  // Product 3: Tata Sampann Toor Dal
  const toorDal = await prisma.product.findUnique({ where: { slug: 'tata-sampann-unpolished-toor-dal' } });
  if (toorDal) {
    await prisma.productVariant.upsert({
      where: { sku: 'TATA-TDAL-500G' },
      update: {},
      create: {
        productId: toorDal.id,
        title: '500 g Pack',
        sku: 'TATA-TDAL-500G',
        price: 92.0,
        mrp: 105.0,
        weight: 0.5,
        unit: '500 g',
        stock: 90,
        isDefault: false,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: 'TATA-TDAL-1KG' },
      update: {},
      create: {
        productId: toorDal.id,
        title: '1 kg Pack',
        sku: 'TATA-TDAL-1KG',
        price: 175.0,
        mrp: 198.0,
        weight: 1.0,
        unit: '1 kg',
        stock: 120,
        isDefault: true,
      },
    });
  }

  // Product 4: Haldiram's Bhujia
  const bhujia = await prisma.product.findUnique({ where: { slug: 'haldirams-nagpur-bhujia-sev' } });
  if (bhujia) {
    await prisma.productVariant.upsert({
      where: { sku: 'HALD-BHUJ-200G' },
      update: {},
      create: {
        productId: bhujia.id,
        title: '200 g Pouch',
        sku: 'HALD-BHUJ-200G',
        price: 52.0,
        mrp: 58.0,
        weight: 0.2,
        unit: '200 g',
        stock: 140,
        isDefault: false,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: 'HALD-BHUJ-400G' },
      update: {},
      create: {
        productId: bhujia.id,
        title: '400 g Saver Pack',
        sku: 'HALD-BHUJ-400G',
        price: 98.0,
        mrp: 115.0,
        weight: 0.4,
        unit: '400 g',
        stock: 95,
        isDefault: true,
      },
    });
  }

  // Product 5: Surf Excel
  const surf = await prisma.product.findUnique({ where: { slug: 'surf-excel-matic-liquid-detergent' } });
  if (surf) {
    await prisma.productVariant.upsert({
      where: { sku: 'SURF-EW-1KG' },
      update: {},
      create: {
        productId: surf.id,
        title: '1 kg Pack',
        sku: 'SURF-EW-1KG',
        price: 145.0,
        mrp: 160.0,
        weight: 1.0,
        unit: '1 kg',
        stock: 80,
        isDefault: false,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: 'SURF-EW-3KG' },
      update: {},
      create: {
        productId: surf.id,
        title: '3 kg Value Bucket',
        sku: 'SURF-EW-3KG',
        price: 415.0,
        mrp: 470.0,
        weight: 3.0,
        unit: '3 kg',
        stock: 60,
        isDefault: true,
      },
    });
  }

  console.log('🎉 GROVIA India-Wide Marketplace Seeding completed successfully!');
}

seedMarketplace()
  .catch((e) => {
    console.error('❌ Error during marketplace seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
