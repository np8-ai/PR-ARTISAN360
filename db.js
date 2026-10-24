const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'artisans360_database.json');

const INITIAL_ARTISAN_PROFILES = [
  {
    artisanId: 'artisan-geetaben',
    name: 'Geetaben Khatri',
    craftSpecialty: 'Pure Gaji Silk Bandhani & Natural Resist Dyeing',
    villageCluster: 'Khatri Bandhani Weavers, Bardoli Cluster (6.5 km)',
    phone: '+91 98253 11223',
    workshopStatus: 'OPEN',
    totalDirectEarnings: 8450,
    inquiriesReceived: 12,
    activeCraftsCount: 2
  },
  {
    artisanId: 'artisan-kanubhai',
    name: 'Kanubhai Prajapati',
    craftSpecialty: 'Natural Terracotta Clay Pottery & Water Cooling Vessels',
    villageCluster: 'Ten Village Potter Cluster (4.5 km)',
    phone: '+91 98251 44556',
    workshopStatus: 'OPEN',
    totalDirectEarnings: 5800,
    inquiriesReceived: 8,
    activeCraftsCount: 1
  },
  {
    artisanId: 'artisan-jiviben',
    name: 'Jiviben Rabari',
    craftSpecialty: 'Traditional Needlework & Abhala Mirror-Work Torans',
    villageCluster: 'Rabari Mirror-Work Colony (8.0 km)',
    phone: '+91 98258 77889',
    workshopStatus: 'OPEN',
    totalDirectEarnings: 7440,
    inquiriesReceived: 15,
    activeCraftsCount: 1
  },
  {
    artisanId: 'artisan-deviben',
    name: 'Deviben Vankar',
    craftSpecialty: 'Pit-Loom Organic Handloom Cotton Sarees',
    villageCluster: 'Kutch Handloom Guild (14.0 km)',
    phone: '+91 98259 99001',
    workshopStatus: 'OPEN',
    totalDirectEarnings: 11600,
    inquiriesReceived: 19,
    activeCraftsCount: 1
  },
  {
    artisanId: 'artisan-rameshbhai',
    name: 'Rameshbhai Suthar',
    craftSpecialty: 'Turned Teakwood & Natural Lacquer Dandiya Sticks',
    villageCluster: 'Sankheda Lacquer Woodcraft (18.0 km)',
    phone: '+91 98252 33445',
    workshopStatus: 'OPEN',
    totalDirectEarnings: 6120,
    inquiriesReceived: 11,
    activeCraftsCount: 1
  },
  {
    artisanId: 'artisan-husain',
    name: 'Husain Luhar',
    craftSpecialty: 'Hand-Beaten Rustic Copper Wind Bells & Chimes',
    villageCluster: 'Nirona Copper Bell Smith (11.5 km)',
    phone: '+91 98255 66778',
    workshopStatus: 'OPEN',
    totalDirectEarnings: 4800,
    inquiriesReceived: 6,
    activeCraftsCount: 1
  }
];

const INITIAL_CRAFTS = [
  {
    id: 'prod-1',
    title: 'Pure Gaji Silk Bandhani Dupatta (Natural Madder & Indigo Tie-Dye)',
    category: 'Bandhani & Silk',
    price: 850,
    rating: 4.9,
    reviewsCount: 48,
    distanceKm: 6.5,
    location: 'Khatri Bandhani Weavers (6.5 km)',
    sellerName: 'Geetaben Khatri (Master Bandhani Artisan)',
    artisanId: 'artisan-geetaben',
    description: '100% pure lustrous silk handcrafted using traditional Khatri finger-tying technique (over 5,000 micro bindis). Naturally dyed in rich crimson and saffron tones.',
    imageUrl: 'images/bandhani.jpg',
    fallbackEmoji: '🧣',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true,
    heritageDetails: {
      rawMaterials: '100% Pure Gaji Silk, Natural Madder Root, Fermented Indigo',
      craftTechnique: 'Traditional Khatri Resist Finger-Tying (5000+ bindis)',
      middlemanCommission: '0% (Direct Artisan Purchase)'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Handcrafted Terracotta Clay Water Jug & Tumbler Set (Ten Village Pottery)',
    category: 'Pottery',
    price: 290,
    rating: 4.8,
    reviewsCount: 34,
    distanceKm: 4.5,
    location: 'Ten Village Potter Cluster (4.5 km)',
    sellerName: 'Kanubhai Prajapati (Master Potter)',
    artisanId: 'artisan-kanubhai',
    description: 'Eco-friendly natural clay pottery hand-thrown on potters wheel and wood-kiln fired for natural alkaline water cooling. Zero chemical glaze, 100% healthy living clay.',
    imageUrl: 'images/pottery.jpg',
    fallbackEmoji: '🏺',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true,
    heritageDetails: {
      rawMaterials: 'Living Riverbed Clay, Wood Ash, Organic Husk',
      craftTechnique: 'Manual Potters Wheel, Open Wood-Fired Kiln',
      middlemanCommission: '0% (Direct Artisan Purchase)'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Traditional Embroidered Peacock Mirror-Work Wall Hanging (Abhala Toran)',
    category: 'Wall Hanging',
    price: 620,
    rating: 4.9,
    reviewsCount: 62,
    distanceKm: 8.0,
    location: 'Rabari Mirror-Work Colony (8.0 km)',
    sellerName: 'Jiviben Rabari (Embroidery Artisan)',
    artisanId: 'artisan-jiviben',
    description: 'Authentic Rabari community needlework wall art with authentic glass mirrors, silk thread tassels, and protective peacock motifs.',
    imageUrl: 'images/wallhanging.jpg',
    fallbackEmoji: '🪞',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true,
    heritageDetails: {
      rawMaterials: 'Authentic Glass Mirrors (Abhala), Pure Cotton Base, Silk Threads',
      craftTechnique: 'Rabari Freehand Needle Embroidery & Tassel Weaving',
      middlemanCommission: '0% (Direct Artisan Purchase)'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'Authentic Gujarat Handloom Saree with Heritage Mirror Work & Border',
    category: 'Kutch Handloom',
    price: 1450,
    rating: 5.0,
    reviewsCount: 78,
    distanceKm: 14.0,
    location: 'Kutch Handloom Guild (14.0 km)',
    sellerName: 'Deviben Vankar (Master Weaver)',
    artisanId: 'artisan-deviben',
    description: 'Pure breathable organic handloom cotton saree woven on traditional pit looms featuring authentic Abhala mirror-work and tribal borders.',
    imageUrl: 'images/saree.jpg',
    fallbackEmoji: '🥻',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true,
    heritageDetails: {
      rawMaterials: 'Organic Kala Cotton, Natural Plant Dyes, Glass Mirrors',
      craftTechnique: 'Wooden Pit Loom Weaving & Extra Weft Embroidery',
      middlemanCommission: '0% (Direct Artisan Purchase)'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    title: 'Handcrafted Hand-Painted Sankheda Lacquered Wooden Dandiya Sticks (Pair)',
    category: 'Sankheda Woodcraft',
    price: 340,
    rating: 4.8,
    reviewsCount: 92,
    distanceKm: 18.0,
    location: 'Sankheda Lacquer Woodcraft (18.0 km)',
    sellerName: 'Rameshbhai Suthar (Wood Artisan)',
    artisanId: 'artisan-rameshbhai',
    description: 'Turned teakwood sticks hand-lacquered with natural organic tree resin and tin-foil floral motifs for festive Garba and cultural dance.',
    imageUrl: 'images/dandiya.jpg',
    fallbackEmoji: '🥢',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true,
    heritageDetails: {
      rawMaterials: 'Seasoned Teakwood, Natural Organic Lacquer Resin, Gold/Silver Pigment',
      craftTechnique: 'Hand Lathe Turning & Agate Stone Buff Polishing',
      middlemanCommission: '0% (Direct Artisan Purchase)'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    title: 'Hand-Tuned Rustic Kutch Copper Wind Bells with Wooden Elephants (Nirona Craft)',
    category: 'Copper Bells',
    price: 480,
    rating: 4.9,
    reviewsCount: 51,
    distanceKm: 11.5,
    location: 'Nirona Copper Bell Smith (11.5 km)',
    sellerName: 'Husain Luhar (Copper Bell Smith)',
    artisanId: 'artisan-husain',
    description: 'Waste metal and copper-coated musical bells tuned by ear by master Luhar smiths, paired with hand-carved wooden elephant wind chimes.',
    imageUrl: 'images/copperbells.jpg',
    fallbackEmoji: '🔔',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true,
    heritageDetails: {
      rawMaterials: 'Recycled Scrap Iron, Copper Powder, Seasoned Wood Clapper',
      craftTechnique: 'Cold Hammer Forging (Zero Welding), Ear-Tuned Chime',
      middlemanCommission: '0% (Direct Artisan Purchase)'
    },
    createdAt: new Date().toISOString()
  }
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        meta: {
          databaseName: 'Artisans360_Bardoli_DB',
          version: '2.0.0',
          clusterRadiusKm: 25,
          created: new Date().toISOString()
        },
        craft_catalog: INITIAL_CRAFTS,
        artisan_profiles: INITIAL_ARTISAN_PROFILES,
        orders_and_deliveries: [],
        inquiry_messages: {},
        negotiations: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('✅ Artisans360 Database initialized at:', DB_FILE);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading database:', e);
      return { craft_catalog: INITIAL_CRAFTS, artisan_profiles: INITIAL_ARTISAN_PROFILES, orders_and_deliveries: [], inquiry_messages: {} };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error writing database:', e);
      return false;
    }
  }

  // --- Crafts / Products ---
  getProducts() {
    const db = this.read();
    return db.craft_catalog || [];
  }

  saveProduct(product) {
    const db = this.read();
    if (!db.craft_catalog) db.craft_catalog = [];

    const idx = db.craft_catalog.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      db.craft_catalog[idx] = { ...db.craft_catalog[idx], ...product, updatedAt: new Date().toISOString() };
    } else {
      product.id = product.id || 'prod-' + Date.now();
      product.createdAt = new Date().toISOString();
      db.craft_catalog.unshift(product);
    }
    this.write(db);
    return product;
  }

  deleteProduct(id) {
    const db = this.read();
    if (!db.craft_catalog) return false;
    const len = db.craft_catalog.length;
    db.craft_catalog = db.craft_catalog.filter(p => p.id !== id);
    this.write(db);
    return db.craft_catalog.length < len;
  }

  // --- Orders ---
  getOrders() {
    const db = this.read();
    return db.orders_and_deliveries || [];
  }

  createOrder(order) {
    const db = this.read();
    if (!db.orders_and_deliveries) db.orders_and_deliveries = [];

    order.orderId = order.orderId || 'OD' + Math.floor(1000000000 + Math.random() * 9000000000);
    order.timestamp = new Date().toISOString();
    order.otp = order.otp || String(Math.floor(1000 + Math.random() * 9000));
    order.deliveryPartner = 'Ramesh Patel (Verified Campus Delivery Boy - GJ-19-BK-4022)';
    order.deliveryStatus = 'Dispatched via Delivery Partner (OTP Pending)';

    db.orders_and_deliveries.unshift(order);
    this.write(db);
    return order;
  }

  // --- Artisan Profiles ---
  getArtisanProfiles() {
    const db = this.read();
    return db.artisan_profiles || [];
  }

  updateArtisanShopStatus(artisanId, status) {
    const db = this.read();
    const artisan = (db.artisan_profiles || []).find(a => a.artisanId === artisanId);
    if (artisan) {
      artisan.workshopStatus = status;
      this.write(db);
      return artisan;
    }
    return null;
  }

  // --- Messages ---
  getMessages(threadId) {
    const db = this.read();
    if (!db.inquiry_messages) db.inquiry_messages = {};
    return db.inquiry_messages[threadId] || [];
  }

  saveMessage(threadId, msg) {
    const db = this.read();
    if (!db.inquiry_messages) db.inquiry_messages = {};
    if (!db.inquiry_messages[threadId]) db.inquiry_messages[threadId] = [];

    msg.id = 'msg-' + Date.now();
    msg.timestamp = new Date().toISOString();
    db.inquiry_messages[threadId].push(msg);

    this.write(db);
    return msg;
  }

  // --- Stats & Dump ---
  getStats() {
    const db = this.read();
    return {
      status: 'online',
      dbEngine: 'Artisans360 JSON & Document Database Engine',
      storageFile: 'data/artisans360_database.json',
      totalCrafts: (db.craft_catalog || []).length,
      totalOrders: (db.orders_and_deliveries || []).length,
      totalArtisans: (db.artisan_profiles || []).length,
      totalInquiryThreads: Object.keys(db.inquiry_messages || {}).length,
      clusterRadiusKm: 25
    };
  }

  getFullDump() {
    return this.read();
  }
}

module.exports = new Database();
