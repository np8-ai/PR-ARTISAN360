
// ==========================================
// DATABASE EXPLORER MODAL & SCHEMA VIEWER
// ==========================================
let currentDbExplorerTab = 'crafts';
let latestDatabaseDump = null;
const USE_BROWSER_ONLY_STORAGE = window.location.protocol === 'file:' || window.location.hostname.endsWith('github.io');

async function openDatabaseModal() {
  const modal = document.getElementById('databaseModal');
  if (modal) modal.classList.remove('hidden');

  if (USE_BROWSER_ONLY_STORAGE) {
    latestDatabaseDump = { craft_catalog: allProducts, orders_and_deliveries: [], artisan_profiles: [] };
    renderDatabaseExplorerContent();
    if (window.lucide) lucide.createIcons();
    return;
  }

  try {
    const res = await fetch('/api/dump');
    if (res.ok) {
      latestDatabaseDump = await res.json();
    } else {
      latestDatabaseDump = { craft_catalog: allProducts, orders_and_deliveries: [], artisan_profiles: [] };
    }
  } catch (e) {
    latestDatabaseDump = { craft_catalog: allProducts, orders_and_deliveries: [], artisan_profiles: [] };
  }

  renderDatabaseExplorerContent();
  if (window.lucide) lucide.createIcons();
}

function closeDatabaseModal() {
  const modal = document.getElementById('databaseModal');
  if (modal) modal.classList.add('hidden');
}

function setDbExplorerTab(tab) {
  currentDbExplorerTab = tab;
  const tabs = ['crafts', 'orders', 'artisans', 'raw'];

  tabs.forEach(t => {
    const btn = document.getElementById(`dbTab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    const view = document.getElementById(`dbView${t.charAt(0).toUpperCase() + t.slice(1)}`);

    if (btn) {
      if (t === tab) {
        btn.className = 'px-3.5 py-1.5 rounded-xl bg-charcoal-900 text-white shadow-sm flex items-center gap-1.5';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-charcoal-700 hover:bg-white transition-all flex items-center gap-1.5';
      }
    }

    if (view) {
      if (t === tab) view.classList.remove('hidden');
      else view.classList.add('hidden');
    }
  });

  renderDatabaseExplorerContent();
}

function renderDatabaseExplorerContent() {
  if (!latestDatabaseDump) return;

  const crafts = latestDatabaseDump.craft_catalog || allProducts || [];
  const orders = latestDatabaseDump.orders_and_deliveries || latestDatabaseDump.orders || [];
  const artisans = latestDatabaseDump.artisan_profiles || [];

  document.getElementById('dbCraftsCountText').innerText = crafts.length;
  document.getElementById('dbOrdersCountText').innerText = orders.length;

  // 1. Render Crafts Table
  const craftsBody = document.getElementById('dbCraftsTableBody');
  if (craftsBody) {
    craftsBody.innerHTML = crafts.map(c => `
      <tr class="hover:bg-alabaster-50 transition-colors">
        <td class="p-2.5 font-mono font-bold text-charcoal-600">${c.id}</td>
        <td class="p-2.5 font-bold text-charcoal-950 flex items-center gap-2">
          <img src="${c.imageUrl || 'images/bandhani.jpg'}" class="w-7 h-7 rounded-lg object-cover border border-alabaster-300" onerror="this.src='images/bandhani.jpg'" />
          <span class="truncate max-w-xs">${c.title}</span>
        </td>
        <td class="p-2.5 text-charcoal-700">${c.category}</td>
        <td class="p-2.5 font-black text-charcoal-950">₹${c.price}</td>
        <td class="p-2.5 text-charcoal-700">${c.sellerName || c.artisanId || 'Artisan'}</td>
        <td class="p-2.5">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${c.status || 'active'}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // 2. Render Orders Table
  const ordersBody = document.getElementById('dbOrdersTableBody');
  if (ordersBody) {
    if (orders.length === 0) {
      ordersBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-charcoal-500 italic">No orders placed yet. Place an order in checkout to see it appear here in real-time!</td></tr>';
    } else {
      ordersBody.innerHTML = orders.map(o => `
        <tr class="hover:bg-alabaster-50 transition-colors">
          <td class="p-2.5 font-mono font-bold text-ochre-700">${o.orderId || 'OD-10293'}</td>
          <td class="p-2.5 font-bold text-charcoal-950">${(o.buyer && o.buyer.name) || o.buyerName || 'Saurang Patel'}</td>
          <td class="p-2.5 text-charcoal-700 truncate max-w-xs">${(o.buyer && o.buyer.location) || o.deliveryAddress || 'UTU Campus'}</td>
          <td class="p-2.5 font-black text-emerald-800">₹${o.total || o.totalAmount || 0}</td>
          <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-ochre-100 text-ochre-900 font-mono font-black">${o.otp || o.deliveryOtp || '4821'}</span></td>
          <td class="p-2.5 text-charcoal-700">${o.deliveryPartner || 'Ramesh Patel (Campus Delivery)'}</td>
          <td class="p-2.5 text-[10px] text-charcoal-500 font-mono">${o.timestamp ? new Date(o.timestamp).toLocaleTimeString() : 'Just now'}</td>
        </tr>
      `).join('');
    }
  }

  // 3. Render Artisan Profiles Table
  const artisansBody = document.getElementById('dbArtisansTableBody');
  if (artisansBody) {
    artisansBody.innerHTML = artisans.map(a => `
      <tr class="hover:bg-alabaster-50 transition-colors">
        <td class="p-2.5 font-bold text-charcoal-950">${a.name}</td>
        <td class="p-2.5 text-charcoal-700">${a.craftSpecialty}</td>
        <td class="p-2.5 text-charcoal-700">${a.villageCluster}</td>
        <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">🟢 ${a.workshopStatus}</span></td>
        <td class="p-2.5 font-black text-charcoal-950">₹${a.totalDirectEarnings.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  }

  // 4. Render Raw JSON
  const rawPre = document.getElementById('dbRawJsonContent');
  if (rawPre) {
    rawPre.innerText = JSON.stringify(latestDatabaseDump, null, 2);
  }
}

function downloadDatabaseDumpJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(latestDatabaseDump || allProducts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "artisans360_database_dump.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}


// ==========================================
// LIVE DATABASE CLIENT & API SYNC
// ==========================================
async function syncDatabaseOnLoad() {
  if (USE_BROWSER_ONLY_STORAGE) return;

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const dbProducts = await res.json();
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        allProducts = dbProducts;
        saveState();
        renderGrid();
      }
    }
  } catch (e) {
    console.log('[DB Sync Notice] Running in offline/local storage fallback mode:', e.message);
  }

  // Update Database status badge in UI
  try {
    const statRes = await fetch('/api/stats');
    if (statRes.ok) {
      const stats = await statRes.json();
      const badge = document.getElementById('dbLiveStatusBadge');
      if (badge) {
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Server database active (${stats.totalCrafts} crafts, ${stats.totalOrders} orders)</span>`;
      }
      const storageDescription = document.getElementById('dbStorageDescription');
      if (storageDescription) {
        storageDescription.textContent = `Server storage: ${stats.storageFile || 'JSON database'} • Crafts, orders, and artisan profiles`;
      }
    }
  } catch (e){}
}

async function persistProductToDB(product) {
  if (USE_BROWSER_ONLY_STORAGE) return;

  try {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
  } catch (e) {
    console.warn('DB persist fallback:', e.message);
  }
}

async function deleteProductFromDB(id) {
  if (USE_BROWSER_ONLY_STORAGE) return;

  try {
    await fetch('/api/products/' + id, { method: 'DELETE' });
  } catch (e) {
    console.warn('DB delete fallback:', e.message);
  }
}

async function persistOrderToDB(order) {
  if (USE_BROWSER_ONLY_STORAGE) return;

  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
  } catch (e) {
    console.warn('DB order persist fallback:', e.message);
  }
}


// ==========================================
// MULTILINGUAL ENGINE (ENGLISH, GUJARATI, HINDI, MARATHI)
// ==========================================
let currentAppLanguage = localStorage.getItem('artisans360_language') || 'en';
let listingVoiceDictationLang = 'en-IN';

const MULTILINGUAL_CRAFTS = {
  'prod-1': {
    en: {
      title: 'Pure Gaji Silk Bandhani Dupatta (Natural Madder & Indigo Tie-Dye)',
      desc: '100% pure lustrous silk handcrafted using traditional Khatri finger-tying technique (over 5,000 micro bindis). Naturally dyed in rich crimson and saffron tones.',
      speech: 'Namaste! I am Geetaben Khatri. This Pure Gaji Silk Bandhani Dupatta is 100% pure silk tie-dye handcrafted with over 5,000 micro bindis using traditional Khatri resist-dyeing and natural madder dyes. Direct from our Bardoli workshop.'
    },
    gu: {
      title: 'શુદ્ધ ગજી સિલ્ક બાંધણી દુપટ્ટો (કુદરતી મજીષ્ઠ અને ગળી રંગકામ)',
      desc: '૧૦૦% શુદ્ધ ચમકદાર સિલ્ક, ૫,૦૦૦ થી વધુ બારીક હાથ બાંધેલી બિંદીઓ અને કુદરતી રંગોથી બનાવેલ પરંપરાગત ખત્રી હસ્તકલા.',
      speech: 'નમસ્તે! હું ગીતાબેન ખત્રી છું. આ પ્યોર ગજી સિલ્ક બાંધણી દુપટ્ટો છે, જેમાં ૫૦૦૦ થી વધુ માઇક્રો બિંદીઓ અને કુદરતી વનસ્પતિ રંગો વપરાયેલા છે. સીધા બારડોલીના કારીગર પાસેથી મેળવો.'
    },
    hi: {
      title: 'शुद्ध गजी सिल्क बांधनी दुपट्टा (प्राकृतिक मजीठ एवं नील रंगाई)',
      desc: '१००% शुद्ध चमकदार सिल्क, ५,००० से अधिक बारीक हाथ से बंधी बिंदियों और प्राकृतिक रंगों से हस्तनिर्मित पारंपरिक खत्री कारीगरी।',
      speech: 'नमस्ते! मैं गीताबेन खत्री हूँ। यह शुद्ध गजी सिल्क बांधनी दुपट्टा है, जो ५००० से अधिक बारीक बिंदियों और प्राकृतिक रंगों से हाथ से बनाया गया है। सीधे हमारे बार्डोली वर्कशॉप से खरीदें।'
    },
    mr: {
      title: 'शुद्ध गजी सिल्क बांधणी दुपट्टा (नैसर्गिक रंगकाम व पारंपरिक कला)',
      desc: '१००% शुद्ध चमकदार सिल्क, ५,००० हून अधिक बारीक हाताने बांधलेल्या टिकल्या आणि नैसर्गिक रंगांनी सजवलेली पारंपरिक कारागिरी.',
      speech: 'नमस्कार! मी गीताबेन खत्री आहे. हा शुद्ध गजी सिल्क बांधणी दुपट्टा आहे, जो ५००० हून अधिक बारीक बिंद्या आणि नैसर्गिक रंगांनी हाताने तयार केला आहे. थेट बार्डोलीच्या कारागिराकडून खरेदी करा.'
    }
  },
  'prod-2': {
    en: {
      title: 'Handcrafted Terracotta Clay Water Jug & Tumbler Set (Ten Village Pottery)',
      desc: 'Eco-friendly natural clay pottery hand-thrown on potters wheel and wood-kiln fired for natural alkaline water cooling. Zero chemical glaze, 100% healthy living clay.',
      speech: 'Namaste! I am Kanubhai Prajapati. This handcrafted terracotta clay water jug and tumbler set is shaped on a potters wheel and wood-fired to naturally cool and purify drinking water.'
    },
    gu: {
      title: 'માટીનો પરંપરાગત વોટર જગ અને ગ્લાસ સેટ (તેન ગામ માટીકામ)',
      desc: 'ચાકડા પર હાથેથી ઘડેલો અને ભઠ્ઠીમાં પકવેલો કુદરતી માટીનો જગ, જે પીવાના પાણીને કુદરતી રીતે ઠંડુ અને આલ્કલાઇન રાખે છે. કોઈ કેમિકલ વગર ૧૦૦% શુદ્ધ માટી.',
      speech: 'નમસ્તે! હું કનુભાઈ પ્રજાપતિ છું. આ હાથેથી બનાવેલો માટીનો વોટર જગ અને ગ્લાસ સેટ છે, જે પાણીને કુદરતી રીતે ઠંડુ અને સ્વાસ્થ્યપ્રદ રાખે છે. તેન ગામના કુંભાર ક્લસ્ટરમાંથી સીધો મેળવો.'
    },
    hi: {
      title: 'हस्तनिर्मित मिट्टी का वाटर जग एवं गिलास सेट (तेन गांव पॉटरी)',
      desc: 'चाक पर हाथ से गढ़ा और भट्टी में पकाया गया प्राकृतिक मिट्टी का जग, जो पानी को प्राकृतिक रूप से ठंडा और गुणकारी रखता है। १००% शुद्ध और रसायन मुक्त।',
      speech: 'नमस्ते! मैं कनुभाई प्रजापति हूँ। यह हस्तनिर्मित मिट्टी का वाटर जग और गिलास सेट है, जो पानी को प्राकृतिक रूप से ठंडा और मीठा रखता है। सीधे तेन गांव के कारीगरों से खरीदें।'
    },
    mr: {
      title: 'हस्तनिर्मित मातीचा पाण्याचा जग व ग्लास संच (तेन गाव पॉटरी)',
      desc: 'चाकावर हाताने घडवलेला आणि भट्टीत भाजलेला नैसर्गिक मातीचा जग, जो पाणी नैसर्गिकरित्या थंड आणि आरोग्यदायी ठेवतो. १००% शुद्ध माती.',
      speech: 'नमस्कार! मी कनुभाई प्रजापती आहे. हा हस्तनिर्मित मातीचा पाण्याचा जग आणि ग्लास सेट आहे, जो पाणी नैसर्गिकरीत्या थंड आणि आरोग्यदायी ठेवतो. थेट कारागिराकडून खरेदी करा.'
    }
  },
  'prod-3': {
    en: {
      title: 'Traditional Embroidered Peacock Mirror-Work Wall Hanging (Abhala Toran)',
      desc: 'Authentic Rabari community needlework wall art with authentic glass mirrors, silk thread tassels, and protective peacock motifs.',
      speech: 'Namaste! I am Jiviben Rabari. This embroidered peacock mirror-work wall hanging is crafted with authentic glass mirrors and vibrant silk embroidery to bring blessings to your home.'
    },
    gu: {
      title: 'પરંપરાગત મોર આભલા ભરતકામ વોલ હેંગિંગ (રબારી તોરણ)',
      desc: 'અસલ રબારી ભરતકામ અને કાચના આભલાથી સુશોભિત હાથવણાટ વોલ પીસ. રંગબેરંગી રેશમી દોરા અને ફમતાં સાથે ઘરની શોભા વધારે છે.',
      speech: 'નમસ્તે! હું જીવીબેન રબારી છું. આ હાથભરતનું મોર આભલા તોરણ છે, જે અસલ કાચના આભલા અને રેશમી દોરાથી ઘરમાં સુખ-સમૃદ્ધિ લાવવા માટે બનાવેલું છે.'
    },
    hi: {
      title: 'पारंपरिक मोर कांच कशीदाकारी वॉल हैंगिंग (रबारी तोरण)',
      desc: 'असली रबारी कशीदाकारी और शीशों से सजा हाथ से बना वॉल आर्ट। रंग-बिरंगे रेशमी धागों और सुंदर लटकनों से घर की सजावट बढ़ाता है।',
      speech: 'नमस्ते! मैं जीवीबेन रबारी हूँ। यह पारंपरिक मोर शीशा-कशीदाकारी वॉल हैंगिंग है, जो असली कांच के आभले और रेशम के धागों से हस्तनिर्मित है।'
    },
    mr: {
      title: 'पारंपरिक मोर आरसा भरतकाम वॉल हँगिंग (तोरण)',
      desc: 'अस्सल रबारी भरतकाम आणि आरशांनी सजवलेली हस्तनिर्मित वॉल आर्ट. रंगीबेरंगी रेशमी धागे आणि सुंदर नक्षीकाम.',
      speech: 'नमस्कार! मी जीवीबेन रबारी आहे. हे भरतकाम केलेले मोर आरसा वॉल हँगिंग आहे, जे घराच्या सुशोभीकरणासाठी अस्सल आरसे आणि रेशमी धाग्यांनी तयार केले आहे.'
    }
  },
  'prod-4': {
    en: {
      title: 'Authentic Gujarat Handloom Saree with Heritage Mirror Work & Border',
      desc: 'Pure breathable organic handloom cotton saree woven on traditional pit looms featuring authentic Abhala mirror-work and tribal borders.',
      speech: 'Namaste! I am Deviben Vankar. This authentic handloom cotton saree is woven on traditional wooden pit looms with organic dyes and handcrafted mirror-work borders.'
    },
    gu: {
      title: 'અસલ કચ્છ હેન્ડલૂમ કોટન સાડી (આભલા વર્ક અને બોર્ડર સાથે)',
      desc: 'પરંપરાગત સાળ પર વણેલી ૧૦૦% ઓર્ગેનિક સુતરાઉ સાડી, જેમાં કચ્છી આભલા વર્ક અને ભવ્ય બોર્ડર ડિઝાઇન કરેલી છે.',
      speech: 'નમસ્તે! હું દેવીબેન વણકર છું. આ અસલ હાથસાળની કોટન સાડી છે, જે કુદરતી વનસ્પતિ રંગો અને કચ્છના પરંપરાગત આભલા વર્કથી વણેલી છે.'
    },
    hi: {
      title: 'असली कच्छ हैंडलूम सूती साड़ी (शीशा काम एवं पारंपरिक बॉर्डर)',
      desc: 'पारंपरिक हथकरघे पर बुनी गई १००% जैविक सूती साड़ी, जिसमें कच्छी शीशा वर्क और सुंदर आदिवासी बॉर्डर शामिल है।',
      speech: 'नमस्ते! मैं देवीबेन बुनकर हूँ। यह असली हथकरघा सूती साड़ी है, जिसे पारंपरिक लकड़ी के करघे पर प्राकृतिक रंगों और शीशा वर्क से बुना गया है।'
    },
    mr: {
      title: 'अस्सल कच्छ हातमाग सुती साडी (आरसा काम व पारंपरिक बॉर्डर)',
      desc: 'पारंपरिक हातमागावर विणलेली १००% नैसर्गिक सुती साडी, ज्यावर कच्छी आरसा काम आणि पारंपरिक नक्षीकाम केलेले आहे.',
      speech: 'नमस्कार! मी देवीबेन विणकर आहे. ही अस्सल हातमाग सुती साडी आहे, जी नैसर्गिक रंग आणि पारंपरिक आरसा कामासह हाताने विणली आहे.'
    }
  },
  'prod-5': {
    en: {
      title: 'Handcrafted Hand-Painted Sankheda Lacquered Wooden Dandiya Sticks (Pair)',
      desc: 'Turned teakwood sticks hand-lacquered with natural organic tree resin and tin-foil floral motifs for festive Garba and cultural dance.',
      speech: 'Namaste! I am Rameshbhai Suthar. These authentic Sankheda dandiya sticks are crafted from seasoned teakwood and lacquered with organic resin for festive Garba dancing.'
    },
    gu: {
      title: 'હાથેથી રંગેલા સંખેડા લાકડાના લાખા દાંડિયા (જોડી)',
      desc: 'સાગના લાકડામાંથી ખરાદી કામ કરીને કુદરતી લાખ અને સોનેરી-રૂપેરી ડિઝાઇનથી રંગેલા પરંપરાગત ગરબા દાંડિયા.',
      speech: 'નમસ્તે! હું રમેશભાઈ સુથાર છું. આ અસલ સંખેડાના લાખવાળા લાકડાના દાંડિયા છે, જે નવરાત્રી ગરબા માટે કુદરતી લાખના રંગોથી હાથે રંગેલા છે.'
    },
    hi: {
      title: 'हस्तनिर्मित संखेड़ा लाख लकड़ी के डांडिया स्टिक्स (जोड़ी)',
      desc: 'सागौन की लकड़ी पर खराद कार्य करके प्राकृतिक लाख और सुंदर फूलों की नक्काशी से रंगे गए पारंपरिक गरबा डांडिया।',
      speech: 'नमस्ते! मैं रमेशभाई सुथार हूँ। ये असली संखेड़ा के हस्तनिर्मित लकड़ी के डांडिया हैं, जो नवरात्रि गरबा के लिए प्राकृतिक रंगों से रंगे गए हैं।'
    },
    mr: {
      title: 'हस्तनिर्मित संखेड़ा लाकडी दांडिया स्टिक्स (जोडी)',
      desc: 'सागवानी लाकडावर हाताने नक्षीकाम करून नैसर्गिक लाखेच्या रंगांनी रंगवलेले पारंपरिक गरबा दांडिया.',
      speech: 'नमस्कार! मी रमेशभाई सुतार आहे. हे अस्सल संखेड़ा लाकडी दांडिया आहेत, जे गरबा आणि सांस्कृतिक नृत्यासाठी हाताने तयार केले आहेत.'
    }
  },
  'prod-6': {
    en: {
      title: 'Hand-Tuned Rustic Kutch Copper Wind Bells with Wooden Elephants (Nirona Craft)',
      desc: 'Waste metal and copper-coated musical bells tuned by ear by master Luhar smiths, paired with hand-carved wooden elephant wind chimes.',
      speech: 'Namaste! I am Husain Luhar. These rustic copper bells from Nirona are hand-beaten from metal scrap, coated in copper, and tuned by ear without any welding.'
    },
    gu: {
      title: 'હાથેથી સૂર મેળવેલા કચ્છ કોપર બેલ્સ અને લાકડાના હાથી (નિરોણા ક્રાફ્ટ)',
      desc: 'કોઈ પણ વેલ્ડીંગ વગર ફક્ત ટીપીને બનાવેલા તાંબાની ઘંટડીઓ અને હાથે કોતરેલા લાકડાના હાથી વાળી વિન્ડ ચાઇમ્સ.',
      speech: 'નમસ્તે! હું હુસૈન લુહાર છું. આ કચ્છના નિરોણા ગામની અસલ તાંબાની ઘંટડીઓ છે, જેને કાનથી સૂર મેળવીને કોઈ પણ વેલ્ડીંગ વગર હાથેથી ટીપીને બનાવી છે.'
    },
    hi: {
      title: 'हाथ से सुर मिलाई गई कच्छ तांबा घंटियां व लकड़ी के हाथी (निरोणा शिल्प)',
      desc: 'बिना किसी वेल्डिंग के हाथ से पीटकर बनाई गई तांबे की घंटियां और हाथ से तराशे गए लकड़ी के हाथियों वाली मधुर विंड चाइम्स।',
      speech: 'नमस्ते! मैं हुसैन लुहार हूँ। ये कच्छ निरोणा की असली तांबे की घंटियां हैं, जिन्हें बिना वेल्डिंग के हाथ से पीटकर कर्णप्रिय सुरों में ढाला गया है।'
    },
    mr: {
      title: 'हस्तनिर्मित कच्छ तांब्याच्या घंटा व लाकडी हत्ती (निरोणा कला)',
      desc: 'कोणत्याही वेल्डिंगशिवाय हाताने ठोकून बनवलेल्या तांब्याच्या घंटा आणि कोरलेल्या लाकडी हत्तींची सुमधुर विंड चाइम्स.',
      speech: 'नमस्कार! मी हुसेन लुहार आहे. या निरोणा कच्छच्या अस्सल तांब्याच्या घंटा आहेत, ज्या हाताने ठोकून कर्णमधुर आवाजात तयार केल्या आहेत.'
    }
  }
};

const UI_TRANSLATIONS = {
  en: {
    welcome: 'Welcome to Artisans360',
    tagline: 'AI-Driven Direct Market Linkage for Bardoli & Rural Crafts',
    buyer: 'Buyer Mode',
    artisan: 'Artisan / Maker',
    cart: 'Cart',
    addToCart: 'Add to Cart',
    buyNow: 'BUY NOW',
    askArtisan: 'Ask Artisan',
    freeDelivery: 'Free Campus Delivery',
    voiceStory: '🎧 Listen to Artisan Voice Story',
    directPrice: 'Direct Artisan Price',
    zeroMiddleman: 'Zero Middleman Cut'
  },
  gu: {
    welcome: 'કારીગર્સ૩૬૦ (Artisans360) માં આપનું સ્વાગત છે',
    tagline: 'બારડોલી અને ગ્રામીણ હસ્તકલા માટે સીધું માર્કેટ લિંકેજ',
    buyer: 'ગ્રાહક (Buyer)',
    artisan: 'કારીગર (Artisan)',
    cart: 'થેલી (Cart)',
    addToCart: 'કાર્ટમાં ઉમેરો',
    buyNow: 'હમણાં ખરીદો',
    askArtisan: 'કારીગરને પૂછો',
    freeDelivery: 'ફ્રી કેમ્પસ ડિલિવરી',
    voiceStory: '🎧 કારીગરની અવાજમાં વાર્તા સાંભળો',
    directPrice: 'સીધી કારીગર કિંમત',
    zeroMiddleman: 'ઝીરો વચેટિયા કમિશન'
  },
  hi: {
    welcome: 'कारीगर्स३६० (Artisans360) में आपका स्वागत है',
    tagline: 'बारडोली और ग्रामीण हस्तशिल्प के लिए सीधा बाज़ार लिंकेज',
    buyer: 'ग्राहक (Buyer)',
    artisan: 'कारीगर (Artisan)',
    cart: 'कार्ट (Cart)',
    addToCart: 'कार्ट में जोड़ें',
    buyNow: 'अभी खरीदें',
    askArtisan: 'कारीगर से पूछें',
    freeDelivery: 'मुफ्त कैंपस डिलीवरी',
    voiceStory: '🎧 कारीगर की आवाज़ में कहानी सुनें',
    directPrice: 'सीधी कारीगर कीमत',
    zeroMiddleman: 'शून्य बिचौलिया कमीशन'
  },
  mr: {
    welcome: 'कारीगर्स३६० (Artisans360) मध्ये आपले स्वागत आहे',
    tagline: 'बारडोली आणि ग्रामीण हस्तकलेसाठी थेट बाजारपेठ लिंकेज',
    buyer: 'ग्राहक (Buyer)',
    artisan: 'कारागीर (Artisan)',
    cart: 'कार्ट (Cart)',
    addToCart: 'कार्टमध्ये जोडा',
    buyNow: 'आत्ताच खरेदी करा',
    askArtisan: 'कारागिराला विचारा',
    freeDelivery: 'मोफत कॅम्पस डिलिव्हरी',
    voiceStory: '🎧 कारागिराच्या आवाजात गोष्ट ऐका',
    directPrice: 'थेट कारागीर किंमत',
    zeroMiddleman: 'शून्य दलाल कमिशन'
  }
};

function changeAppLanguage(lang) {
  currentAppLanguage = lang;
  localStorage.setItem('artisans360_language', lang);

  // Update selected dropdown/pill in UI
  const selects = document.querySelectorAll('.app-language-selector');
  selects.forEach(s => s.value = lang);

  // Apply multilingual content to default products
  allProducts.forEach(prod => {
    const multi = MULTILINGUAL_CRAFTS[prod.id];
    if (multi && multi[lang]) {
      prod.title = multi[lang].title;
      prod.description = multi[lang].desc;
    }
  });

  saveState();
  renderGrid();

  const langNames = { en: 'English', gu: 'ગુજરાતી (Gujarati)', hi: 'हिंदी (Hindi)', mr: 'मराठी (Marathi)' };
  const confirmationMsg = {
    en: 'Language set to English.',
    gu: 'ભાષા ગુજરાતી તરીકે સેટ થઈ ગઈ છે.',
    hi: 'भाषा हिंदी सेट हो गई है।',
    mr: 'भाषा मराठी सेट झाली आहे.'
  };

  speakFeedback(confirmationMsg[lang] || 'Language updated');
}

function setListingDictationLanguage(langCode) {
  listingVoiceDictationLang = langCode;
  const btns = document.querySelectorAll('.dictation-lang-btn');
  btns.forEach(b => {
    if (b.dataset.lang === langCode) {
      b.className = 'dictation-lang-btn px-2.5 py-1 bg-ochre-500 text-charcoal-950 font-black rounded-lg text-[10px] shadow-sm';
    } else {
      b.className = 'dictation-lang-btn px-2.5 py-1 bg-white hover:bg-ochre-100 text-charcoal-800 font-bold border border-alabaster-300 rounded-lg text-[10px]';
    }
  });
}

/**
 * Artisans360 - AI-Driven Market Linkage & Smart Cataloging for Marginalized Artisans
 * Artisans360 E-Commerce Buying Flow (Cart + 4-Step Checkout + Live OTP Tracking)
 */

// ==========================================
// 1. DATASETS (Gujarat Traditional Heritage Crafts)
// ==========================================
const DEFAULT_PRODUCTS = [
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
    description: '100% pure lustrous silk handcrafted using traditional Khatri finger-tying technique (over 5,000 micro bindis). Naturally dyed in rich crimson and saffron tones.',
    imageUrl: 'images/bandhani.jpg',
    fallbackEmoji: '🧣',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true
  },
  {
    id: 'prod-2',
    title: 'Handcrafted Terracotta Clay Water Jug & Tumbler Set (Ten Village Pottery)',
    category: 'Pottery',
    price: 290,
    rating: 4.9,
    reviewsCount: 62,
    distanceKm: 4.5,
    location: 'Ten Village Potter Cluster (4.5 km)',
    sellerName: 'Kantibhai Prajapati (Master Potter)',
    description: 'Formed on a traditional wooden wheel using porous Tapi river alluvial clay. Wood-fired in rural kilns for natural evaporative water cooling.',
    imageUrl: 'images/pottery.jpg',
    fallbackEmoji: '🏺',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true
  },
  {
    id: 'prod-3',
    title: 'Traditional Embroidered Peacock Mirror-Work Wall Hanging (Abhala Toran)',
    category: 'Wall Hanging',
    price: 620,
    rating: 4.8,
    reviewsCount: 39,
    distanceKm: 8.0,
    location: 'Rabari Mirror-Work Colony (8.0 km)',
    sellerName: 'Ramilaben Rabari (Tribal Artisan Collective)',
    description: 'Intricately hand-embroidered with authentic reflective Abhala glass mirrors, woolen tassels, and vibrant geometric tribal stitching on unbleached khadi canvas.',
    imageUrl: 'images/wallhanging.jpg',
    fallbackEmoji: '🪞',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: false
  },
  {
    id: 'prod-4',
    title: 'Authentic Gujarat Handloom Saree with Heritage Mirror Work & Border',
    category: 'Kutch Handloom',
    price: 1450,
    rating: 5.0,
    reviewsCount: 27,
    distanceKm: 14.0,
    location: 'Kutch Handloom Guild (14.0 km)',
    sellerName: 'Devjibhai Vankar (Master Handloom Weaver)',
    description: 'Extra-weft handloom technique on pure indigenous Kala organic cotton. Hand-dyed using pomegranate rind and organic indigo with hand-braided pallu tassels.',
    imageUrl: 'images/saree.jpg',
    fallbackEmoji: '🥻',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: false
  },
  {
    id: 'prod-5',
    title: 'Handcrafted Hand-Painted Sankheda Lacquered Wooden Dandiya Sticks (Pair)',
    category: 'Sankheda Woodcraft',
    price: 340,
    rating: 4.9,
    reviewsCount: 54,
    distanceKm: 18.0,
    location: 'Sankheda Lacquer Woodcraft (18.0 km)',
    sellerName: 'Kishorebhai Suthar (Sankheda Artisan Guild)',
    description: 'Turned on traditional wood lathes from seasoned teakwood, coated with natural hard shellac colors and golden floral motifs for festive Garba.',
    imageUrl: 'images/dandiya.jpg',
    fallbackEmoji: '🥢',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: false
  },
  {
    id: 'prod-6',
    title: 'Hand-Tuned Rustic Kutch Copper Wind Bells with Wooden Elephants (Nirona Craft)',
    category: 'Copper Bells',
    price: 480,
    rating: 4.8,
    reviewsCount: 35,
    distanceKm: 11.5,
    location: 'Nirona Copper Bell Smith (11.5 km)',
    sellerName: 'Ibrahim Luhar (Heritage Bell Smith)',
    description: 'Forged entirely without welding using recycled iron coated in brass-copper mud paste and kiln-baked. Fitted with a Sheesham wood striker for meditative resonant chimes.',
    imageUrl: 'images/copperbells.jpg',
    fallbackEmoji: '🔔',
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: false
  }
];

const DEFAULT_SERVICES = [
  {
    id: 'serv-1',
    title: 'Live Pottery Wheel Throwing Workshop & Custom Terracotta Planter Order',
    category: 'Pottery',
    price: 250,
    priceUnit: '/ session',
    rating: 4.9,
    reviewsCount: 42,
    distanceKm: 4.5,
    location: 'Ten Village Potter Cluster',
    providerName: 'Ten Gram Pottery Cooperative',
    description: 'Hands-on pottery masterclass on traditional potters wheel or commission personalized terracotta pots for campus & home.',
    imageUrl: 'images/pottery.jpg',
    fallbackEmoji: '🏺',
    type: 'service',
    status: 'active',
    isMyListing: false
  },
  {
    id: 'serv-2',
    title: 'Traditional Bandhani Tying & Custom Natural Dyeing Consultation',
    category: 'Bandhani & Silk',
    price: 180,
    priceUnit: '/ garment',
    rating: 4.8,
    reviewsCount: 35,
    distanceKm: 6.5,
    location: 'Khatri Bandhani Weavers',
    providerName: 'Geetaben Khatri Cooperative',
    description: 'Custom organic dyeing of dupattas and sarees with traditional bandhej patterns in 48 hours.',
    imageUrl: 'images/bandhani.jpg',
    fallbackEmoji: '🧣',
    type: 'service',
    status: 'active',
    isMyListing: false
  }
];

const DEFAULT_SELLER_INBOX = [
  {
    id: 'inbox-1',
    buyerName: 'Dr. Ananya Sharma (UTU Faculty)',
    buyerLocation: 'Faculty Quarters, Maliba Campus',
    itemName: 'Pure Gaji Silk Bandhani Dupatta',
    itemPrice: 850,
    proposedOffer: 800,
    message: 'Namaste Geetaben! Is this dupatta dyed using 100% natural organic dyes? Can your delivery boy Ramesh drop it at Faculty Block C?',
    status: 'negotiating',
    time: '10 mins ago'
  },
  {
    id: 'inbox-2',
    buyerName: 'Pooja Vaghela (3rd Yr Student)',
    buyerLocation: 'Baben Food Street Area',
    itemName: 'Sankheda Lacquered Dandiya Sticks',
    itemPrice: 340,
    proposedOffer: 300,
    message: 'Can I get 2 pairs of Sankheda dandiya sticks for ₹600 for our college Navratri event?',
    status: 'negotiating',
    time: '25 mins ago'
  }
];

const CRAFT_AI_PROFILES = {
  bandhani: {
    title: 'Handcrafted Pure Gaji Silk Bandhani Dupatta (Traditional Khatri Tie-Dye)',
    price: 850,
    rawMaterialCost: 320,
    laborHours: 12.0,
    location: 'Khatri Bandhani Weavers (6.5 km)',
    artisanName: 'Geetaben Khatri (Master Tie-Dye Artisan)',
    story: 'Authentic Gujarati Khatri Bandhani hand-tied with thousands of fine dots (bindis) on pure lustrous silk. Dyed using natural madder red and turmeric dyes.',
    imageUrl: 'images/bandhani.jpg',
    fallbackEmoji: '🧣',
    category: 'Bandhani & Silk'
  },
  pottery: {
    title: 'Handcrafted Terracotta Natural Clay Water Matka (Ten Village Pottery)',
    price: 290,
    rawMaterialCost: 110,
    laborHours: 4.5,
    location: 'Ten Village Potter Cluster (4.5 km)',
    artisanName: 'Kantibhai Prajapati (Master Potter)',
    story: 'Crafted by marginalized potters of Ten Village using 100% natural alluvial clay. Fired in traditional wood kilns for natural evaporative water cooling.',
    imageUrl: 'images/pottery.jpg',
    fallbackEmoji: '🏺',
    category: 'Pottery'
  },
  wallhanging: {
    title: 'Traditional Embroidered Mirror-Work Heritage Wall Hanging (Toran / Wall Art)',
    price: 620,
    rawMaterialCost: 220,
    laborHours: 8.0,
    location: 'Rabari Mirror-Work Colony (8.0 km)',
    artisanName: 'Ramilaben Rabari (Tribal Artisan)',
    story: 'Meticulously hand-embroidered with authentic Abhala glass mirrors and wool tassels on unbleached khadi canvas.',
    imageUrl: 'images/wallhanging.jpg',
    fallbackEmoji: '🪞',
    category: 'Wall Hanging'
  },
  saree: {
    title: 'Authentic Kutch Cotton Handloom Saree (Bhujodi Weave with Tassels)',
    price: 1450,
    rawMaterialCost: 550,
    laborHours: 16.0,
    location: 'Kutch Handloom Guild (14.0 km)',
    artisanName: 'Devjibhai Vankar (Master Weaver)',
    story: 'Extra-weft handloom technique on pure indigenous Kala organic cotton with natural vegetable dyes and traditional hand-braided tassels.',
    imageUrl: 'images/saree.jpg',
    fallbackEmoji: '🥻',
    category: 'Kutch Handloom'
  },
  dandiya: {
    title: 'Handcrafted Sankheda Lacquered Wooden Dandiya Sticks (Pair)',
    price: 340,
    rawMaterialCost: 120,
    laborHours: 3.5,
    location: 'Sankheda Lacquer Woodcraft (18.0 km)',
    artisanName: 'Kishorebhai Suthar (Wood Artisan)',
    story: 'Turned on traditional lathes from seasoned teakwood, coated with natural shellac colors and golden floral motifs for Navratri Garba.',
    imageUrl: 'images/dandiya.jpg',
    fallbackEmoji: '🥢',
    category: 'Sankheda Woodcraft'
  },
  copperbells: {
    title: 'Hand-Tuned Rustic Kutch Copper Wind Bells (Nirona Craft)',
    price: 480,
    rawMaterialCost: 160,
    laborHours: 5.0,
    location: 'Nirona Copper Bell Smith (11.5 km)',
    artisanName: 'Ibrahim Luhar (Bell Smith)',
    story: 'Forged without welding using recycled iron coated in copper-brass mud mixture and baked in a kiln with a sheesham wood clapper.',
    imageUrl: 'images/copperbells.jpg',
    fallbackEmoji: '🔔',
    category: 'Copper Bells'
  }
};

const DEFAULT_USER_STATS = {
  'Saurang Patel': {
    name: 'Saurang Patel',
    role: 'buyer',
    phone: '+91 98254 12345',
    baseLocation: 'UTU Maliba Campus, Boys Hostel Block B, Room 204 (0.4 km)',
    totalVisits: 9,
    visitedSections: ['Buyer Marketplace', 'Silk Bandhani Dupattas', '4-Step Secure Checkout', 'Shopping Cart'],
    lastVisitTime: 'Today at 01:30 AM'
  },
  'Kantibhai Prajapati': {
    name: 'Kantibhai Prajapati',
    role: 'seller',
    phone: '+91 98250 98765',
    baseLocation: 'Ten Village Potter Cluster (4.5 km)',
    totalVisits: 14,
    visitedSections: ['Artisan Dashboard', 'AI Smart Cataloging Studio', 'Direct Buyer Inbox', 'Workshop Open/Close Toggle'],
    lastVisitTime: 'Today at 01:05 AM'
  },
  'Geetaben Khatri': {
    name: 'Geetaben Khatri',
    role: 'seller',
    phone: '+91 98253 11223',
    baseLocation: 'Khatri Bandhani Weavers (6.5 km)',
    totalVisits: 9,
    visitedSections: ['Artisan Dashboard', 'Bandhani Silk Cataloging', 'Direct Buyer Inquiries'],
    lastVisitTime: 'Today at 01:10 AM'
  },
  'Dr. Ananya Sharma': {
    name: 'Dr. Ananya Sharma',
    role: 'buyer',
    phone: '+91 98251 44332',
    baseLocation: 'Faculty Quarters, Maliba Campus',
    totalVisits: 4,
    visitedSections: ['Buyer Marketplace', 'Silk Bandhani Product Inquiry', 'Kutch Copper Bells'],
    lastVisitTime: 'Yesterday at 09:40 PM'
  }
};

const DEFAULT_ADMIN_LOGS = [
  {
    id: 'log-101',
    userName: 'Geetaben Khatri',
    userRole: 'seller',
    location: 'Khatri Bandhani Weavers (6.5 km)',
    action: 'Published AI Smart Catalog Listing',
    pageSection: 'AI Smart Cataloging Studio',
    details: 'Generated Heritage Story & Fair Labor Price for Silk Bandhani Dupatta',
    visitCount: 9,
    timestamp: '2026-08-30 01:10:12'
  },
  {
    id: 'log-102',
    userName: 'Saurang Patel',
    userRole: 'buyer',
    location: 'UTU Maliba Campus (0.4 km)',
    action: 'Secure Checkout Purchase',
    pageSection: '4-Step Secure Checkout',
    details: 'Ordered Silk Bandhani Dupatta (₹850) with verified OTP',
    visitCount: 9,
    timestamp: '2026-08-30 01:15:45'
  }
];

let currentUser = null;
let selectedLoginRole = 'buyer';
let currentRole = 'buyer';
let buyerActiveTab = 'products';
let sellerActiveTab = 'listings';

let isArtisanShopOpen = true;
let maxRadiusFilter = 25;
let minRatingFilter = 0;
let activeCategoryFilter = 'All';
let currentSearchQuery = '';
let currentSortBy = 'distance';

let allProducts = [];
let allServices = [];
let sellerInbox = [];
let activeDeliveries = [];
let cart = []; // Multi-step shopping cart array
let activeCheckoutItems = []; // Items currently being checked out in 4-step flow
let adminLogs = [];
let userVisitStats = {};

let currentChatPartner = null;
let currentNegotiationItem = null;

let isListening = false;
let speechRecognizer = null;

// ==========================================
// 2. ADMIN AUDIT & VISITOR TRACKING ENGINE
// ==========================================
function trackAdminEvent(action, pageSection, details) {
  const user = currentUser || {
    name: 'Guest Visitor',
    role: 'guest',
    phone: 'N/A',
    location: 'UTU Maliba Campus (0.4 km)'
  };

  if (!userVisitStats[user.name]) {
    userVisitStats[user.name] = {
      name: user.name,
      role: user.role,
      phone: user.phone || 'N/A',
      baseLocation: user.location || 'Bardoli Circle',
      totalVisits: 0,
      visitedSections: [],
      lastVisitTime: ''
    };
  }

  const stat = userVisitStats[user.name];
  stat.totalVisits += 1;
  stat.lastVisitTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString() + ')';
  
  if (pageSection && !stat.visitedSections.includes(pageSection)) {
    stat.visitedSections.push(pageSection);
  }

  const logEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userName: user.name,
    userRole: user.role,
    location: user.location || 'Bardoli Circle',
    action: action,
    pageSection: pageSection || 'Marketplace',
    details: details || 'User action recorded',
    visitCount: stat.totalVisits,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  adminLogs.unshift(logEntry);
  if (adminLogs.length > 200) adminLogs.pop();

  saveState();

}

function exportAdminLogsJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    totalVisits: Object.values(userVisitStats).reduce((acc, u) => acc + (u.totalVisits || 0), 0),
    uniqueUsers: userVisitStats,
    auditLogs: adminLogs
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Artisans360_Admin_Visitor_Logs_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================
// 3. AUTHENTICATION & LOGIN LOGIC
// ==========================================

// ==========================================
// ADMIN CREDENTIALS & SECURITY SYSTEM
// ==========================================
function setLoginRole(role) {
  selectedLoginRole = role;
  const buyerBtn = document.getElementById('loginTabBuyerBtn');
  const sellerBtn = document.getElementById('loginTabSellerBtn');
  const submitBtnText = document.getElementById('loginSubmitBtnText');
  const nameInput = document.getElementById('loginNameInput');

  if (role === 'buyer') {
    if (buyerBtn) buyerBtn.className = 'py-2.5 rounded-xl transition-all bg-gradient-to-r from-ochre-500 to-ochre-600 text-charcoal-950 font-black shadow-sm flex items-center justify-center gap-1.5';
    if (sellerBtn) sellerBtn.className = 'py-2.5 rounded-xl transition-all text-alabaster-300 hover:text-white flex items-center justify-center gap-1.5';
    if (submitBtnText) submitBtnText.innerText = 'Enter Marketplace';
    if (nameInput) nameInput.value = 'Saurang Patel';
  } else {
    if (sellerBtn) sellerBtn.className = 'py-2.5 rounded-xl transition-all bg-gradient-to-r from-ochre-500 to-ochre-600 text-charcoal-950 font-black shadow-sm flex items-center justify-center gap-1.5';
    if (buyerBtn) buyerBtn.className = 'py-2.5 rounded-xl transition-all text-alabaster-300 hover:text-white flex items-center justify-center gap-1.5';
    if (submitBtnText) submitBtnText.innerText = 'Enter Artisan Studio';
    if (nameInput) nameInput.value = 'Geetaben Khatri (Bandhani Artisan)';
  }
}

function handleManualLogin(e) {
  e.preventDefault();
  const name = document.getElementById('loginNameInput').value.trim();
  const phone = document.getElementById('loginPhoneInput').value.trim();
  const location = document.getElementById('loginLocationSelect').value;

  currentUser = {
    name: name,
    phone: phone,
    location: location,
    role: selectedLoginRole
  };

  localStorage.setItem('artisans360_user', JSON.stringify(currentUser));
  enterAppSession();
}

function loginAsDemo(role) {
  if (role === 'buyer') {
    currentUser = {
      name: 'Saurang Patel',
      phone: '+91 98254 12345',
      location: 'UTU Maliba Campus, Boys Hostel Block B, Room 204 (0.4 km)',
      role: 'buyer'
    };
  } else {
    currentUser = {
      name: 'Geetaben Khatri',
      phone: '+91 98253 11223',
      location: 'Khatri Bandhani Weavers (6.5 km)',
      role: 'seller'
    };
  }

  localStorage.setItem('artisans360_user', JSON.stringify(currentUser));
  enterAppSession();
}

function handleLogout() {
  if (confirm('Are you sure you want to log out of your account?')) {
    trackAdminEvent('User Logged Out', 'Logout Screen', `User ${currentUser ? currentUser.name : ''} logged out`);
    localStorage.removeItem('artisans360_user');
    currentUser = null;
    document.getElementById('mainAppWrapper').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
    speakFeedback('Logged out successfully.');
  }
}

function enterAppSession() {
  if (!currentUser) return;

  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('mainAppWrapper').classList.remove('hidden');

  document.getElementById('loggedUserNameDisplay').innerText = currentUser.name;
  document.getElementById('loggedUserRoleDisplay').innerText = 
    currentUser.role === 'seller' ? 'Artisan / Maker' : 'Buyer / Student';
  document.getElementById('userAvatarLetter').innerText = currentUser.name.charAt(0).toUpperCase();

  updateRoleUIForCurrentUser();
  switchRole(currentUser.role);
  speakFeedback(`Welcome ${currentUser.name}! You are logged in.`);
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 4. INITIALIZATION & AUTO-CACHE UPGRADE
// ==========================================

function initApp() {
  syncDatabaseOnLoad();
  const freshProds = localStorage.getItem('artisans360_products');
  const savedServs = localStorage.getItem('artisans360_services');
  const savedInbox = localStorage.getItem('artisans360_inbox');
  const savedDeliveries = localStorage.getItem('artisans360_deliveries');
  const savedCart = localStorage.getItem('artisans360_cart');
  const savedShopStatus = localStorage.getItem('artisans360_shop_open');
  const savedLogs = localStorage.getItem('artisans360_admin_logs');
  const savedStats = localStorage.getItem('artisans360_user_stats');

  allProducts = freshProds ? JSON.parse(freshProds) : [...DEFAULT_PRODUCTS];

  // Always ensure all 6 heritage products have their local images and correct metadata
  DEFAULT_PRODUCTS.forEach(defProd => {
    const existing = allProducts.find(p => p.id === defProd.id);
    if (existing) {
      existing.imageUrl = defProd.imageUrl;
      existing.title = defProd.title;
      existing.description = defProd.description;
      existing.category = defProd.category;
      existing.price = defProd.price;
      existing.sellerName = defProd.sellerName;
      existing.location = defProd.location;
      existing.distanceKm = defProd.distanceKm;
    } else {
      allProducts.push({...defProd});
    }
  });
  saveState();


  // Auto-migrate all product images to local offline-ready assets
  allProducts.forEach(prod => {
    if (prod.id === 'prod-1' || prod.title.includes('Bandhani') || prod.category.includes('Bandhani')) prod.imageUrl = 'images/bandhani.jpg';
    else if (prod.id === 'prod-2' || prod.title.includes('Pottery') || prod.title.includes('Matka') || prod.category.includes('Pottery')) prod.imageUrl = 'images/pottery.jpg';
    else if (prod.id === 'prod-3' || prod.title.includes('Wall') || prod.title.includes('Mirror') || prod.category.includes('Wall')) prod.imageUrl = 'images/wallhanging.jpg';
    else if (prod.id === 'prod-4' || prod.title.includes('Saree') || prod.title.includes('Kutch') || prod.category.includes('Handloom')) prod.imageUrl = 'images/saree.jpg';
    else if (prod.id === 'prod-5' || prod.title.includes('Dandiya') || prod.title.includes('Sankheda') || prod.category.includes('Woodcraft')) prod.imageUrl = 'images/dandiya.jpg';
    else if (prod.id === 'prod-6' || prod.title.includes('Bell') || prod.title.includes('Copper') || prod.category.includes('Copper')) prod.imageUrl = 'images/copperbells.jpg';
  });
  saveState();
  
  allServices = savedServs ? JSON.parse(savedServs) : [...DEFAULT_SERVICES];
  sellerInbox = savedInbox ? JSON.parse(savedInbox) : [...DEFAULT_SELLER_INBOX];
  activeDeliveries = savedDeliveries ? JSON.parse(savedDeliveries) : [];
  cart = savedCart ? JSON.parse(savedCart) : [];
  adminLogs = savedLogs ? JSON.parse(savedLogs) : [...DEFAULT_ADMIN_LOGS];
  userVisitStats = savedStats ? JSON.parse(savedStats) : { ...DEFAULT_USER_STATS };

  if (savedShopStatus !== null) isArtisanShopOpen = (savedShopStatus === 'true');

  setupSpeechRecognition();
  updateShopStatusUI();
  updateCategoryPills();
  updateCartBadge();
  renderGrid();
  renderSellerDashboard();
  updateDeliveryBadge();

  const savedUser = localStorage.getItem('artisans360_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    enterAppSession();
  } else {
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('mainAppWrapper').classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

function saveState() {
  localStorage.setItem('artisans360_products', JSON.stringify(allProducts));
  localStorage.setItem('artisans360_services', JSON.stringify(allServices));
  localStorage.setItem('artisans360_inbox', JSON.stringify(sellerInbox));
  localStorage.setItem('artisans360_deliveries', JSON.stringify(activeDeliveries));
  localStorage.setItem('artisans360_cart', JSON.stringify(cart));
  localStorage.setItem('artisans360_shop_open', isArtisanShopOpen.toString());
  localStorage.setItem('artisans360_admin_logs', JSON.stringify(adminLogs));
  localStorage.setItem('artisans360_user_stats', JSON.stringify(userVisitStats));
}

function resetToDefaultDemoData() {
  localStorage.removeItem('artisans360_products');
  localStorage.removeItem('artisans360_services');
  localStorage.removeItem('artisans360_inbox');
  localStorage.removeItem('artisans360_deliveries');
  localStorage.removeItem('artisans360_cart');
  localStorage.removeItem('artisans360_shop_open');
  localStorage.removeItem('artisans360_admin_logs');
  localStorage.removeItem('artisans360_user_stats');
  initApp();
  alert('✅ Gujarat Heritage Crafts & Shopping Cart refreshed!');
}

// ==========================================
// 5. Artisans360 SHOPPING CART ENGINE
// ==========================================

function isItemPurchasable(item) {
  if (!item) return false;
  if (item.status === 'paused' || item.status === 'closed' || item.status === 'sold') return false;
  if (item.isMyListing && !isArtisanShopOpen) return false;
  return true;
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (!isItemPurchasable(product)) {
    speakFeedback('This craft is currently closed for orders by the artisan.');
    alert('🔴 Workshop Notice: Orders for this handcrafted item are currently CLOSED by the artisan.\n\nYou can click "Ask Artisan a Question" to leave a pre-order message!');
    return;
  }

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      fallbackEmoji: product.fallbackEmoji,
      sellerName: product.sellerName,
      location: product.location,
      category: product.category,
      qty: 1
    });
  }

  saveState();
  updateCartBadge();
  trackAdminEvent('Added Item to Cart', 'Shopping Cart Drawer', `Added "${product.title}" (₹${product.price})`);
  speakFeedback(`Added ${product.title} to your cart.`);

  openCartModal();
}

function updateCartQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveState();
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveState();
  updateCartBadge();
  renderCartItems();
}

function updateCartBadge() {
  const badge = document.getElementById('navCartBadge');
  if (!badge) return;
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.innerText = totalCount;
}

function openCartModal() {
  renderCartItems();
  document.getElementById('cartModal').classList.remove('hidden');
  trackAdminEvent('Opened Shopping Cart', 'Shopping Cart View', `Cart has ${cart.length} unique crafts`);
  if (window.lucide) lucide.createIcons();
}

function closeCartModal() {
  document.getElementById('cartModal').classList.add('hidden');
}

function renderCartItems() {
  const container = document.getElementById('cartItemsListContainer');
  const emptyNotice = document.getElementById('cartEmptyNotice');
  const priceCard = document.getElementById('cartPriceBreakdownCard');
  const bottomBar = document.getElementById('cartBottomActionBar');
  const itemsCountHeader = document.getElementById('cartTotalItemsCount');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  itemsCountHeader.innerText = totalQty;

  if (cart.length === 0) {
    container.innerHTML = '';
    emptyNotice.classList.remove('hidden');
    priceCard.classList.add('hidden');
    bottomBar.classList.add('hidden');
    return;
  }

  emptyNotice.classList.add('hidden');
  priceCard.classList.remove('hidden');
  bottomBar.classList.remove('hidden');

  container.innerHTML = cart.map(item => `
    <div class="bg-white p-4 rounded-2xl border border-alabaster-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-16 h-16 rounded-xl overflow-hidden bg-charcoal-900 flex-shrink-0 flex items-center justify-center text-3xl">
          ${
            item.imageUrl 
              ? `<img src="${item.imageUrl}" class="w-full h-full object-cover">`
              : `<span>${item.fallbackEmoji || '🏺'}</span>`
          }
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-black uppercase text-charcoal-900 bg-ochre-100 px-2 py-0.2 rounded border border-ochre-200">${item.category}</span>
          <h5 class="font-bold text-charcoal-950 text-xs leading-snug line-clamp-1 max-w-sm">${item.title}</h5>
          <p class="text-[11px] text-charcoal-700">Artisan: ${item.sellerName}</p>
          <div class="font-black text-sm text-charcoal-950 pt-0.5">₹${item.price}</div>
        </div>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-alabaster-200">
        <!-- Quantity Controls -->
        <div class="flex items-center border border-alabaster-300 rounded-xl overflow-hidden bg-alabaster-50">
          <button onclick="updateCartQuantity('${item.id}', -1)" class="px-3 py-1 font-bold text-charcoal-800 hover:bg-alabaster-200 text-xs">-</button>
          <span class="px-3 py-1 font-black text-charcoal-950 text-xs bg-white border-x border-alabaster-300">${item.qty}</span>
          <button onclick="updateCartQuantity('${item.id}', 1)" class="px-3 py-1 font-bold text-charcoal-800 hover:bg-alabaster-200 text-xs">+</button>
        </div>

        <button onclick="removeFromCart('${item.id}')" class="text-rose-600 hover:text-rose-800 font-bold text-xs p-1.5 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Remove</span>
        </button>
      </div>
    </div>
  `).join('');

  document.getElementById('priceSummaryCount').innerText = totalQty;
  document.getElementById('priceSummaryOriginal').innerHTML = `&#8377;${totalPrice.toLocaleString('en-IN')}`;
  document.getElementById('priceSummaryTotal').innerHTML = `&#8377;${totalPrice.toLocaleString('en-IN')}`;
  document.getElementById('cartBottomTotalDisplay').innerHTML = `&#8377;${totalPrice.toLocaleString('en-IN')}`;

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 6. Artisans360 4-STEP CHECKOUT ENGINE
// ==========================================
function buyNowDirect(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (!isItemPurchasable(product)) {
    speakFeedback('This craft is currently closed for orders by the artisan.');
    alert('🔴 Workshop Notice: Orders for this handcrafted item are currently CLOSED by the artisan.\n\nYou can click "Ask Artisan a Question" to leave a pre-order message!');
    return;
  }

  activeCheckoutItems = [{
    id: product.id,
    title: product.title,
    price: product.price,
    imageUrl: product.imageUrl,
    fallbackEmoji: product.fallbackEmoji,
    sellerName: product.sellerName,
    location: product.location,
    category: product.category,
    qty: 1
  }];

  openCheckoutModal();
}

function proceedToCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty! Add products first.');
    return;
  }

  activeCheckoutItems = [...cart];
  closeCartModal();
  openCheckoutModal();
}

function openCheckoutModal() {
  const user = currentUser || {
    name: 'Saurang Patel',
    phone: '+91 98254 12345',
    location: 'UTU Maliba Campus, Boys Hostel Block B, Room 204 (0.4 km)'
  };

  // Step 1: Login Summary
  document.getElementById('checkoutUserSummaryText').innerText = `${user.name} (${user.phone})`;

  // Step 2: Address Info
  document.getElementById('checkoutAddressName').innerText = user.name;
  document.getElementById('checkoutAddressPhone').innerText = user.phone;
  document.getElementById('checkoutAddressFullText').innerText = `${user.location}, Bardoli - Mahuva Road, Surat District, Gujarat - 394350`;
  document.getElementById('checkoutCustomAddressInput').value = user.location;

  // Step 3: Order Summary Items
  const itemsContainer = document.getElementById('checkoutOrderItemsList');
  const totalPrice = activeCheckoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  itemsContainer.innerHTML = activeCheckoutItems.map(item => `
    <div class="flex items-center justify-between bg-alabaster-50 p-3 rounded-xl border border-alabaster-200">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg overflow-hidden bg-charcoal-900 flex-shrink-0 flex items-center justify-center text-xl">
          ${
            item.imageUrl 
              ? `<img src="${item.imageUrl}" class="w-full h-full object-cover">`
              : `<span>${item.fallbackEmoji || '🏺'}</span>`
          }
        </div>
        <div>
          <div class="font-bold text-charcoal-950 text-xs truncate max-w-xs">${item.title}</div>
          <div class="text-[11px] text-charcoal-700">Qty: ${item.qty} • Artisan: ${item.sellerName}</div>
        </div>
      </div>
      <div class="font-black text-charcoal-950 text-xs text-right">
        <div>₹${item.price * item.qty}</div>
        <div class="text-[10px] text-emerald-700 font-bold">100% Direct Payout</div>
      </div>
    </div>
  `).join('');

  document.getElementById('checkoutFinalPayableAmount').innerHTML = `&#8377;${totalPrice.toLocaleString('en-IN')}`;

  document.getElementById('checkoutModal').classList.remove('hidden');
  trackAdminEvent('Initiated 4-Step Secure Checkout', 'Checkout Stepper', `Reviewing ${activeCheckoutItems.length} items totaling ₹${totalPrice}`);
  if (window.lucide) lucide.createIcons();
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

function confirmAndPlaceOrder() {
  if (activeCheckoutItems.length === 0) return;

  const address = document.getElementById('checkoutCustomAddressInput').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentOption"]:checked').value;
  const orderId = 'OD' + Math.floor(1000000000 + Math.random() * 9000000000);
  const otp = Math.floor(1000 + Math.random() * 9000);
  const totalPrice = activeCheckoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const orderRecord = {
    id: orderId,
    itemTitle: activeCheckoutItems.map(i => `${i.title} (x${i.qty})`).join(', '),
    price: totalPrice,
    items: activeCheckoutItems,
    buyerName: currentUser ? currentUser.name : 'Saurang Patel',
    buyerAddress: address || 'UTU Maliba Campus, Boys Hostel Block B, Room 204',
    buyerPhone: currentUser ? currentUser.phone : '+91 98254 12345',
    paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (Hand-to-Hand)' : 'Direct UPI QR Code',
    otp: otp,
    status: 'Dispatched with Verified Delivery Partner Ramesh Patel',
    deliveryBoy: 'Ramesh Patel (GJ-19-BK-4022)',
    timestamp: new Date().toISOString()
  };

  activeDeliveries.unshift(orderRecord);

  // Mark items as ordered in product grid
  activeCheckoutItems.forEach(cartItem => {
    const p = allProducts.find(prod => prod.id === cartItem.id);
    if (p) {
      p.isOrdered = true;
      p.orderOtp = otp;
    }
  });

  // Clear cart
  cart = [];
  saveState();
  updateCartBadge();
  updateDeliveryBadge();
  closeCheckoutModal();
  renderGrid();

  // Populate Success Modal
  document.getElementById('successOrderId').innerText = orderId;
  document.getElementById('successDeliveryOtp').innerText = otp;
  document.getElementById('orderSuccessModal').classList.remove('hidden');

  trackAdminEvent('Placed Secure Order', '4-Step Secure Checkout', `Order ${orderId} confirmed for ₹${totalPrice} (OTP: ${otp})`);
  speakFeedback(`Your order has been placed successfully! Order ID ${orderId}. Your delivery OTP is ${otp}.`);

  if (window.lucide) lucide.createIcons();
}

function closeOrderSuccessModal() {
  document.getElementById('orderSuccessModal').classList.add('hidden');
}

// ==========================================
// 7. ARTISAN WORKSHOP STATUS TOGGLE
// ==========================================
function toggleArtisanShopStatus() {
  isArtisanShopOpen = !isArtisanShopOpen;
  saveState();
  updateShopStatusUI();
  renderGrid();

  trackAdminEvent(
    isArtisanShopOpen ? 'Opened Workshop for Orders' : 'Closed Workshop (Crafting)',
    'Artisan Workshop Portal',
    `Artisan toggled status to ${isArtisanShopOpen ? 'OPEN' : 'CLOSED'}`
  );

  if (isArtisanShopOpen) {
    speakFeedback('Your artisan workshop is now OPEN for new orders.');
    alert('🟢 Workshop Status: OPEN FOR ORDERS\nBuyers can now order your crafts and chat with you.');
  } else {
    speakFeedback('Workshop is currently CLOSED. You can craft in peace.');
    alert('🔴 Workshop Status: CLOSED (Crafting in Workshop)\nYour listings show that you are currently crafting. Buyers can still leave inquiries.');
  }
}

function updateShopStatusUI() {
  const btn = document.getElementById('artisanShopStatusBtn');
  const dot = document.getElementById('shopStatusDot');
  const text = document.getElementById('shopStatusText');

  if (!btn) return;

  if (isArtisanShopOpen) {
    btn.className = 'px-2.5 py-0.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 bg-emerald-600 text-white shadow-sm';
    dot.className = 'w-2 h-2 rounded-full bg-white animate-ping';
    text.innerText = 'OPEN FOR ORDERS';
  } else {
    btn.className = 'px-2.5 py-0.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 bg-rose-600 text-white shadow-sm';
    dot.className = 'w-2 h-2 rounded-full bg-white';
    text.innerText = 'CLOSED (CRAFTING)';
  }
}

// ==========================================
// 8. AI SMART CATALOGING STUDIO
// ==========================================
let currentAISampleType = 'bandhani';

function openSmartCatalogModal() {
  selectCraftSample('bandhani');
  document.getElementById('smartCatalogModal').classList.remove('hidden');
  trackAdminEvent('Opened AI Smart Cataloging Studio', 'AI Studio Modal', 'Artisan initiated AI craft story generation');
  if (window.lucide) lucide.createIcons();
}

function closeSmartCatalogModal() {
  document.getElementById('smartCatalogModal').classList.add('hidden');
}

function selectCraftSample(type) {
  currentAISampleType = type;
  const sample = CRAFT_AI_PROFILES[type] || CRAFT_AI_PROFILES.bandhani;

  document.getElementById('aiGeneratedTitle').value = sample.title;
  document.getElementById('aiGeneratedPrice').innerText = sample.price;
  document.getElementById('aiGeneratedStory').value = sample.story;
  document.getElementById('aiArtisanName').value = sample.artisanName;
  document.getElementById('aiArtisanLocation').value = sample.location;
}

function speakAIGeneratedDescription() {
  const title = document.getElementById('aiGeneratedTitle').value;
  const price = document.getElementById('aiGeneratedPrice').innerText;
  const story = document.getElementById('aiGeneratedStory').value;

  const audioText = `AI Catalog summary for artisan. Craft: ${title}. Fair recommended price: ${price} rupees. Tradition: ${story}`;
  speakFeedback(audioText);
  trackAdminEvent('Played Audio Readout', 'AI Smart Cataloging Studio', `Voice playback for "${title}"`);
}

function publishAISmartListing() {
  const sample = CRAFT_AI_PROFILES[currentAISampleType] || CRAFT_AI_PROFILES.bandhani;
  const title = document.getElementById('aiGeneratedTitle').value.trim();
  const price = parseInt(document.getElementById('aiGeneratedPrice').innerText, 10);
  const story = document.getElementById('aiGeneratedStory').value.trim();
  const location = document.getElementById('aiArtisanLocation').value;
  const artisanName = document.getElementById('aiArtisanName').value.trim();

  const kmMatch = location.match(/([\d\.]+)\s*km/);
  const distanceKm = kmMatch ? parseFloat(kmMatch[1]) : 6.5;

  const newCraft = {
    id: `prod-${Date.now()}`,
    title: title,
    category: sample.category,
    price: price,
    rating: 5.0,
    reviewsCount: 1,
    distanceKm: distanceKm,
    location: location,
    sellerName: artisanName,
    description: story,
    imageUrl: sample.imageUrl,
    fallbackEmoji: sample.fallbackEmoji,
    type: 'product',
    status: 'active',
    isOrdered: false,
    orderOtp: null,
    isMyListing: true
  };

  allProducts.unshift(newCraft);
  saveState();
  closeSmartCatalogModal();
  renderSellerDashboard();
  renderGrid();

  trackAdminEvent('Published AI Catalog Craft', 'Marketplace Feed', `Published "${title}" at ₹${price}`);
  speakFeedback(`Successfully published ${title} with AI smart cataloging.`);
  alert(`✨ AI Smart Catalog Published!\n\n"${title}" is now live on the marketplace at a fair artisan price of ₹${price}.\n100% of earnings go directly to you without middleman commission.`);
}

// ==========================================
// 9. VOICE RECOGNITION & COMMAND HANDLER
// ==========================================
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;
  speechRecognizer.lang = 'en-IN';

  speechRecognizer.onstart = () => {
    isListening = true;
    updateVoiceUI(true, 'Listening... Speak your craft command!');
  };

  speechRecognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    updateVoiceUI(false, `Recognized: "${transcript}"`);
    processVoiceCommand(transcript);
  };

  speechRecognizer.onerror = () => {
    isListening = false;
    updateVoiceUI(false, 'Mic error. Click to retry.');
    setTimeout(() => {
      document.getElementById('voiceListeningBar').classList.add('hidden');
    }, 3000);
  };

  speechRecognizer.onend = () => {
    isListening = false;
    const btn = document.getElementById('micStatusText');
    if (btn) btn.innerText = 'Voice';
  };
}

function toggleVoiceAssistant() {
  if (!speechRecognizer) {
    const cmd = prompt('Voice input test (e.g. "search silk bandhani", "view cart", "sankheda dandiya"):', 'search silk bandhani');
    if (cmd) processVoiceCommand(cmd.toLowerCase().trim());
    return;
  }

  if (isListening) {
    speechRecognizer.stop();
    isListening = false;
    updateVoiceUI(false, '');
  } else {
    try {
      speechRecognizer.start();
    } catch (e) {
      console.warn(e);
    }
  }
}

function stopVoiceAssistant() {
  if (speechRecognizer && isListening) speechRecognizer.stop();
  isListening = false;
  document.getElementById('voiceListeningBar').classList.add('hidden');
}

function updateVoiceUI(active, text) {
  const bar = document.getElementById('voiceListeningBar');
  const display = document.getElementById('voiceTranscriptDisplay');
  const btn = document.getElementById('micStatusText');
  const micBtn = document.getElementById('voiceMicBtn');

  if (active) {
    bar.classList.remove('hidden');
    display.innerText = text;
    if (btn) btn.innerText = 'Listening...';
    if (micBtn) micBtn.classList.add('pulse-ochre');
  } else {
    if (text) display.innerText = text;
    if (btn) btn.innerText = 'Voice';
    if (micBtn) micBtn.classList.remove('pulse-ochre');
  }
}

function speakFeedback(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function simulateSpokenCommand(command) {
  updateVoiceUI(true, `Recognized: "${command}"`);
  setTimeout(() => {
    processVoiceCommand(command.toLowerCase().trim());
    setTimeout(() => {
      document.getElementById('voiceListeningBar').classList.add('hidden');
    }, 2500);
  }, 300);
}

function testVoiceCommand(cmd) {
  simulateSpokenCommand(cmd);
}

function processVoiceCommand(cmd) {
  trackAdminEvent('Spoken Voice Command', 'Web Speech Voice Assistant', `Voice command: "${cmd}"`);

  if (cmd.includes('cart') || cmd.includes('bag') || cmd.includes('basket')) {
    openCartModal();
    speakFeedback('Opening your shopping cart.');
    return;
  }

  if (cmd.includes('admin') || cmd.includes('logs') || cmd.includes('audit')) {
    if (currentUser && currentUser.role !== 'admin') {
      speakFeedback('Access restricted. You are logged in as a ' + currentUser.role);
      alert('⛔ Access Restricted: Admin portal is only accessible to Administrators.');
      return;
    }
    switchRole('admin');
    speakFeedback('Opening Admin Visitor Tracking Portal.');
    return;
  }

  if (cmd.includes('smart catalog') || cmd.includes('catalog') || cmd.includes('ai')) {
    switchRole('seller');
    openSmartCatalogModal();
    speakFeedback('Opening AI Smart Cataloging Studio for artisan.');
    return;
  }

  if (cmd.includes('seller') || cmd.includes('artisan') || cmd.includes('maker') || cmd.includes('workshop')) {
    if (currentUser && currentUser.role === 'buyer') {
      speakFeedback('Access restricted. You are logged in as a buyer.');
      alert('⛔ Access Restricted: You are logged in as a Buyer.');
      return;
    }
    switchRole('seller');
    speakFeedback('Switched to Artisan Maker Portal.');
    return;
  }

  if (cmd.includes('buyer') || cmd.includes('buy') || cmd.includes('market')) {
    switchRole('buyer');
    speakFeedback('Switched to Buyer Market view.');
    return;
  }

  const kmMatch = cmd.match(/(\d+)\s*(km|kilometer|kilo)/);
  if (kmMatch) {
    const km = Math.min(25, Math.max(1, parseInt(kmMatch[1], 10)));
    updateProximityFilter(km);
    speakFeedback(`Showing artisans within ${km} kilometers.`);
    return;
  }

  if (cmd.includes('bandhani') || cmd.includes('dupatta') || cmd.includes('silk')) {
    setBuyerTab('products');
    currentSearchQuery = 'bandhani';
    document.getElementById('searchInput').value = 'bandhani';
    renderGrid();
    speakFeedback('Showing pure silk Bandhani dupattas.');
    return;
  }

  if (cmd.includes('dandiya') || cmd.includes('sankheda') || cmd.includes('sticks')) {
    setBuyerTab('products');
    currentSearchQuery = 'dandiya';
    document.getElementById('searchInput').value = 'dandiya';
    renderGrid();
    speakFeedback('Showing handcrafted Sankheda Dandiya sticks.');
    return;
  }

  if (cmd.includes('bell') || cmd.includes('copper')) {
    setBuyerTab('products');
    currentSearchQuery = 'copper';
    document.getElementById('searchInput').value = 'copper';
    renderGrid();
    speakFeedback('Showing hand-tuned copper bells.');
    return;
  }

  if (cmd.includes('pottery') || cmd.includes('matka') || cmd.includes('clay')) {
    setBuyerTab('products');
    currentSearchQuery = 'pottery';
    document.getElementById('searchInput').value = 'pottery';
    renderGrid();
    speakFeedback('Showing terracotta clay pottery.');
    return;
  }

  if (cmd.includes('wall hanging') || cmd.includes('mirror') || cmd.includes('toran')) {
    setBuyerTab('products');
    currentSearchQuery = 'wall hanging';
    document.getElementById('searchInput').value = 'wall hanging';
    renderGrid();
    speakFeedback('Showing traditional mirror-work wall hangings.');
    return;
  }

  if (cmd.includes('saree') || cmd.includes('kutch') || cmd.includes('cotton')) {
    setBuyerTab('products');
    currentSearchQuery = 'saree';
    document.getElementById('searchInput').value = 'saree';
    renderGrid();
    speakFeedback('Showing authentic Kutch cotton handloom sarees.');
    return;
  }

  let searchWord = cmd.replace(/^(search for|search|find|show me|look for)\s*/i, '').trim();
  if (searchWord) {
    currentSearchQuery = searchWord;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = searchWord;
    renderGrid();
    speakFeedback(`Found handcrafted results for ${searchWord}`);
  }
}

// ==========================================
// 10. ROLE & TAB NAVIGATION
// ==========================================

function updateRoleUIForCurrentUser() {
  const container = document.getElementById('roleNavContainer');
  if (!currentUser || !container) return;

  if (currentUser.role === 'buyer') {
    container.innerHTML = `
      <div class="px-3 py-1.5 bg-charcoal-950 rounded-xl text-xs font-bold text-alabaster-200 border border-charcoal-800 flex items-center gap-1.5 shadow-inner">
        <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-ochre-400"></i>
        <span>Buyer Account</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="bg-charcoal-950 p-1 rounded-xl flex items-center border border-charcoal-800">
        <button id="roleSellerBtn" onclick="switchRole('seller')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-ochre-500 to-ochre-600 text-charcoal-950 font-black shadow-sm flex items-center gap-1.5">
          <i data-lucide="hammer" class="w-3.5 h-3.5"></i>
          <span>Artisan Studio</span>
        </button>
        <button id="roleBuyerBtn" onclick="switchRole('buyer')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-alabaster-300 hover:text-white flex items-center gap-1.5">
          <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
          <span>Market View</span>
        </button>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

function switchRole(role) {
  if (currentUser && currentUser.role === 'buyer' && role === 'seller') {
    alert('⛔ Access Restricted: You are logged in with a Buyer account.\n\nTo access the Artisan Studio, please log out and sign in with an Artisan account.');
    return;
  }

  currentRole = role;
  const buyerView = document.getElementById('buyerView');
  const sellerView = document.getElementById('sellerView');

  if (buyerView) buyerView.classList.add('hidden');
  if (sellerView) sellerView.classList.add('hidden');

  if (role === 'buyer') {
    if (buyerView) buyerView.classList.remove('hidden');
    renderGrid();
  } else if (role === 'seller') {
    if (sellerView) sellerView.classList.remove('hidden');
    renderSellerDashboard();
  }

  updateRoleUIForCurrentUser();
}

function setBuyerTab(tab) {
  buyerActiveTab = tab;
  const tabProductsBtn = document.getElementById('tabProductsBtn');
  const tabServicesBtn = document.getElementById('tabServicesBtn');

  if (tab === 'products') {
    tabProductsBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-charcoal-900 text-white shadow-sm flex items-center gap-2';
    tabServicesBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-charcoal-700 hover:text-charcoal-950 flex items-center gap-2';
    trackAdminEvent('Viewed Products Tab', 'Artisan Crafts Section', 'Filtering handcrafted physical products');
  } else {
    tabServicesBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-charcoal-900 text-white shadow-sm flex items-center gap-2';
    tabProductsBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-charcoal-700 hover:text-charcoal-950 flex items-center gap-2';
    trackAdminEvent('Viewed Services Tab', 'Services & Workshops Section', 'Filtering custom craft workshops');
  }

  activeCategoryFilter = 'All';
  updateCategoryPills();
  renderGrid();
}

function setSellerTab(tab) {
  sellerActiveTab = tab;
  const tabListingsBtn = document.getElementById('sellerTabListingsBtn');
  const tabInboxBtn = document.getElementById('sellerTabInboxBtn');
  const listingsSubView = document.getElementById('sellerListingsSubView');
  const inboxSubView = document.getElementById('sellerInboxSubView');

  if (tab === 'listings') {
    tabListingsBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-charcoal-900 text-white shadow-sm border border-charcoal-800 flex items-center gap-2';
    tabInboxBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-charcoal-700 hover:text-charcoal-950 flex items-center gap-2 relative';
    listingsSubView.classList.remove('hidden');
    inboxSubView.classList.add('hidden');
  } else {
    tabInboxBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-charcoal-900 text-white shadow-sm border border-charcoal-800 flex items-center gap-2 relative';
    tabListingsBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-charcoal-700 hover:text-charcoal-950 flex items-center gap-2';
    listingsSubView.classList.add('hidden');
    inboxSubView.classList.remove('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 11. FILTERS & SORTING
// ==========================================
function updateProximityFilter(val) {
  maxRadiusFilter = parseInt(val, 10);
  const slider = document.getElementById('proximitySlider');
  if (slider) slider.value = maxRadiusFilter;

  document.getElementById('proximityValueText').innerText = `${maxRadiusFilter} km`;
  document.getElementById('activeRadiusBadge').innerText = `${maxRadiusFilter} km`;

  trackAdminEvent('Updated Proximity Radius', `Radius: ≤ ${maxRadiusFilter} km`, `Adjusted slider to ${maxRadiusFilter} km around Bardoli`);
  renderGrid();
}

function setRatingFilter(rating) {
  minRatingFilter = rating;
  const btns = {
    0: document.getElementById('ratingAllBtn'),
    4.0: document.getElementById('rating4Btn'),
    4.5: document.getElementById('rating45Btn'),
    4.9: document.getElementById('rating5Btn')
  };

  Object.keys(btns).forEach(k => {
    if (!btns[k]) return;
    if (parseFloat(k) === rating) {
      btns[k].className = 'px-2.5 py-1.5 rounded-lg text-xs font-bold border text-charcoal-950 bg-ochre-100 border-ochre-300 transition-all flex items-center justify-center gap-1';
    } else {
      btns[k].className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium border border-alabaster-300 text-charcoal-700 hover:border-ochre-400 transition-all flex items-center justify-center gap-1';
    }
  });

  renderGrid();
}

function updateCategoryPills() {
  const container = document.getElementById('categoryPillsContainer');
  if (!container) return;

  const categories = buyerActiveTab === 'products'
    ? ['All', 'Bandhani & Silk', 'Pottery', 'Wall Hanging', 'Kutch Handloom', 'Sankheda Woodcraft', 'Copper Bells']
    : ['All', 'Pottery', 'Bandhani & Silk'];

  container.innerHTML = categories.map(cat => `
    <button 
      onclick="setCategoryFilter('${cat}')" 
      class="px-3 py-1 rounded-full text-xs font-semibold transition-all ${
        activeCategoryFilter === cat 
          ? 'bg-charcoal-900 text-white shadow-sm border border-charcoal-800' 
          : 'bg-alabaster-100 text-charcoal-800 hover:bg-ochre-100 border border-alabaster-300'
      }"
    >
      ${cat}
    </button>
  `).join('');
}

function setCategoryFilter(cat) {
  activeCategoryFilter = cat;
  updateCategoryPills();
  trackAdminEvent('Filtered Category', `Category: ${cat}`, `Browsing ${cat} crafts`);
  renderGrid();
}

function handleSearchInput(val) {
  currentSearchQuery = val.trim().toLowerCase();
  renderGrid();
}

function clearSearch() {
  currentSearchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  renderGrid();
}

function handleSortChange(val) {
  currentSortBy = val;
  renderGrid();
}

function resetAllFilters() {
  maxRadiusFilter = 25;
  minRatingFilter = 0;
  activeCategoryFilter = 'All';
  currentSearchQuery = '';
  currentSortBy = 'distance';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'distance';

  updateProximityFilter(25);
  setRatingFilter(0);
  updateCategoryPills();
  renderGrid();
}

// ==========================================
// 12. RENDER Artisans360 STYLE PRODUCT GRID
// ==========================================

// ==========================================
// BUYER ARTISAN VOICE STORY AUDIO PLAYER
// ==========================================
let currentPlayingVoiceItemId = null;

function playArtisanVoiceStory(productId, event) {
  if (event) event.stopPropagation();

  const isProd = allProducts.find(p => p.id === productId);
  const isServ = allServices.find(s => s.id === productId);
  const item = isProd || isServ;
  if (!item) return;

  const synth = window.speechSynthesis;
  if (!synth) {
    alert('⚠️ Text-to-speech audio is not supported in this browser.');
    return;
  }

  // If already playing this item, toggle stop
  if (currentPlayingVoiceItemId === productId && synth.speaking) {
    synth.cancel();
    resetVoicePlayButton(productId);
    currentPlayingVoiceItemId = null;
    return;
  }

  // Stop any other currently playing speech
  synth.cancel();
  if (currentPlayingVoiceItemId) {
    resetVoicePlayButton(currentPlayingVoiceItemId);
  }

  // Build authentic artisan voice story
  const lang = currentAppLanguage || 'en';
  const multi = MULTILINGUAL_CRAFTS[productId];
  let spokenStory = '';

  if (multi && multi[lang] && multi[lang].speech) {
    spokenStory = multi[lang].speech;
  } else {
    const artisanName = item.sellerName || item.providerName || 'our master artisan';
    spokenStory = `Namaste! I am ${artisanName}. ${item.title}. ${item.description}. Handcrafted with traditional techniques and available directly from our workshop with zero middleman charges.`;
  }

  const utterance = new SpeechSynthesisUtterance(spokenStory);
  utterance.rate = 0.92;
  utterance.pitch = 1.05;

  const langCodeMap = { en: 'en-IN', gu: 'gu-IN', hi: 'hi-IN', mr: 'mr-IN' };
  utterance.lang = langCodeMap[lang] || 'en-IN';

  // Find natural Indian / regional voice if available
  const voices = synth.getVoices();
  const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India') || v.name.includes('Heera') || v.name.includes('Ravi'));
  if (indianVoice) {
    utterance.voice = indianVoice;
  }

  // Update button state to playing
  currentPlayingVoiceItemId = productId;
  setVoicePlayButtonActive(productId);

  utterance.onend = function() {
    resetVoicePlayButton(productId);
    currentPlayingVoiceItemId = null;
  };

  utterance.onerror = function() {
    resetVoicePlayButton(productId);
    currentPlayingVoiceItemId = null;
  };

  synth.speak(utterance);
  trackAdminEvent('Listened to Artisan Voice Story', `Product: ${item.title}`, `Played voice description for ${artisanName}`);
}

function setVoicePlayButtonActive(productId) {
  const btn = document.getElementById(`voicePlayBtn-${productId}`);
  const text = document.getElementById(`voiceText-${productId}`);
  const dot = document.getElementById(`voiceDot-${productId}`);

  if (btn) {
    btn.className = 'w-full py-1.5 px-2.5 bg-rose-50 text-rose-900 border border-rose-300 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm animate-pulse';
  }
  if (text) text.innerText = '⏹️ Playing Artisan Voice... (Click to Stop)';
  if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping';
}

function resetVoicePlayButton(productId) {
  const btn = document.getElementById(`voicePlayBtn-${productId}`);
  const text = document.getElementById(`voiceText-${productId}`);
  const dot = document.getElementById(`voiceDot-${productId}`);

  if (btn) {
    btn.className = 'w-full py-1.5 px-2.5 bg-ochre-50 hover:bg-ochre-100 text-ochre-900 border border-ochre-300 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm group/voice';
  }
  if (text) text.innerText = '🎧 Listen to Artisan Voice Story';
  if (dot) dot.className = 'w-2 h-2 rounded-full bg-ochre-500 group-hover/voice:scale-125 transition-transform';
}

function renderGrid() {
  const itemsGrid = document.getElementById('itemsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCountText = document.getElementById('resultsCountText');
  const activeSearchTag = document.getElementById('activeSearchTag');
  const activeSearchWord = document.getElementById('activeSearchWord');

  const sourceData = buyerActiveTab === 'products' ? allProducts : allServices;

  let filtered = sourceData.filter(item => {
    if (item.status === 'sold') return false;
    if (item.distanceKm > maxRadiusFilter) return false;
    if (item.rating < minRatingFilter) return false;
    if (activeCategoryFilter !== 'All' && item.category !== activeCategoryFilter) return false;

    if (currentSearchQuery) {
      const matchText = `${item.title} ${item.description} ${item.location} ${item.category} ${item.sellerName || item.providerName}`.toLowerCase();
      if (!matchText.includes(currentSearchQuery)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (currentSortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (currentSortBy === 'price-asc') return a.price - b.price;
    if (currentSortBy === 'price-desc') return b.price - a.price;
    if (currentSortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  document.getElementById('productCount').innerText = allProducts.filter(p => p.status === 'active').length;
  document.getElementById('serviceCount').innerText = allServices.filter(s => s.status === 'active').length;

  if (currentSearchQuery) {
    activeSearchTag.classList.remove('hidden');
    activeSearchWord.innerText = currentSearchQuery;
  } else {
    activeSearchTag.classList.add('hidden');
  }

  resultsCountText.innerText = `Showing ${filtered.length} artisan ${buyerActiveTab === 'products' ? 'crafts' : 'services'} within ${maxRadiusFilter} km`;

  if (filtered.length === 0) {
    itemsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

    itemsGrid.innerHTML = filtered.map(item => {
    const isProduct = item.type === 'product';
    const fallback = item.fallbackEmoji || '🏺';
    const isAvailable = isItemPurchasable(item);

    return `
      <div class="bg-white rounded-3xl gallery-card overflow-hidden transition-all duration-300 flex flex-col justify-between group border border-alabaster-300/80 hover:shadow-xl hover:border-ochre-300">
        <div>
          <!-- Image Banner -->
          <div class="relative h-52 w-full overflow-hidden bg-charcoal-950">
            ${
              item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">`
                : ''
            }
            <div class="${item.imageUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-950 to-charcoal-900 text-6xl">
              ${fallback}
            </div>

            <!-- Top Overlay Badges -->
            <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white backdrop-blur-md text-ochre-300 border border-charcoal-700/80 shadow-md">
                ${item.category}
              </span>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-black ${
                !isAvailable
                  ? 'bg-rose-900/90 text-rose-100 border border-rose-600'
                  : 'bg-emerald-900/90 text-emerald-100 border border-emerald-600'
              } backdrop-blur-md shadow-md flex items-center gap-1">
                ${!isAvailable ? '🔴 Closed (Crafting)' : '🟢 100% Handcrafted'}
              </span>
            </div>

            <!-- Distance Pill at bottom of image -->
            <div class="absolute bottom-2 left-3 pointer-events-none">
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-charcoal-950/80 backdrop-blur-md text-alabaster-200 border border-charcoal-800 flex items-center gap-1 shadow-sm">
                <i data-lucide="map-pin" class="w-3 h-3 text-ochre-400"></i>
                <span>${item.distanceKm} km • ${item.location}</span>
              </span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-4 space-y-2">
            <!-- Artisan / Seller Info -->
            <div class="flex items-center justify-between text-xs text-charcoal-700">
              <div class="flex items-center gap-1.5 font-bold text-charcoal-900 truncate">
                <div class="w-5 h-5 rounded-full bg-ochre-500 text-charcoal-950 flex items-center justify-center text-[10px] font-black">
                  ${(item.sellerName || item.providerName || 'A').charAt(0)}
                </div>
                <span class="truncate">${item.sellerName || item.providerName}</span>
              </div>
              <div class="flex items-center gap-1 font-bold text-charcoal-950 shrink-0">
                <i data-lucide="star" class="w-3.5 h-3.5 text-ochre-500 fill-ochre-500"></i>
                <span>${item.rating}</span>
                <span class="text-[10px] text-charcoal-700 font-normal">(${item.reviewsCount || 24})</span>
              </div>
            </div>

            <!-- Title -->
            <h3 class="font-bold text-charcoal-950 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
              ${item.title}
            </h3>

            <!-- Description -->
            <p class="text-xs text-charcoal-700 line-clamp-2 leading-relaxed">
              ${item.description}
            </p>

            <!-- 🎧 VOICE STORY BUTTON FOR BUYERS -->
            <div class="pt-1">
              <button 
                onclick="playArtisanVoiceStory('${item.id}', event)" 
                id="voicePlayBtn-${item.id}"
                class="w-full py-1.5 px-2.5 bg-ochre-50 hover:bg-ochre-100 text-ochre-900 border border-ochre-300 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm group/voice"
                title="Listen to the artisan speak this craft's story and details"
              >
                <span class="w-2 h-2 rounded-full bg-ochre-500 group-hover/voice:scale-125 transition-transform" id="voiceDot-${item.id}"></span>
                <i data-lucide="volume-2" class="w-3.5 h-3.5 text-ochre-600"></i>
                <span id="voiceText-${item.id}">🎧 Listen to Artisan Voice Story</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Card Footer & Actions -->
        <div class="p-4 pt-2 border-t border-alabaster-200 space-y-2.5 bg-alabaster-50/60">
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-[10px] text-charcoal-700 uppercase font-bold tracking-wider">Direct Artisan Price</span>
              <div class="text-base font-black text-charcoal-950">
                ₹${item.price.toLocaleString('en-IN')}<span class="text-xs font-normal text-charcoal-700">${item.priceUnit || ''}</span>
              </div>
            </div>
            <span class="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Zero Middleman Cut
            </span>
          </div>

          ${
            isProduct
              ? (
                !isAvailable
                  ? `
                    <!-- Closed Notice -->
                    <div class="space-y-1.5">
                      <div class="p-2 bg-rose-50 border border-rose-200 rounded-xl text-center">
                        <div class="text-[11px] font-black text-rose-800 flex items-center justify-center gap-1">
                          <i data-lucide="lock" class="w-3.5 h-3.5 text-rose-600"></i>
                          <span>Orders Currently Closed</span>
                        </div>
                        <p class="text-[10px] text-rose-600">Artisan is crafting in studio</p>
                      </div>
                      <button 
                        onclick="openChatModal('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${(item.sellerName || item.providerName).replace(/'/g, "\\'")}', '${item.type}')" 
                        class="w-full py-2 px-3 bg-white hover:bg-ochre-50 text-ochre-800 border border-ochre-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <i data-lucide="message-circle" class="w-3.5 h-3.5 text-ochre-600"></i>
                        <span>Pre-Order Inquiry</span>
                      </button>
                    </div>
                  `
                  : item.isOrdered
                  ? `
                    <button 
                      onclick="openDeliveryStatusModal()" 
                      class="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <i data-lucide="truck" class="w-4 h-4"></i>
                      <span>Track Live Delivery (OTP: ${item.orderOtp || 'Verified'})</span>
                    </button>
                  `
                  : `
                    <!-- Active Purchasing Action Grid -->
                    <div class="grid grid-cols-2 gap-2">
                      <button 
                        onclick="addToCart('${item.id}')" 
                        class="py-2.5 px-2 bg-alabaster-100 hover:bg-ochre-100 text-charcoal-900 border border-alabaster-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        title="Add item to Shopping Cart"
                      >
                        <i data-lucide="shopping-cart" class="w-3.5 h-3.5 text-ochre-600"></i>
                        <span>Add to Cart</span>
                      </button>

                      <button 
                        onclick="buyNowDirect('${item.id}')" 
                        class="py-2.5 px-2 bg-gradient-to-r from-ochre-500 to-ochre-600 hover:from-ochre-600 text-charcoal-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-ochre-500/20"
                        title="Proceed to 4-Step Checkout"
                      >
                        <i data-lucide="zap" class="w-3.5 h-3.5 text-charcoal-950 fill-charcoal-950"></i>
                        <span>BUY NOW</span>
                      </button>
                    </div>

                    <div class="flex items-center justify-between text-[11px] pt-1">
                      <button 
                        onclick="openChatModal('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${(item.sellerName || item.providerName).replace(/'/g, "\\'")}', '${item.type}')"
                        class="text-ochre-700 hover:text-ochre-900 font-bold flex items-center gap-1"
                      >
                        <i data-lucide="message-circle" class="w-3 h-3"></i>
                        <span>Ask Artisan</span>
                      </button>
                      <span class="text-charcoal-700 text-[10px]">🚚 Free Campus Delivery</span>
                    </div>
                  `
              )
              : `
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    onclick="openChatModal('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${(item.sellerName || item.providerName).replace(/'/g, "\\'")}', '${item.type}')" 
                    class="py-2 px-2 bg-white hover:bg-alabaster-50 text-charcoal-900 border border-alabaster-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <i data-lucide="message-circle" class="w-3.5 h-3.5 text-ochre-600"></i>
                    <span>Ask Artisan</span>
                  </button>
                  <button 
                    onclick="openNegotiateModal('${item.id}', '${item.title.replace(/'/g, "\\'")}', ${item.price}, '${(item.providerName).replace(/'/g, "\\'")}', '${item.location}')" 
                    class="py-2 px-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-ochre-400"></i>
                    <span>Book Workshop</span>
                  </button>
                </div>
              `
          }
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 13. DIRECT IN-APP CHAT
// ==========================================
const chatThreads = {};

function openChatModal(itemId, itemTitle, partnerName, itemType) {
  currentChatPartner = { itemId, itemTitle, partnerName, itemType };

  document.getElementById('chatPartnerName').innerText = partnerName;
  document.getElementById('chatPartnerInitial').innerText = partnerName.charAt(0).toUpperCase();
  document.getElementById('chatItemContext').innerText = `Re: ${itemTitle}`;

  if (!chatThreads[itemId]) {
    chatThreads[itemId] = [
      {
        sender: 'partner',
        text: `Namaste! I am ${partnerName}. Every piece is handcrafted in our Gujarat village cluster. Ask me anything about raw materials, custom sizes, or delivery!`,
        time: 'Just now'
      }
    ];
  }

  renderChatMessages(itemId);
  document.getElementById('chatModal').classList.remove('hidden');

  trackAdminEvent('Initiated Chat with Artisan', 'In-App Direct Chat', `Buyer asked questions regarding "${itemTitle}" to ${partnerName}`);
  if (window.lucide) lucide.createIcons();
}

function closeChatModal() {
  document.getElementById('chatModal').classList.add('hidden');
}

function renderChatMessages(itemId) {
  const container = document.getElementById('chatMessagesContainer');
  const msgs = chatThreads[itemId] || [];

  container.innerHTML = msgs.map(m => {
    const isMe = m.sender === 'me';
    return `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1">
        <div class="max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${
          isMe 
            ? 'bg-charcoal-900 text-white rounded-br-none shadow-sm' 
            : 'bg-white text-charcoal-900 border border-alabaster-300 rounded-bl-none shadow-sm'
        }">
          <p>${m.text}</p>
        </div>
        <span class="text-[10px] text-charcoal-700 px-1">${m.time}</span>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatTextInput');
  const text = input.value.trim();
  if (!text || !currentChatPartner) return;

  const itemId = currentChatPartner.itemId;
  chatThreads[itemId].push({
    sender: 'me',
    text: text,
    time: 'Just now'
  });

  trackAdminEvent('Sent Direct In-App Message', 'In-App Chat Stream', `Message: "${text}"`);
  input.value = '';
  renderChatMessages(itemId);

  setTimeout(() => {
    chatThreads[itemId].push({
      sender: 'partner',
      text: `Thank you! Yes, this is 100% genuine handcrafted Gujarat heritage quality. Our verified delivery partner Ramesh Patel will pick it up from our workshop and deliver with direct OTP verification.`,
      time: 'Just now'
    });
    renderChatMessages(itemId);
  }, 1200);
}

function sendPredefinedMessage(text) {
  const input = document.getElementById('chatTextInput');
  if (input) {
    input.value = text;
    handleSendMessage({ preventDefault: () => {} });
  }
}

// ==========================================
// 14. NEGOTIATION & DELIVERY
// ==========================================
function openNegotiateModal(id, title, price, provider, location) {
  currentNegotiationItem = { id, title, price, provider, location };

  document.getElementById('negotiateServiceName').innerText = title;
  document.getElementById('negotiateServiceProvider').innerText = `${provider} • ${location}`;
  document.getElementById('negotiateOriginalPrice').innerHTML = `&#8377;${price}`;
  document.getElementById('proposedPriceInput').value = Math.max(50, price - 30);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('serviceDateInput').value = tomorrow.toISOString().split('T')[0];

  document.getElementById('negotiateModal').classList.remove('hidden');
  trackAdminEvent('Opened Negotiation Modal', `Service: ${title}`, `Proposed price negotiation with ${provider}`);
  if (window.lucide) lucide.createIcons();
}

function closeNegotiateModal() {
  document.getElementById('negotiateModal').classList.add('hidden');
}

function confirmNegotiationAndBooking() {
  const offer = document.getElementById('proposedPriceInput').value;
  const date = document.getElementById('serviceDateInput').value;
  const time = document.getElementById('serviceTimeSelect').value;
  const location = document.getElementById('serviceLocationNote').value || 'UTU Campus Gate';

  if (!offer || offer <= 0) {
    alert('Please enter a valid proposed offer.');
    return;
  }

  const booking = {
    id: `book-${Date.now()}`,
    itemTitle: currentNegotiationItem.title,
    proposedPrice: parseInt(offer, 10),
    originalPrice: currentNegotiationItem.price,
    date,
    time,
    location,
    otp: Math.floor(1000 + Math.random() * 9000),
    status: 'Direct Artisan Confirmed',
    deliveryBoy: 'Ramesh Patel (Verified Local Partner)'
  };

  activeDeliveries.unshift(booking);
  saveState();
  updateDeliveryBadge();
  closeNegotiateModal();

  trackAdminEvent('Direct Artisan Booking Confirmed', `Scheduled Slot: ${date} (${time})`, `Offer ₹${offer} at ${location}`);
  alert(`🎉 Direct Artisan Booking Confirmed!\n\nScheduled for ${date} (${time}) at ${location}.\nVerification OTP: ${booking.otp}\nAssigned Delivery Partner: ${booking.deliveryBoy}`);
  openDeliveryStatusModal();
}

function openDeliveryStatusModal() {
  document.getElementById('deliveryModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeDeliveryStatusModal() {
  document.getElementById('deliveryModal').classList.add('hidden');
}

function updateDeliveryBadge() {
  const badge = document.getElementById('activeDeliveryBadge');
  const count = document.getElementById('activeDeliveryCount');
  if (activeDeliveries.length > 0) {
    badge.classList.remove('hidden');
    count.classList.remove('hidden');
    count.innerText = activeDeliveries.length;
  } else {
    badge.classList.add('hidden');
    count.classList.add('hidden');
  }
}

// ==========================================
// 15. SELLER LISTINGS MANAGEMENT
// ==========================================
function renderSellerDashboard() {
  const myListingsGrid = document.getElementById('myListingsGrid');
  const sellerInboxList = document.getElementById('sellerInboxList');
  const activeCountHeader = document.getElementById('myListingsCountHeader');
  const sellerActiveListingsCount = document.getElementById('sellerActiveListingsCount');

  const myListings = allProducts.filter(p => p.isMyListing);
  activeCountHeader.innerText = myListings.length;
  sellerActiveListingsCount.innerText = myListings.filter(p => p.status === 'active').length;

  myListingsGrid.innerHTML = myListings.map(item => `
    <div class="bg-white rounded-2xl gallery-card p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-charcoal-900 flex-shrink-0">
            ${
              item.imageUrl
                ? `<img src="${item.imageUrl}" class="w-full h-full object-cover">`
                : `<span class="flex items-center justify-center h-full text-xl">${item.fallbackEmoji || '📦'}</span>`
            }
          </div>
          <div>
            <h4 class="font-bold text-charcoal-950 text-xs truncate max-w-[170px]">${item.title}</h4>
            <p class="text-[11px] text-charcoal-700">${item.location}</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${
          item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-alabaster-200 text-charcoal-700'
        }">
          ${item.status.toUpperCase()}
        </span>
      </div>

      <div class="flex items-center justify-between text-xs pt-1 border-t border-alabaster-200">
        <span class="font-black text-charcoal-950 text-sm">₹${item.price}</span>
        <span class="text-charcoal-700 text-[11px]">${item.category}</span>
      </div>

      <div class="grid grid-cols-4 gap-1 pt-2">
        <button 
          onclick="toggleItemStatus('${item.id}')" 
          class="px-1.5 py-1.5 ${item.status === 'active' ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'} rounded-lg text-[10px] font-black transition-colors"
          title="Pause or Resume Buyer Orders"
        >
          ${item.status === 'active' ? '🔴 Pause' : '🟢 Open'}
        </button>
        <button 
          onclick="openEditListingModal('${item.id}')" 
          class="px-1.5 py-1.5 bg-alabaster-100 hover:bg-ochre-100 text-charcoal-800 hover:text-charcoal-950 border border-alabaster-300 rounded-lg text-[10px] font-bold transition-colors"
        >
          Edit
        </button>
        <button 
          onclick="repostListing('${item.id}')" 
          class="px-1.5 py-1.5 bg-ochre-50 hover:bg-ochre-100 text-ochre-800 border border-ochre-200 rounded-lg text-[10px] font-bold transition-colors"
        >
          Re-post
        </button>
        <button 
          onclick="deleteListing('${item.id}')" 
          class="px-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  `).join('');

  sellerInboxList.innerHTML = sellerInbox.map(conv => `
    <div class="bg-alabaster-50 border border-alabaster-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-ochre-100 text-charcoal-950 border border-ochre-300 font-black text-xs flex items-center justify-center">
            ${conv.buyerName.charAt(0)}
          </div>
          <div>
            <h5 class="font-bold text-charcoal-950 text-xs">${conv.buyerName}</h5>
            <p class="text-[11px] text-charcoal-700">${conv.buyerLocation} • ${conv.time}</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
          conv.status === 'dispatched' 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-ochre-100 text-charcoal-950'
        }">
          ${conv.status === 'dispatched' ? 'DISPATCHED' : 'DIRECT INQUIRY'}
        </span>
      </div>

      <div class="bg-white p-3 rounded-xl border border-alabaster-200 text-xs space-y-1">
        <div class="flex items-center justify-between font-bold">
          <span class="text-charcoal-900">${conv.itemName}</span>
          <span class="text-ochre-700">Offered: ₹${conv.proposedOffer}</span>
        </div>
        <p class="text-charcoal-700 text-[11px] italic">"${conv.message}"</p>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        ${
          conv.status !== 'dispatched'
            ? `
              <button 
                onclick="acceptBuyerOfferAndShip('${conv.id}', '${conv.itemName}', ${conv.proposedOffer})" 
                class="px-4 py-1.5 bg-gradient-to-r from-ochre-500 to-ochre-600 hover:from-ochre-600 text-charcoal-950 font-black rounded-xl text-xs shadow-sm transition-all flex items-center gap-1"
              >
                <i data-lucide="truck" class="w-3.5 h-3.5"></i>
                <span>Accept Offer & Dispatch to Delivery Boy</span>
              </button>
            `
            : `
              <button 
                onclick="markOrderAsSold('${conv.id}')" 
                class="px-4 py-1.5 bg-charcoal-950 hover:bg-charcoal-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Mark as Sold
              </button>
            `
        }
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}


// ==========================================
// SELLER PRODUCT IMAGE UPLOADER & HANDLERS
// ==========================================

// ==========================================
// AI PHOTO ANALYSIS & AUTO-FILL ENGINE
// ==========================================
const CRAFT_PRESET_METADATA = {
  'images/bandhani.jpg': {
    title: 'Pure Gaji Silk Bandhani Dupatta (Natural Madder & Indigo Dye)',
    price: 850,
    category: 'Bandhani & Silk',
    location: 'Khatri Bandhani Weavers (6.5 km)',
    sellerName: 'Geetaben Khatri (Bandhani Maker)',
    description: '100% pure silk tie-dye handcrafted with over 5,000 micro bindis using traditional Khatri resist-dyeing and natural madder dyes. Direct artisan heritage piece with zero middleman markup.'
  },
  'images/pottery.jpg': {
    title: 'Handcrafted Terracotta Clay Water Jug & Tumbler Set',
    price: 290,
    category: 'Pottery',
    location: 'Ten Village Potter Cluster (4.5 km)',
    sellerName: 'Kanubhai Prajapati (Master Potter)',
    description: 'Eco-friendly natural clay pottery hand-thrown on potters wheel and wood-kiln fired for natural alkaline water cooling. Zero chemical glaze, 100% healthy clay.'
  },
  'images/saree.jpg': {
    title: 'Authentic Gujarat Handloom Saree with Heritage Mirror Work & Border',
    price: 1450,
    category: 'Kutch Handloom',
    location: 'Kutch Handloom Guild (14.0 km)',
    sellerName: 'Deviben Vankar (Master Weaver)',
    description: 'Pure breathable organic handloom cotton saree woven on traditional pit looms featuring authentic Abhala mirror-work and tribal borders. Hand-dyed using organic vegetable pigments.'
  },
  'images/dandiya.jpg': {
    title: 'Hand-Painted Sankheda Lacquered Wooden Dandiya Sticks (Pair)',
    price: 340,
    category: 'Sankheda Woodcraft',
    location: 'Sankheda Lacquer Woodcraft (18.0 km)',
    sellerName: 'Rameshbhai Suthar (Wood Artisan)',
    description: 'Turned teakwood sticks hand-lacquered with natural organic tree resin and tin-foil floral motifs for festive Garba and cultural dance. Smooth balanced grip.'
  },
  'images/wallhanging.jpg': {
    title: 'Traditional Embroidered Peacock Mirror-Work Wall Hanging (Abhala Toran)',
    price: 620,
    category: 'Wall Hanging',
    location: 'Rabari Mirror-Work Colony (8.0 km)',
    sellerName: 'Jiviben Rabari (Embroidery Artisan)',
    description: 'Authentic Rabari community needlework wall art with authentic glass mirrors, silk thread tassels, and protective peacock motifs. Brings auspicious blessing to living spaces.'
  },
  'images/copperbells.jpg': {
    title: 'Hand-Tuned Rustic Kutch Copper Wind Bells with Wooden Elephants',
    price: 480,
    category: 'Copper Bells',
    location: 'Nirona Copper Bell Smith (11.5 km)',
    sellerName: 'Husain Luhar (Copper Bell Smith)',
    description: 'Waste metal and copper-coated musical bells tuned by ear by master Luhar smiths, paired with hand-carved wooden elephant wind chimes. Resonant soothing tone.'
  }
};

function aiAutoFillListingDetailsFromPhoto(imageIdentifier, customFileName = '') {
  let profile = CRAFT_PRESET_METADATA[imageIdentifier];

  if (!profile) {
    // Smart heuristic for custom uploaded files
    const lowerName = customFileName.toLowerCase();
    if (lowerName.includes('bandhani') || lowerName.includes('dupatta') || lowerName.includes('silk')) {
      profile = CRAFT_PRESET_METADATA['images/bandhani.jpg'];
    } else if (lowerName.includes('pot') || lowerName.includes('matka') || lowerName.includes('clay') || lowerName.includes('jug')) {
      profile = CRAFT_PRESET_METADATA['images/pottery.jpg'];
    } else if (lowerName.includes('saree') || lowerName.includes('cloth') || lowerName.includes('dress')) {
      profile = CRAFT_PRESET_METADATA['images/saree.jpg'];
    } else if (lowerName.includes('dandiya') || lowerName.includes('stick') || lowerName.includes('wood')) {
      profile = CRAFT_PRESET_METADATA['images/dandiya.jpg'];
    } else if (lowerName.includes('wall') || lowerName.includes('mirror') || lowerName.includes('toran')) {
      profile = CRAFT_PRESET_METADATA['images/wallhanging.jpg'];
    } else if (lowerName.includes('bell') || lowerName.includes('metal') || lowerName.includes('copper')) {
      profile = CRAFT_PRESET_METADATA['images/copperbells.jpg'];
    } else {
      // Generic AI smart generated profile
      profile = {
        title: 'Authentic Handcrafted Artisan Heritage Creation',
        price: 750,
        category: 'Bandhani & Silk',
        location: 'Khatri Bandhani Weavers (6.5 km)',
        sellerName: (currentUser && currentUser.role === 'seller' ? currentUser.name : 'Master Artisan'),
        description: 'Authentic regional handcrafted piece made using traditional Gujarat artisan techniques and natural raw materials. 100% direct artisan compensation with zero middleman deduction.'
      };
    }
  }

  // Populate form fields
  const titleInput = document.getElementById('listingTitleInput');
  const priceInput = document.getElementById('listingPriceInput');
  const categorySelect = document.getElementById('listingCategorySelect');
  const locationSelect = document.getElementById('listingLocationSelect');
  const sellerNameInput = document.getElementById('listingSellerNameInput');
  const descInput = document.getElementById('listingDescInput');
  const banner = document.getElementById('aiAutoFilledNoticeBanner');

  if (titleInput) titleInput.value = profile.title;
  if (priceInput) priceInput.value = profile.price;
  if (categorySelect) categorySelect.value = profile.category;
  if (locationSelect) locationSelect.value = profile.location;
  if (sellerNameInput && (!sellerNameInput.value || sellerNameInput.value.includes('Bandhani'))) {
    sellerNameInput.value = currentUser && currentUser.role === 'seller' ? currentUser.name : profile.sellerName;
  }
  if (descInput) descInput.value = profile.description;

  if (banner) {
    banner.classList.remove('hidden');
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (window.lucide) lucide.createIcons();
  speakFeedback('AI analyzed photo and auto-filled title, fair price, and description. You can verify and edit before publishing.');
  trackAdminEvent('AI Auto-Filled Listing Details', 'Artisan Studio', `Generated for: "${profile.title}" (₹${profile.price})`);
}

function triggerAIAutoFill() {
  const hiddenInput = document.getElementById('listingImageUrlHidden');
  const currentImg = hiddenInput ? hiddenInput.value : 'images/bandhani.jpg';
  aiAutoFillListingDetailsFromPhoto(currentImg, 'custom');
}

function handleListingImageFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('⚠️ Image size exceeds 5MB. Please choose a smaller photo.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const previewImg = document.getElementById('listingImagePreviewImg');
    const placeholder = document.getElementById('listingImagePlaceholder');
    const hiddenInput = document.getElementById('listingImageUrlHidden');

    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.classList.remove('hidden');
    }
    if (placeholder) placeholder.classList.add('hidden');
    if (hiddenInput) hiddenInput.value = dataUrl;

    trackAdminEvent('Uploaded Craft Photo', 'Artisan Studio', `File: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    // Automatically trigger AI detail population from uploaded photo
    aiAutoFillListingDetailsFromPhoto(dataUrl, file.name);
  };
  reader.readAsDataURL(file);
}

function setListingPresetImage(imagePath) {
  const previewImg = document.getElementById('listingImagePreviewImg');
  const placeholder = document.getElementById('listingImagePlaceholder');
  const hiddenInput = document.getElementById('listingImageUrlHidden');

  if (previewImg) {
    previewImg.src = imagePath;
    previewImg.classList.remove('hidden');
  }
  if (placeholder) placeholder.classList.add('hidden');
  if (hiddenInput) hiddenInput.value = imagePath;

  // Trigger AI Auto-Fill for preset craft
  aiAutoFillListingDetailsFromPhoto(imagePath);
}

function clearListingImage() {
  const previewImg = document.getElementById('listingImagePreviewImg');
  const placeholder = document.getElementById('listingImagePlaceholder');
  const hiddenInput = document.getElementById('listingImageUrlHidden');
  const fileInput = document.getElementById('listingImageFileInput');

  if (previewImg) {
    previewImg.src = '';
    previewImg.classList.add('hidden');
  }
  if (placeholder) placeholder.classList.remove('hidden');
  if (hiddenInput) hiddenInput.value = '';
  if (fileInput) fileInput.value = '';
}

function openCreateListingModal() {
  document.getElementById('editingListingId').value = '';
  document.getElementById('listingModalTitle').innerText = '+ Post Handcrafted Item or Service';
  const banner = document.getElementById('aiAutoFilledNoticeBanner');
  if (banner) banner.classList.add('hidden');
  setListingPresetImage('images/bandhani.jpg');
  document.getElementById('listingTitleInput').value = '';
  document.getElementById('listingPriceInput').value = '';
  document.getElementById('listingDescInput').value = '';
  document.getElementById('listingModal').classList.remove('hidden');
}

function openEditListingModal(id) {
  const item = allProducts.find(p => p.id === id);
  if (!item) return;

  document.getElementById('editingListingId').value = id;
  document.getElementById('listingModalTitle').innerText = 'Edit Craft Details';
  document.getElementById('listingTitleInput').value = item.title;
  document.getElementById('listingPriceInput').value = item.price;
  document.getElementById('listingDescInput').value = item.description;
  document.getElementById('listingCategorySelect').value = item.category;

  document.getElementById('listingModal').classList.remove('hidden');
}

function closeListingModal() {
  document.getElementById('listingModal').classList.add('hidden');
}


// ==========================================
// VOICE & TEXT DESCRIPTION ENGINE (SPEECH-TO-TEXT & AI POLISH)
// ==========================================
let listingSpeechRecognizer = null;
let isListingVoiceRecording = false;

function toggleListingVoiceDictation() {
  if (isListingVoiceRecording) {
    stopListingVoiceDictation();
    return;
  }
  startListingVoiceDictation();
}

function startListingVoiceDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('⚠️ Speech recognition is not supported in this browser. You can type or use the quick voice samples below!');
    return;
  }

  try {
    listingSpeechRecognizer = new SpeechRecognition();
    listingSpeechRecognizer.continuous = true;
    listingSpeechRecognizer.interimResults = true;
    listingSpeechRecognizer.lang = listingVoiceDictationLang || "en-IN";

    listingSpeechRecognizer.onstart = function() {
      isListingVoiceRecording = true;
      document.getElementById('listingVoiceListeningStatus')?.classList.remove('hidden');
      const btnText = document.getElementById('listingVoiceBtnText');
      const btn = document.getElementById('listingVoiceRecordBtn');
      if (btnText) btnText.innerText = '⏹️ Stop Recording';
      if (btn) btn.classList.add('ring-2', 'ring-rose-500', 'bg-rose-950');
      speakFeedback('Listening to your voice. Please describe your craft.');
    };

    listingSpeechRecognizer.onresult = function(event) {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      const descInput = document.getElementById('listingDescInput');
      if (descInput && transcript.trim()) {
        descInput.value = transcript.trim();
      }
    };

    listingSpeechRecognizer.onerror = function(err) {
      console.warn('Speech recognition error:', err);
      stopListingVoiceDictation();
    };

    listingSpeechRecognizer.onend = function() {
      stopListingVoiceDictation();
    };

    listingSpeechRecognizer.start();
  } catch (e) {
    console.error('Speech recognition start error:', e);
    stopListingVoiceDictation();
  }
}

function stopListingVoiceDictation() {
  if (listingSpeechRecognizer) {
    try { listingSpeechRecognizer.stop(); } catch(e){}
  }
  isListingVoiceRecording = false;
  document.getElementById('listingVoiceListeningStatus')?.classList.add('hidden');
  const btnText = document.getElementById('listingVoiceBtnText');
  const btn = document.getElementById('listingVoiceRecordBtn');
  if (btnText) btnText.innerText = '🎙️ Speak (Voice)';
  if (btn) btn.classList.remove('ring-2', 'ring-rose-500', 'bg-rose-950');
}

function simulateVoiceDictation(spokenText) {
  const descInput = document.getElementById('listingDescInput');
  if (descInput) {
    descInput.value = '';
    let charIdx = 0;
    document.getElementById('listingVoiceListeningStatus')?.classList.remove('hidden');
    const interval = setInterval(() => {
      if (charIdx < spokenText.length) {
        descInput.value += spokenText.charAt(charIdx);
        charIdx++;
      } else {
        clearInterval(interval);
        document.getElementById('listingVoiceListeningStatus')?.classList.add('hidden');
        enhanceDescriptionWithAI();
      }
    }, 15);
  }
}

function enhanceDescriptionWithAI() {
  const descInput = document.getElementById('listingDescInput');
  if (!descInput) return;
  const rawText = descInput.value.trim();
  if (!rawText) {
    alert('⚠️ Please speak or type some craft keywords first, then click AI Polish!');
    return;
  }

  let polished = '';
  const lower = rawText.toLowerCase();

  if (lower.includes('bandhani') || lower.includes('silk') || lower.includes('bindi')) {
    polished = '100% pure lustrous silk handcrafted using traditional Khatri resist-dyeing technique (over 5,000 micro bindis). Naturally dyed in rich crimson and saffron tones with authentic zero-middleman artisan linkage.';
  } else if (lower.includes('matka') || lower.includes('clay') || lower.includes('pot') || lower.includes('pottery') || lower.includes('jug')) {
    polished = 'Eco-friendly natural clay pottery hand-thrown on potters wheel and wood-kiln fired for natural alkaline water cooling. Zero chemical glaze, 100% healthy living clay from Ten Village potter cluster.';
  } else if (lower.includes('saree') || lower.includes('cotton') || lower.includes('loom') || lower.includes('kutch')) {
    polished = 'Pure breathable organic handloom cotton saree woven on traditional pit looms featuring authentic Abhala mirror-work and tribal borders. Hand-dyed using organic vegetable pigments.';
  } else if (lower.includes('dandiya') || lower.includes('sankheda') || lower.includes('wood') || lower.includes('garba')) {
    polished = 'Turned teakwood sticks hand-lacquered with natural organic tree resin and tin-foil floral motifs for festive Garba and cultural dance. Smooth balanced grip and vibrant festive finish.';
  } else if (lower.includes('wall') || lower.includes('mirror') || lower.includes('toran') || lower.includes('peacock')) {
    polished = 'Authentic Rabari community needlework wall art with authentic glass mirrors, silk thread tassels, and protective peacock motifs. Brings auspicious traditional blessings to living spaces.';
  } else if (lower.includes('bell') || lower.includes('copper') || lower.includes('chime')) {
    polished = 'Waste metal and copper-coated musical bells tuned by ear by master Luhar smiths, paired with hand-carved wooden elephant wind chimes. Produces resonant, soothing rustic tones.';
  } else {
    polished = `Master artisan creation handcrafted in the Bardoli cluster: ${rawText}. Made with authentic traditional raw materials, natural dyes, and 100% direct artisan compensation.`;
  }

  descInput.value = polished;
  speakFeedback('AI polished your spoken description into a rich artisan heritage story!');
}

function speakListingDescriptionAloud() {
  const descInput = document.getElementById('listingDescInput');
  const text = descInput ? descInput.value.trim() : '';
  if (!text) {
    alert('⚠️ No description text to read aloud. Please type or speak some description first.');
    return;
  }
  speakFeedback(text);
}

function handleSaveListing(e) {
  e.preventDefault();
  const id = document.getElementById('editingListingId').value;
  const title = document.getElementById('listingTitleInput').value.trim();
  const price = parseInt(document.getElementById('listingPriceInput').value, 10);
  const category = document.getElementById('listingCategorySelect').value;
  const location = document.getElementById('listingLocationSelect').value;
  const sellerName = document.getElementById('listingSellerNameInput').value.trim() || 'Artisan';
  const desc = document.getElementById('listingDescInput').value.trim();

  const kmMatch = location.match(/([\d\.]+)\s*km/);
  const distanceKm = kmMatch ? parseFloat(kmMatch[1]) : 6.5;

  if (id) {
    const item = allProducts.find(p => p.id === id);
    if (item) {
      item.title = title;
      item.price = price;
      item.category = category;
      item.location = location;
      item.distanceKm = distanceKm;
      item.description = desc;
    }
  } else {
    const newListing = {
      id: `prod-${Date.now()}`,
      title: title,
      category: category,
      price: price,
      rating: 5.0,
      reviewsCount: 1,
      distanceKm: distanceKm,
      location: location,
      sellerName: sellerName,
      description: desc,
      imageUrl: category.includes('Bandhani') 
        ? 'images/bandhani.jpg'
        : category.includes('Pottery')
        ? 'images/pottery.jpg'
        : category.includes('Wall')
        ? 'images/wallhanging.jpg'
        : category.includes('Saree')
        ? 'images/saree.jpg'
        : category.includes('Dandiya')
        ? 'images/dandiya.jpg'
        : 'images/copperbells.jpg',
      fallbackEmoji: '📦',
      type: 'product',
      status: 'active',
      isOrdered: false,
      orderOtp: null,
      isMyListing: true
    };
    allProducts.unshift(newListing);
  }

  saveState();
  persistProductToDB(isProduct ? allProducts[0] : allServices[0]);
  closeListingModal();
  renderSellerDashboard();
  renderGrid();

  trackAdminEvent('Created/Edited Craft Listing', `Listing: ${title}`, `Artisan published ${title} for ₹${price}`);
  alert('✅ Handcrafted listing published successfully!');
}


function toggleItemStatus(id) {
  const item = allProducts.find(p => p.id === id);
  if (!item) return;

  if (item.status === 'active') {
    item.status = 'paused';
    trackAdminEvent('Paused Product Orders', `Product: ${item.title}`, 'Artisan closed ordering for this item');
    alert(`🔴 Orders paused for "${item.title}". Buyers cannot buy this item until you resume.`);
  } else {
    item.status = 'active';
    trackAdminEvent('Resumed Product Orders', `Product: ${item.title}`, 'Artisan reopened ordering for this item');
    alert(`🟢 Orders reopened for "${item.title}". Buyers can now add to cart and purchase!`);
  }

  saveState();
  deleteProductFromDB(id);
  renderSellerDashboard();
  renderGrid();
}

function repostListing(id) {
  const item = allProducts.find(p => p.id === id);
  if (item) {
    item.status = 'active';
    item.isOrdered = false;
    item.orderOtp = null;
    allProducts = [item, ...allProducts.filter(p => p.id !== id)];
    saveState();
    renderSellerDashboard();
    renderGrid();
    trackAdminEvent('Re-posted Craft Listing', `Listing: ${item.title}`, 'Artisan refreshed listing visibility');
    alert(`🔄 "${item.title}" refreshed to top of marketplace!`);
  }
}

function deleteListing(id) {
  const item = allProducts.find(p => p.id === id);
  if (confirm('Delete this handcrafted listing?')) {
    allProducts = allProducts.filter(p => p.id !== id);
    saveState();
    renderSellerDashboard();
    renderGrid();
    trackAdminEvent('Deleted Listing', `Listing: ${item ? item.title : id}`, 'Removed from active market feed');
    alert('🗑️ Listing deleted successfully.');
  }
}

function acceptBuyerOfferAndShip(convId, itemName, offerPrice) {
  const conv = sellerInbox.find(c => c.id === convId);
  if (conv) {
    conv.status = 'dispatched';
    saveState();
    renderSellerDashboard();

    const otp = Math.floor(1000 + Math.random() * 9000);
    trackAdminEvent('Artisan Dispatched with Delivery Boy', `Order: ${itemName}`, `Dispatched to Ramesh Patel (OTP ${otp})`);
    alert(`🚚 Assigned Local Delivery Partner Ramesh Patel to pick up "${itemName}" from your workshop!\n\nBuyer will pay ₹${offerPrice} cash on delivery with OTP ${otp}.`);
  }
}

function markOrderAsSold(convId) {
  sellerInbox = sellerInbox.filter(c => c.id !== convId);
  saveState();
  renderSellerDashboard();
  trackAdminEvent('Artisan Marked Order Sold', 'Artisan Inbox', 'Fulfilled order');
  alert('🎉 Order marked as Sold! Earnings added to your artisan account.');
}

function openDemoGuideModal() {
  document.getElementById('demoGuideModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeDemoGuideModal() {
  document.getElementById('demoGuideModal').classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', initApp);

// Checkout Function Aliases
const openSecureCheckoutModal = typeof openCheckoutModal !== 'undefined' ? openCheckoutModal : null;
const closeSecureCheckoutModal = typeof closeCheckoutModal !== 'undefined' ? closeCheckoutModal : null;
const proceedToSecureCheckout = typeof proceedToCheckout !== 'undefined' ? proceedToCheckout : null;
const confirmAndPlaceSecureOrder = typeof confirmAndPlaceOrder !== 'undefined' ? confirmAndPlaceOrder : null;
