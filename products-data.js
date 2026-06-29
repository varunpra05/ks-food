/* ============================================================
   KUMAR SNACKS — Shared Product Database (products-data.js)
   All pages load this file first. Data stored in localStorage.
   ============================================================ */

(function () {
  'use strict';

  /* ── Default catalog ── */
  const DEFAULT_PRODUCTS = [
    {
      id: 1,
      name: 'Classic Veg Burger',
      category: 'burger',
      emoji: '🍔',
      price: 79,
      originalPrice: 99,
      discount: 20,
      rating: 4.6,
      reviews: 128,
      isVeg: true,
      isBestseller: true,
      deliveryTime: '15-20 mins',
      calories: 386,
      description: 'A delicious combination of crispy veg patty, fresh lettuce, onion, tomato and our special mayo sauce. Our Classic Veg Burger is a perfect blend of taste and freshness. Crispy veg patty made with premium vegetables, topped with crisp lettuce, juicy tomatoes, onions and our signature sauces.',
      ingredients: [
        '🌾 Whole wheat sesame bun',
        '🥦 Mixed vegetable patty (potato, peas, carrot)',
        '🥬 Fresh iceberg lettuce',
        '🍅 Sliced tomatoes',
        '🧅 Onion rings',
        '🧄 Special garlic mayo sauce',
        '🧀 Cheddar cheese (optional)'
      ],
      nutrition: { calories: 386, fat: '14g', carbs: '52g', protein: '10g', sodium: '620mg', fibre: '4g' },
      sizes: { Regular: 79, Large: 119, 'Extra Large': 159 },
      tags: ['100% Veg', 'No Preservatives', 'Freshly Made'],
      addons: [
        { name: 'Cheese Slice', price: 20, emoji: '🧀' },
        { name: 'French Fries', price: 49, emoji: '🍟' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Garlic Bread', price: 49, emoji: '🥖' }
      ],
      combo: { name: 'Burger + Fries + Drink', price: 119, originalPrice: 153 },
      bestEnjoyedWith: 'Fries & Cold Drink',
      packaging: 'Safe & Hygienic',
      gallery: ['🍔', '🥗', '🍅', '🧅', '🍟'],
      customerReviews: [
        { name: 'Ravi Patel', avatar: 'R', color: 'orange', rating: 5, date: '2 days ago', text: 'Super tasty burger! The patty was crispy and fresh. Perfect packing and on-time delivery.' },
        { name: 'Meera Shah', avatar: 'M', color: 'pink', rating: 5, date: '4 days ago', text: "Really loved the taste. One of the best veg burgers I've had in a long time!" }
      ]
    },
    {
      id: 2,
      name: 'Cheese Burst Pizza',
      category: 'pizza',
      emoji: '🍕',
      price: 245,
      originalPrice: 299,
      discount: 18,
      rating: 4.8,
      reviews: 214,
      isVeg: true,
      isBestseller: true,
      deliveryTime: '20-25 mins',
      calories: 520,
      description: 'Our Cheese Burst Pizza is loaded with three types of cheese, fresh vegetables and our signature tomato sauce on a perfectly baked crust. Every bite oozes melted cheese for the ultimate pizza experience.',
      ingredients: [
        '🌾 Hand-tossed pizza base',
        '🍅 Fresh tomato sauce',
        '🧀 Mozzarella cheese',
        '🧀 Cheddar cheese',
        '🧀 Processed cheese',
        '🌶️ Capsicum & onion',
        '🫒 Black olives'
      ],
      nutrition: { calories: 520, fat: '22g', carbs: '64g', protein: '18g', sodium: '780mg', fibre: '3g' },
      sizes: { Regular: 245, Medium: 345, Large: 445 },
      tags: ['100% Veg', 'Chef Special', 'Fresh Baked'],
      addons: [
        { name: 'Extra Cheese', price: 40, emoji: '🧀' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Garlic Bread', price: 49, emoji: '🥖' },
        { name: 'Dip Sauce', price: 15, emoji: '🫙' }
      ],
      combo: { name: 'Pizza + Drink', price: 299, originalPrice: 349 },
      bestEnjoyedWith: 'Cold Drink & Garlic Bread',
      packaging: 'Safe & Hygienic',
      gallery: ['🍕', '🧀', '🍅', '🌶️', '🫒'],
      customerReviews: [
        { name: 'Amit Shah', avatar: 'A', color: 'green', rating: 5, date: '1 day ago', text: 'The cheese burst is absolutely amazing! So gooey and delicious. Best pizza in town!' },
        { name: 'Priya Patel', avatar: 'P', color: 'purple', rating: 5, date: '3 days ago', text: 'Ordered for a party and everyone loved it. Fresh ingredients and fast delivery!' }
      ]
    },
    {
      id: 3,
      name: 'Jain Dabeli',
      category: 'dabeli',
      emoji: '🌮',
      price: 49,
      originalPrice: 59,
      discount: 17,
      rating: 4.7,
      reviews: 89,
      isVeg: true,
      isBestseller: true,
      deliveryTime: '10-15 mins',
      calories: 210,
      description: 'Traditional Kutchi Dabeli made Jain-style without onion and garlic. Spicy mashed potato filling with pomegranate, sev, and special chutney in a soft pav bun.',
      ingredients: [
        '🥔 Spiced mashed potato filling',
        '🍞 Soft pav bun',
        '🌱 Green chutney',
        '🍫 Tamarind chutney',
        '🫘 Roasted peanuts',
        '🍇 Pomegranate seeds',
        '🌾 Nylon sev'
      ],
      nutrition: { calories: 210, fat: '8g', carbs: '32g', protein: '5g', sodium: '380mg', fibre: '2g' },
      sizes: { Single: 49, Double: 89, Family: 199 },
      tags: ['Jain', '100% Veg', 'No Onion No Garlic'],
      addons: [
        { name: 'Extra Sev', price: 10, emoji: '🌾' },
        { name: 'Masala Chaas', price: 25, emoji: '🥛' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'French Fries', price: 49, emoji: '🍟' }
      ],
      combo: { name: 'Dabeli + Masala Chaas', price: 69, originalPrice: 89 },
      bestEnjoyedWith: 'Masala Chaas or Lemon Soda',
      packaging: 'Safe & Hygienic',
      gallery: ['🌮', '🥔', '🍅', '🫘', '🌾'],
      customerReviews: [
        { name: 'Hina Jain', avatar: 'H', color: 'orange', rating: 5, date: '5 hours ago', text: 'Perfect Jain dabeli! Just like homemade. Will order again and again!' },
        { name: 'Rakesh M', avatar: 'R', color: 'pink', rating: 4, date: '2 days ago', text: 'Great taste and authentic flavor. Loved the balance of sweet and spicy.' }
      ]
    },
    {
      id: 4,
      name: 'Vada Pav',
      category: 'vadapav',
      emoji: '🍞',
      price: 29,
      originalPrice: 35,
      discount: 17,
      rating: 4.5,
      reviews: 312,
      isVeg: true,
      isBestseller: true,
      deliveryTime: '10-15 mins',
      calories: 180,
      description: 'Mumbai\'s favourite street food — crispy batata vada in a soft pav with dry garlic chutney, green chutney, and fried green chilli. An iconic taste of Mumbai streets.',
      ingredients: [
        '🥔 Spiced mashed potato vada',
        '🌾 Besan (gram flour) batter',
        '🍞 Soft pav bun',
        '🧄 Dry garlic chutney',
        '🌱 Green chutney',
        '🌶️ Fried green chilli',
        '🧂 Special masala'
      ],
      nutrition: { calories: 180, fat: '7g', carbs: '26g', protein: '4g', sodium: '290mg', fibre: '1g' },
      sizes: { Single: 29, Double: 55, Plate: 89 },
      tags: ['Mumbai Style', '100% Veg', 'Street Food'],
      addons: [
        { name: 'Extra Chutney', price: 5, emoji: '🫙' },
        { name: 'Masala Chai', price: 20, emoji: '☕' },
        { name: 'French Fries', price: 49, emoji: '🍟' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' }
      ],
      combo: { name: 'Vada Pav + Chai', price: 45, originalPrice: 59 },
      bestEnjoyedWith: 'Masala Chai',
      packaging: 'Safe & Hygienic',
      gallery: ['🍞', '🥔', '🌶️', '🧄', '☕'],
      customerReviews: [
        { name: 'Suresh V', avatar: 'S', color: 'green', rating: 5, date: '3 hours ago', text: 'Exactly like street-side Vada Pav! The garlic chutney is the star. Loved it!' },
        { name: 'Neha B', avatar: 'N', color: 'orange', rating: 5, date: '1 day ago', text: 'Best vada pav I\'ve had outside Mumbai! Very authentic and fast delivery.' }
      ]
    },
    {
      id: 5,
      name: 'Grilled Sandwich',
      category: 'sandwich',
      emoji: '🥪',
      price: 99,
      originalPrice: 120,
      discount: 17,
      rating: 4.7,
      reviews: 167,
      isVeg: true,
      isBestseller: true,
      deliveryTime: '15-20 mins',
      calories: 290,
      description: 'Our Grilled Sandwich is stuffed with fresh vegetables, spiced potato filling, cheese, and our secret green chutney. Perfectly grilled to golden perfection with grill marks.',
      ingredients: [
        '🍞 White/Brown bread slices',
        '🧀 Processed cheese',
        '🥔 Spiced potato filling',
        '🍅 Fresh tomato slices',
        '🥬 Cucumber & lettuce',
        '🌱 Green chutney',
        '🧈 Butter'
      ],
      nutrition: { calories: 290, fat: '11g', carbs: '40g', protein: '9g', sodium: '520mg', fibre: '3g' },
      sizes: { Single: 99, Double: 179, Club: 219 },
      tags: ['Freshly Grilled', '100% Veg', 'Loaded'],
      addons: [
        { name: 'Extra Cheese', price: 30, emoji: '🧀' },
        { name: 'French Fries', price: 49, emoji: '🍟' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Tomato Ketchup', price: 10, emoji: '🫙' }
      ],
      combo: { name: 'Sandwich + Fries + Drink', price: 259, originalPrice: 329 },
      bestEnjoyedWith: 'French Fries & Ketchup',
      packaging: 'Safe & Hygienic',
      gallery: ['🥪', '🧀', '🍅', '🥔', '🌱'],
      customerReviews: [
        { name: 'Kavya R', avatar: 'K', color: 'purple', rating: 5, date: '6 hours ago', text: 'The grilled sandwich is perfectly crispy outside and soft inside. Cheese is perfectly melted!' },
        { name: 'Dev M', avatar: 'D', color: 'green', rating: 4, date: '2 days ago', text: 'Very tasty. The green chutney makes it special. Quick delivery too!' }
      ]
    },
    {
      id: 6,
      name: 'Crispy French Fries',
      category: 'fries',
      emoji: '🍟',
      price: 79,
      originalPrice: 99,
      discount: 20,
      rating: 4.6,
      reviews: 298,
      isVeg: true,
      isBestseller: true,
      deliveryTime: '10-15 mins',
      calories: 340,
      description: 'Golden crispy French Fries seasoned with our signature spice blend. Perfectly fried to achieve that satisfying crunch with a soft, fluffy interior. Served hot with ketchup.',
      ingredients: [
        '🥔 Fresh potatoes',
        '🧂 Sea salt',
        '🌶️ Paprika seasoning',
        '🧄 Garlic powder',
        '🌿 Mixed herbs',
        '🫙 Dipping sauce'
      ],
      nutrition: { calories: 340, fat: '16g', carbs: '44g', protein: '4g', sodium: '450mg', fibre: '3g' },
      sizes: { Small: 79, Medium: 119, Large: 149 },
      tags: ['Crispy', 'Golden', 'Freshly Fried'],
      addons: [
        { name: 'Cheese Dip', price: 30, emoji: '🧀' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Peri Peri Masala', price: 15, emoji: '🌶️' },
        { name: 'Mayonnaise', price: 20, emoji: '🫙' }
      ],
      combo: { name: 'Fries + Drink', price: 99, originalPrice: 129 },
      bestEnjoyedWith: 'Cold Drink & Dipping Sauce',
      packaging: 'Safe & Hygienic',
      gallery: ['🍟', '🥔', '🧂', '🌶️', '🫙'],
      customerReviews: [
        { name: 'Ankit T', avatar: 'A', color: 'orange', rating: 5, date: '1 day ago', text: 'Super crispy even after 20 mins! The seasoning is perfect. My go-to snack!' },
        { name: 'Simran K', avatar: 'S', color: 'pink', rating: 5, date: '3 days ago', text: 'Best fries I\'ve had from a delivery app. Always arrives hot and crispy!' }
      ]
    },
    {
      id: 7,
      name: 'Aloo Tikki Burger',
      category: 'burger',
      emoji: '🍔',
      price: 69,
      originalPrice: 89,
      discount: 22,
      rating: 4.4,
      reviews: 95,
      isVeg: true,
      isBestseller: false,
      deliveryTime: '15-20 mins',
      calories: 320,
      description: 'Crispy Aloo Tikki patty in a soft bun with fresh vegetables, mint chutney and our special sauce. A classic Indian twist on the burger, loved by all age groups.',
      ingredients: [
        '🥔 Spiced aloo tikki patty',
        '🍞 Sesame bun',
        '🥬 Lettuce',
        '🍅 Tomato',
        '🧅 Onion',
        '🌱 Mint chutney',
        '🫙 Special sauce'
      ],
      nutrition: { calories: 320, fat: '12g', carbs: '48g', protein: '7g', sodium: '490mg', fibre: '3g' },
      sizes: { Regular: 69, Large: 99, Extra: 129 },
      tags: ['Indian Style', '100% Veg', 'Crispy'],
      addons: [
        { name: 'Cheese Slice', price: 20, emoji: '🧀' },
        { name: 'French Fries', price: 49, emoji: '🍟' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Garlic Bread', price: 49, emoji: '🥖' }
      ],
      combo: { name: 'Burger + Fries + Drink', price: 159, originalPrice: 199 },
      bestEnjoyedWith: 'Mint Chutney & Fries',
      packaging: 'Safe & Hygienic',
      gallery: ['🍔', '🥔', '🌱', '🍅', '🧅'],
      customerReviews: [
        { name: 'Raj K', avatar: 'R', color: 'green', rating: 4, date: '2 days ago', text: 'Love the Indian touch to the burger! Aloo tikki is crispy and well-spiced.' },
        { name: 'Pooja S', avatar: 'P', color: 'orange', rating: 5, date: '4 days ago', text: 'Great value for money. Kids loved it!' }
      ]
    },
    {
      id: 8,
      name: 'Paneer Burger',
      category: 'burger',
      emoji: '🍔',
      price: 89,
      originalPrice: 119,
      discount: 25,
      rating: 4.6,
      reviews: 143,
      isVeg: true,
      isBestseller: false,
      deliveryTime: '15-20 mins',
      calories: 410,
      description: 'A juicy grilled paneer tikka patty in a soft sesame bun, topped with caramelised onions, fresh lettuce, spicy mayo and cheese. A premium burger experience for paneer lovers.',
      ingredients: [
        '🧀 Paneer tikka patty',
        '🍞 Sesame bun',
        '🧅 Caramelised onions',
        '🥬 Fresh lettuce',
        '🧀 Cheese slice',
        '🌶️ Spicy mayo',
        '🍅 Fresh tomato'
      ],
      nutrition: { calories: 410, fat: '18g', carbs: '46g', protein: '16g', sodium: '560mg', fibre: '2g' },
      sizes: { Regular: 89, Large: 129, Extra: 159 },
      tags: ['Paneer Loaded', '100% Veg', 'Gourmet'],
      addons: [
        { name: 'Extra Paneer', price: 40, emoji: '🧀' },
        { name: 'French Fries', price: 49, emoji: '🍟' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Onion Rings', price: 35, emoji: '🧅' }
      ],
      combo: { name: 'Paneer Burger + Fries + Drink', price: 199, originalPrice: 249 },
      bestEnjoyedWith: 'French Fries & Cold Drink',
      packaging: 'Safe & Hygienic',
      gallery: ['🍔', '🧀', '🧅', '🥬', '🌶️'],
      customerReviews: [
        { name: 'Tina J', avatar: 'T', color: 'purple', rating: 5, date: '1 day ago', text: 'The paneer patty is so well-seasoned! This is now my favourite burger!' },
        { name: 'Mohan L', avatar: 'M', color: 'green', rating: 4, date: '3 days ago', text: 'Great flavour and nice spicy kick. Delivery was fast too!' }
      ]
    },
    {
      id: 9,
      name: 'Garlic Bread',
      category: 'garlicbread',
      emoji: '🥖',
      price: 89,
      originalPrice: 109,
      discount: 18,
      rating: 4.5,
      reviews: 76,
      isVeg: true,
      isBestseller: false,
      deliveryTime: '15-20 mins',
      calories: 260,
      description: 'Freshly baked garlic bread with a generous spread of garlic butter and herbs, topped with mozzarella cheese. Perfectly toasted for a crispy exterior and soft, buttery interior.',
      ingredients: [
        '🥖 Ciabatta / French bread',
        '🧄 Garlic butter spread',
        '🌿 Mixed Italian herbs',
        '🧀 Mozzarella cheese',
        '🧂 Sea salt',
        '🫒 Extra virgin olive oil'
      ],
      nutrition: { calories: 260, fat: '12g', carbs: '30g', protein: '8g', sodium: '420mg', fibre: '1g' },
      sizes: { Regular: 89, Cheesy: 119, Loaded: 149 },
      tags: ['Baked Fresh', 'Cheesy', 'Italian Style'],
      addons: [
        { name: 'Extra Cheese', price: 30, emoji: '🧀' },
        { name: 'Dipping Sauce', price: 15, emoji: '🫙' },
        { name: 'Coke (250ml)', price: 25, emoji: '🥤' },
        { name: 'Jalapeño', price: 20, emoji: '🌶️' }
      ],
      combo: { name: 'Garlic Bread + Drink', price: 109, originalPrice: 139 },
      bestEnjoyedWith: 'Pasta or Cold Drink',
      packaging: 'Safe & Hygienic',
      gallery: ['🥖', '🧄', '🧀', '🌿', '🫒'],
      customerReviews: [
        { name: 'Ishaan P', avatar: 'I', color: 'orange', rating: 5, date: '12 hours ago', text: 'Perfectly garlicky and cheesy! My kids demolish these in seconds.' },
        { name: 'Riya S', avatar: 'R', color: 'pink', rating: 4, date: '5 days ago', text: 'Crunchy on outside, soft inside. A perfect side dish!' }
      ]
    },
    {
      id: 10,
      name: 'Cold Drink (250ml)',
      category: 'drinks',
      emoji: '🥤',
      price: 25,
      originalPrice: 35,
      discount: 28,
      rating: 4.3,
      reviews: 450,
      isVeg: true,
      isBestseller: false,
      deliveryTime: '5-10 mins',
      calories: 105,
      description: 'Chilled cold drink served ice cold in a 250ml bottle. Choose from Coke, Pepsi, Sprite, or Limca. The perfect companion to any Kumar Snacks meal.',
      ingredients: [
        '💧 Purified water',
        '🍬 Sugar',
        '🫧 Carbonated water',
        '🍋 Natural flavours',
        '🧪 Citric acid'
      ],
      nutrition: { calories: 105, fat: '0g', carbs: '26g', protein: '0g', sodium: '40mg', fibre: '0g' },
      sizes: { '250ml': 25, '500ml': 45, '1 Litre': 79 },
      tags: ['Ice Cold', 'Chilled', 'Refreshing'],
      addons: [
        { name: 'Ice Cubes', price: 0, emoji: '🧊' },
        { name: 'Lemon', price: 5, emoji: '🍋' },
        { name: 'French Fries', price: 49, emoji: '🍟' },
        { name: 'Cheese Burst Pizza', price: 245, emoji: '🍕' }
      ],
      combo: { name: 'Any Snack + Drink', price: 99, originalPrice: 129 },
      bestEnjoyedWith: 'Any Snack from Kumar Snacks',
      packaging: 'Safe & Sealed',
      gallery: ['🥤', '🍋', '🫧', '🧊', '💧'],
      customerReviews: [
        { name: 'Arjun M', avatar: 'A', color: 'green', rating: 4, date: '1 day ago', text: 'Always arrives cold! Great value for money.' },
        { name: 'Sara K', avatar: 'S', color: 'orange', rating: 5, date: '2 days ago', text: 'Perfect accompaniment to the burger. Refreshing!' }
      ]
    }
  ];

  /* ── Storage helpers ── */
  const STORAGE_KEY = 'ks_products';

  function loadProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {}
  }

  /* ── Initialise ── */
  let products = loadProducts();
  if (!products || products.length === 0) {
    products = DEFAULT_PRODUCTS;
    saveProducts(products);
  }

  /* ── Public API ── */
  window.KS_DB = {
    getAll()           { return loadProducts() || []; },
    getById(id)        { return (loadProducts() || []).find(p => p.id === parseInt(id, 10)) || null; },
    getByCategory(cat) { return (loadProducts() || []).filter(p => p.category === cat); },
    getBestsellers()   { return (loadProducts() || []).filter(p => p.isBestseller); },
    save(arr)          { saveProducts(arr); },

    add(product) {
      const all = loadProducts() || [];
      let maxId = 0;
      all.forEach(p => {
        const val = parseInt(p.id, 10);
        if (!isNaN(val) && val > maxId) {
          maxId = val;
        }
      });
      product.id = maxId + 1;
      all.push(product);
      saveProducts(all);
      return product;
    },

    update(id, data) {
      const all = loadProducts() || [];
      const idx = all.findIndex(p => p.id === parseInt(id, 10));
      if (idx > -1) { all[idx] = { ...all[idx], ...data }; saveProducts(all); return all[idx]; }
      return null;
    },

    delete(id) {
      const all = loadProducts() || [];
      const filtered = all.filter(p => p.id !== parseInt(id, 10));
      saveProducts(filtered);
    },

    getProductImage(p) {
      if (!p) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
      const name = (p.name || '').toLowerCase();
      
      // Force correct images for the user's specific highlighted products
      if (name.includes('garlic') && name.includes('bread')) {
        return 'assets/garlic_bread_real.jpg';
      }
      if (name.includes('vada') || name.includes('pav') || name.includes('vadapav')) {
        return 'assets/vada_pav_real.jpg';
      }
      if (name.includes('tikki') && name.includes('burger')) {
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';
      }
      
      // Otherwise use uploadedImage if valid
      if (p.uploadedImage && typeof p.uploadedImage === 'string' && p.uploadedImage.trim() !== '') {
        const val = p.uploadedImage.trim();
        if (!val.includes('undefined') && !val.includes('null') && (val.startsWith('http') || val.startsWith('data:') || val.startsWith('/') || val.startsWith('assets/'))) {
          return val;
        }
      }
      
      // General category/name-based fallbacks
      if (name.includes('burger')) {
        if (name.includes('paneer')) return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60';
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';
      }
      if (name.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60';
      if (name.includes('dabeli')) return 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60';
      if (name.includes('sandwich')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60';
      if (name.includes('fries') || name.includes('french')) return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60';
      if (name.includes('drink') || name.includes('coke') || name.includes('pepsi') || name.includes('sprite') || name.includes('beverage')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60';
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
    },

    getFallbackImageByEmojiOrName(em, pName = '') {
      const e = em || '';
      if (e === '🍔') return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';
      if (e === '🍕') return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60';
      if (e === '🌮' || e === '🌯') return 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60';
      if (e === '🍞' || e === '🥐') return 'assets/vada_pav_real.jpg';
      if (e === '🥪') return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60';
      if (e === '🍟') return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60';
      if (e === '🥖') return 'assets/garlic_bread_real.jpg';
      if (e === '🥤' || e === '🥛' || e === '☕') return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60';
      return this.getProductImage({ name: pName || em });
    },

    reset() {
      saveProducts(DEFAULT_PRODUCTS);
    }
  };

})();
