/* =========================================
   VANTAGE HOME - Premium Furniture Store
   Main JavaScript File
   ========================================= */

const CONFIG = {
    FORMSPREE_ENDPOINT: "https://formspree.io/f/xpqbybjd",
    PRODUCTS_JSON: "products.json",
    FREE_DELIVERY_THRESHOLD: 500,
    DELIVERY_FEE: 0,         // Belgium: FREE (base)
    COUNTRY_SURCHARGE: 30,   // All non-BE countries: +€30
    NL_SPECIAL_SURCHARGE: 50 // NL postcodes 7xxx/8xxx: +€50
};

// Promo codes — discount in euros, note is shown in order email
const PROMO_CODES = {
    "TEAM10":  { discount: 10,  label: "Team Referral – €10 off" },
    "TEAM20":  { discount: 20,  label: "Team Referral – €20 off" },
    "TEAM50":  { discount: 50,  label: "Team Referral – €50 off" },
    "VIP30":   { discount: 30,  label: "VIP Customer – €30 off" },
    "WELCOME": { discount: 15,  label: "Welcome Discount – €15 off" }
};

// Mattress models and their price uplifts vs. "UK model" (included in base price)
const MATTRESS_MODELS = [
    { id: "uk",     label: "Orthopaedic Spring (included)",    uplift: 0  },
    { id: "tspring",label: "Turkish Spring Mattress (+€10)",   uplift: 10 },
    { id: "tfoam",  label: "Turkish Foam Mattress (+€20)",     uplift: 20 }
];

// =========================================
// BED SIZES
// =========================================
const BED_SIZES = ["90x200", "140x200", "160x200", "180x200"];
const BED_SIZES_LARGE_ONLY = ["140x200", "160x200", "180x200"];
const LARGE_ONLY_STYLES = ["florida-panel", "sleigh-hilton", "butterfly"];
const BED_SIZE_LABELS = {
    "90x200":  "Single (90×200 cm)",
    "140x200": "Small Double (140×200 cm)",
    "160x200": "Queen (160×200 cm)",
    "180x200": "King (180×200 cm)"
};

// =========================================
// DELIVERY ZONES
// =========================================
const deliveryZones = {
    BE: { name: "Belgium",     flag: "be", fullCoverage: true,  surcharge: 0  },
    NL: { name: "Netherlands", flag: "nl", fullCoverage: true,  surcharge: 30 },
    LU: { name: "Luxembourg",  flag: "lu", fullCoverage: true,  surcharge: 30 },
    FR: {
        name: "France", flag: "fr", fullCoverage: false, surcharge: 30,
        validPrefixes: ["02","08","54","57","59","60","62"],
        message: "We deliver to northern France only (postcodes starting with: 02, 08, 54, 57, 59, 60, 62).",
        excludedPrefixes: []
    },
    DE: {
        name: "Germany", flag: "de", fullCoverage: false, surcharge: 30,
        validPrefixes: ["4","5","6","7"],
        message: "We deliver to parts of Germany (postcodes starting with 4, 5, 6 or 7). Excluded: 48xx, 49xx, 54xx, 55xx, 56xx.",
        excludedPrefixes: ["48","49","54","55","56"]
    }
};

// =========================================
// DELIVERY SCHEDULE
// =========================================
const deliverySchedule = [
    { day: "Monday",    emoji: "🚚", routes: ["Belgium postcodes: 2xxx", "Netherlands: 1xxx, 2xxx, 3xxx, 4xxx"] },
    { day: "Tuesday",   emoji: "🚚", routes: ["Belgium postcodes: 3xxx", "Netherlands: 50xx–56xx, 65xx–69xx, 7xxx, 8xxx (excl. 84xx–89xx)"] },
    { day: "Wednesday", emoji: "🚚", routes: ["Belgium postcodes: 4xxx", "Germany: 4xxxx, 5xxxx, 6xxxx, 7xxxx (excl. 48xx, 49xx, 54xx, 55xx, 56xx)"] },
    { day: "Thursday",  emoji: "🚚", routes: ["Belgium: 1xxx, 7xxx, 8xxx, 9xxx", "France: 59xxx, 60xxx, 62xxx postcodes"] },
    { day: "Friday",    emoji: "🚚", routes: ["Belgium: 5xxx, 6xxx"] },
    { day: "Saturday",  emoji: "🚚", routes: ["Luxembourg (all postcodes)", "France: 02xxx, 08xxx, 54xxx, 57xxx postcodes"] },
    { day: "Sunday",    emoji: "🏭", routes: ["Warehouse Updating – No Deliveries"] }
];

let products = [];

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f0ede8' width='800' height='600'/%3E%3Ctext fill='%23b8944a' font-family='Georgia' font-size='22' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EAdd your photo here%3C/text%3E%3C/svg%3E";

// =========================================
// LOAD PRODUCTS FROM JSON
// =========================================
async function loadProducts() {
    try {
        const resp = await fetch(CONFIG.PRODUCTS_JSON);
        if (!resp.ok) throw new Error("Could not load products.json");
        const data = await resp.json();
        products = data.map(p => ({
            ...p,
            id: p.legacyId || p.id,
            image: (p.images && p.images[0]) || PLACEHOLDER,
            images: (p.images && p.images.length) ? p.images : [PLACEHOLDER],
            price: p.price || (p.basePrice ? Math.min(...Object.values(p.basePrice)) : 0)
        }));
        return products;
    } catch (err) {
        console.warn("products.json not found – using fallback.", err);
        products = getFallbackProducts();
        return products;
    }
}

function getFallbackProducts() {
    return [
        { id:1, legacyId:1, name:"Premium Divan Bed Set with High-Quality Mattress", category:"beds", style:"divan", productType:"bed-frame", badge:"Bestseller", description:"Premium velvet upholstered divan bed with padded headboard and optional storage drawers. Mattress included.", basePrice:{"90x200":355,"140x200":385,"160x200":400,"180x200":480}, price:355, image:"https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_3hkkrp3hkkrp3hkk.png?v=1777059258", images:["https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_3hkkrp3hkkrp3hkk.png?v=1777059258","https://newlookhome.eu/cdn/shop/files/2fceae09-75e0-49ae-9e1a-2b9322680078.webp?v=1777027752","https://newlookhome.eu/cdn/shop/files/4468f0c3-1401-4e1a-b011-a4ac7675aa49.webp?v=1777028334"], colors:[{name:"Charcoal Grey",hex:"#4A4A4A"},{name:"Navy Blue",hex:"#1B365D"},{name:"Cream",hex:"#F5F0DC"},{name:"Blush Pink",hex:"#DE9E9E"},{name:"Forest Green",hex:"#2D5016"},{name:"Teal",hex:"#1A5C6B"},{name:"Oyster White",hex:"#EAE6E0"}], features:["Premium velvet upholstery","Optional storage drawers","Gaslift +€150","Assembly +€30"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true, hasDrawers:true, drawerOptions:["No Drawers","2 Drawers (+€60)","4 Drawers (+€120)"] },
        { id:2, legacyId:2, name:"Luxury Panel-Line Velvet Storage Bed with Mattress", category:"beds", style:"florida-panel", productType:"bed-frame", badge:"New", description:"Clean vertical panel lines. High-quality velvet fabric with manual or gas-lift storage base.", basePrice:{"140x200":450,"160x200":465,"180x200":525}, price:450, image:"https://newlookhome.eu/cdn/shop/files/clean_Gemini_Generated_Image_hne48ghne48ghne4.png?v=1777029018", images:["https://newlookhome.eu/cdn/shop/files/clean_Gemini_Generated_Image_hne48ghne48ghne4.png?v=1777029018","https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_c4y85nc4y85nc4y8_1.png?v=1777059109"], colors:[{name:"Emerald Green",hex:"#2E7D32"},{name:"Royal Blue",hex:"#1565C0"},{name:"Charcoal",hex:"#424242"},{name:"Sage Green",hex:"#7C9B7A"},{name:"Oyster White",hex:"#EAE6E0"}], features:["Storage bed – opens manually","Optional Gas Lift +€150","Assembly +€50 (or +€100 with Gas Lift)","Premium velvet"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true, hasDrawers:false },
        { id:3, legacyId:3, name:"Premium Sleigh Bed with Metal Legs, Luxury Stitching & Mattress", category:"beds", style:"sleigh-hilton", productType:"bed-frame", badge:"Popular", description:"Timeless curved sleigh bed. Storage opens manually or add gas lift. Includes spring mattress.", basePrice:{"140x200":475,"160x200":515,"180x200":555}, price:475, image:"https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_kwvzghkwvzghkwvz.png?v=1777054769", images:["https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_kwvzghkwvzghkwvz.png?v=1777054769"], colors:[{name:"Mink",hex:"#8B7355"},{name:"Silver Grey",hex:"#A9A9A9"},{name:"Champagne",hex:"#F7E7CE"},{name:"Ivory White",hex:"#F5F0E8"},{name:"Dusty Blue",hex:"#7E9BB5"}], features:["Storage bed – opens manually","Optional Gas Lift +€150","Assembly +€50 (or +€100 with Gas Lift)","Metal legs"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true, hasDrawers:false },
        { id:4, legacyId:4, name:"Luxury Butterfly Design Storage Bed, Premium Spring Base & Mattress", category:"beds", style:"butterfly", productType:"bed-frame", badge:"Premium", description:"Dramatic winged headboard with velvet fabric. Storage opens manually or add gas lift.", basePrice:{"140x200":520,"160x200":550,"180x200":600}, price:520, image:"https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_atqw90atqw90atqw.png?v=1777054976", images:["https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_atqw90atqw90atqw.png?v=1777054976"], colors:[{name:"Midnight Black",hex:"#1a1a1a"},{name:"Wine Red",hex:"#722F37"},{name:"Pearl White",hex:"#F5F0E8"},{name:"Plum Purple",hex:"#5C2F5C"},{name:"Petrol Blue",hex:"#1C4E6B"}], features:["Storage bed – opens manually","Optional Gas Lift +€150","Assembly +€50 (or +€100 with Gas Lift)"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true, hasDrawers:false },
        { id:5, legacyId:5, name:"Premium Pocket Spring Mattress with Quilted Tufted Design", category:"mattresses", type:"pocket-spring", badge:"Bestseller", description:"Pocket springs with tufted quilted surface.", basePrice:{"90x200":180,"140x200":200,"160x200":220,"180x200":250}, price:180, image:"https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_1mj41i1mj41i1mj4.png?v=1777131353", images:["https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_1mj41i1mj41i1mj4.png?v=1777131353"], colors:[{name:"White/Cream",hex:"#FFFDF5"}], features:["Pocket springs","Rolled & vacuum-packed"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true },
        { id:6, legacyId:6, name:"Luxury Turkish Pocket Spring Mattress with Diamond Quilted Design", category:"mattresses", type:"pocket-spring", badge:null, description:"Diamond quilted Turkish design with advanced pocket springs.", basePrice:{"90x200":190,"140x200":220,"160x200":240,"180x200":280}, price:190, image:"https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_7mj1hl7mj1hl7mj1.png?v=1777131313", images:["https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_7mj1hl7mj1hl7mj1.png?v=1777131313"], colors:[{name:"White/Cream",hex:"#FFFDF5"}], features:["Diamond quilted","Pocket springs"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:false },
        { id:7, legacyId:7, name:"Luxury Foam Mattress with Quilted Comfort – SleepMaker Premium Design", category:"mattresses", type:"memory-foam", badge:"Popular", description:"SleepMaker foam mattress with quilted top.", basePrice:{"90x200":200,"140x200":240,"160x200":260,"180x200":300}, price:200, image:"https://newlookhome.eu/cdn/shop/files/BCO.d5eb73d8-92e2-4d63-b969-05a4902b09ab.webp?v=1777109050", images:["https://newlookhome.eu/cdn/shop/files/BCO.d5eb73d8-92e2-4d63-b969-05a4902b09ab.webp?v=1777109050"], colors:[{name:"White/Cream",hex:"#FFFDF5"}], features:["Quilted foam","Delivered rolled"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true },
        { id:8, legacyId:8, name:"3 Seater Fabric Sofa Bed with Storage", category:"sofas", type:"3-seater", badge:null, description:"Multifunctional sofa-bed with hidden storage. Assembly +€60.", price:510, basePrice:{"Standard":510}, sizeValues:{"Standard":510}, sizes:["Standard"], image:"https://newlookhome.eu/cdn/shop/files/Image_v6xkeuv6xkeuv6xk.png?v=1777111598", images:["https://newlookhome.eu/cdn/shop/files/Image_v6xkeuv6xkeuv6xk.png?v=1777111598"], colors:[{name:"Forest Green",hex:"#228B22"},{name:"Mustard Yellow",hex:"#E4A11B"},{name:"Slate Blue",hex:"#6A5ACD"},{name:"Terracotta",hex:"#E2725B"}], features:["Converts to guest bed","Hidden storage","Assembly +€60"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true },
        { id:9, legacyId:9, name:"7-Seater L-Shaped Sectional Sofa with Adjustable Headrests", category:"sofas", type:"l-shape", badge:"Popular", description:"7-seater L-shape sectional. Customer self-assembly.", price:730, basePrice:{"Left Corner":730,"Right Corner":730}, sizeValues:{"Left Corner":730,"Right Corner":730}, sizes:["Left Corner","Right Corner"], image:"https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_5e2dl75e2dl75e2d.png?v=1777062333", images:["https://newlookhome.eu/cdn/shop/files/Gemini_Generated_Image_5e2dl75e2dl75e2d.png?v=1777062333"], colors:[{name:"Charcoal",hex:"#36454F"},{name:"Cream",hex:"#FFFDD0"},{name:"Taupe",hex:"#8B7D6B"}], features:["Adjustable headrests & armrests","Customer self-assembly"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true },
        { id:10,legacyId:10,name:"Elegant Turkish Style 6-Seater Dining Set – Printed Glass Top", category:"dining", style:"set", badge:null, description:"6-seater dining set. Assembly +€50.", price:380, basePrice:{"Standard":380}, sizeValues:{"Standard":380}, sizes:["Standard"], image:"https://newlookhome.eu/cdn/shop/files/clean_4ead063f-bedd-41fb-bd63-f2a5187fac58.png?v=1776963265", images:["https://newlookhome.eu/cdn/shop/files/clean_4ead063f-bedd-41fb-bd63-f2a5187fac58.png?v=1776963265"], colors:[{name:"Natural Oak",hex:"#D4A574"},{name:"Walnut",hex:"#5D4037"},{name:"White Gloss",hex:"#FFFFF0"}], features:["6-seater","Assembly +€50"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:false },
        { id:11,legacyId:11,name:"Luxury LV Black & Gold 6-Seater Extendable Dining Set", category:"dining", style:"luxury", badge:"New", description:"LV black & gold extendable dining set. Assembly +€50.", price:480, basePrice:{"Standard":480}, sizeValues:{"Standard":480}, sizes:["Standard"], image:"https://newlookhome.eu/cdn/shop/files/clean_f07f8ac2-0e07-4c25-a33c-0b683d548b57.png?v=1776962966", images:["https://newlookhome.eu/cdn/shop/files/clean_f07f8ac2-0e07-4c25-a33c-0b683d548b57.png?v=1776962966"], colors:[{name:"Dark Walnut",hex:"#5D4037"},{name:"Champagne Gold",hex:"#C9A959"}], features:["6-seater extendable","Assembly +€50"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:false },
        { id:12,legacyId:12,name:"Modern 3-Door Wardrobe with Mirror, Drawers & Shelves", category:"wardrobes", type:"3-door", badge:"In Stock", description:"3-door wardrobe with mirror & drawers. Customer self-assembly.", price:480, basePrice:{"Standard":480}, sizeValues:{"Standard":480}, sizes:["Standard"], image:"https://newlookhome.eu/cdn/shop/files/WARDROBETHREEDOORWITHDRAWERSANDMIRROR1.jpg?v=1776939327", images:["https://newlookhome.eu/cdn/shop/files/WARDROBETHREEDOORWITHDRAWERSANDMIRROR1.jpg?v=1776939327"], colors:[{name:"White",hex:"#FFFFFF"},{name:"Grey",hex:"#808080"},{name:"Black",hex:"#1a1a1a"}], features:["Built-in mirror","Customer self-assembly"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true },
        { id:13,legacyId:13,name:"Modern Sliding Door Wardrobe with Mirror", category:"wardrobes", type:"sliding", badge:"In Stock", description:"Sliding wardrobe with full-length mirror. Customer self-assembly.", price:580, basePrice:{"Standard":580}, sizeValues:{"Standard":580}, sizes:["Standard"], image:"https://newlookhome.eu/cdn/shop/files/degsin1.png?v=1777060870", images:["https://newlookhome.eu/cdn/shop/files/degsin1.png?v=1777060870"], colors:[{name:"White",hex:"#FFFFFF"},{name:"Grey",hex:"#808080"},{name:"Black",hex:"#1a1a1a"}], features:["Full-length mirror","Customer self-assembly"], deliveriesTo:["BE","NL","LU","FR","DE"], featured:true }
    ];
}

// =========================================
// CART (localStorage)
// =========================================
let cart = JSON.parse(localStorage.getItem('vantageCart')) || [];

function saveCart() {
    localStorage.setItem('vantageCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll('#cartCount, .cart-count').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'flex' : 'none';
    });
}

function getCartTotal() {
    return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}

function addToCart(productId, options = {}) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    // Require size selection — show error modal if not provided
    if (!options.size) {
        showSizeRequiredModal(productId);
        return;
    }

    const size  = options.size;
    const price = options.price || (product.basePrice && product.basePrice[size]) || product.price;

    const existing = cart.find(i => i.id == productId && i.size === size && i.color === (options.color || product.colors[0]?.name));
    if (existing) {
        existing.quantity += (options.quantity || 1);
    } else {
        cart.push({
            id: productId,
            name: product.name,
            image: product.images[0],
            size,
            color: options.color || product.colors[0]?.name,
            price,
            quantity: options.quantity || 1,
            drawerOption: options.drawerOption || null,
            gaslift: options.gaslift || null,
            assembly: options.assembly || null,
            mattressModel: options.mattressModel || null
        });
    }
    saveCart();
    showToast(`${product.name} added to cart!`, 'success');
}

function showSizeRequiredModal(productId) {
    document.querySelector('.size-required-modal')?.remove();
    const modal = document.createElement('div');
    modal.className = 'size-required-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
    modal.innerHTML = `
        <div style="background:white;border-radius:12px;max-width:420px;width:100%;padding:2.5rem;text-align:center;position:relative;">
            <div style="width:64px;height:64px;background:#FEF3C7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 style="font-family:'Playfair Display',serif;font-size:1.4rem;color:#1a1a1a;margin-bottom:.75rem;">Please Select a Size</h3>
            <p style="color:#666;font-size:.95rem;margin-bottom:1.75rem;">You must select a size before proceeding. Please click <strong>View Full Details</strong> to choose your size, colour, and options.</p>
            <a href="detail.html?id=${productId}" style="display:inline-block;background:#1a1a1a;color:white;padding:.875rem 2rem;border-radius:8px;font-weight:600;text-decoration:none;margin-bottom:.75rem;width:100%;box-sizing:border-box;">View Full Details & Select Size</a>
            <button onclick="this.closest('.size-required-modal').remove()" style="display:block;width:100%;padding:.6rem;background:none;border:1px solid #ddd;border-radius:8px;cursor:pointer;color:#666;font-size:.9rem;margin-top:.25rem;">Cancel</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function updateQuantity(index, delta) {
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    saveCart();
    renderCart();
}

// =========================================
// TOAST
// =========================================
function showToast(message, type = 'success') {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `position:fixed;bottom:2rem;right:2rem;z-index:9999;background:${type==='success'?'var(--charcoal)':'#dc3545'};color:white;padding:.875rem 1.5rem;border-radius:var(--radius-md);font-size:.9rem;font-weight:500;box-shadow:0 8px 30px rgba(0,0,0,.2);animation:slideInRight .3s ease;max-width:320px;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.parentNode && toast.remove(), 3500);
}

// =========================================
// HEADER
// =========================================
function initHeader() {
    const header = document.getElementById('header');
    if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));

    const toggle   = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const closeBtn  = document.getElementById('mobileNavClose');

    toggle?.addEventListener('click', () => mobileNav.classList.add('open'));
    closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));

    // Mobile sub-menus
    document.querySelectorAll('.mobile-nav-link[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const sub = document.getElementById(btn.dataset.target);
            sub?.classList.toggle('open');
        });
    });

    // Search overlay
    const searchToggle  = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose   = document.getElementById('searchClose');
    const searchInput   = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchToggle?.addEventListener('click', () => { searchOverlay?.classList.add('active'); searchInput?.focus(); });
    searchClose?.addEventListener('click', () => searchOverlay?.classList.remove('active'));

    searchInput?.addEventListener('input', debounce(() => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q || products.length === 0) { searchResults.innerHTML = ''; return; }
        const hits = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 6);
        searchResults.innerHTML = hits.map(p => `<a href="detail.html?id=${p.id}" style="display:flex;align-items:center;gap:1rem;padding:.75rem;border-radius:var(--radius-md);"><img src="${p.image}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;"><div><strong>${p.name}</strong><br><span style="font-size:.85rem;color:var(--dark-gray);">from €${p.price}</span></div></a>`).join('') || '<p style="color:var(--dark-gray);padding:1rem;">No products found.</p>';
    }, 250));
}

// =========================================
// RENDER PRODUCT CARDS (no Quick View — goes straight to detail)
// =========================================
function renderProducts(productList, container) {
    if (!container) return;
    if (!productList.length) {
        container.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--dark-gray);">No products found.</p>';
        return;
    }
    const isBedOrMattress = p => (p.category === 'beds' || p.category === 'mattresses') && p.basePrice;
    container.innerHTML = productList.map(p => {
        const from = isBedOrMattress(p) ? Math.min(...Object.values(p.basePrice)) : p.price;
        return `
        <article class="product-card" data-id="${p.id}">
            <div class="product-card-image">
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                <a href="detail.html?id=${p.id}">
                    <img src="${p.images[0]}" alt="${p.name}" onerror="this.src='${PLACEHOLDER}'">
                </a>
            </div>
            <div class="product-card-info">
                <span class="product-card-category">${p.category}</span>
                <h3 class="product-card-name"><a href="detail.html?id=${p.id}">${p.name}</a></h3>
                <div class="product-card-footer">
                    <span class="product-card-price">from €${from}</span>
                    <a href="detail.html?id=${p.id}" class="btn btn-outline-dark btn-sm">View Details</a>
                </div>
            </div>
        </article>`;
    }).join('');
}

// =========================================
// HERO SLIDER
// =========================================
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('heroDots');
    if (!slides.length) return;

    if (dotsContainer) {
        dotsContainer.innerHTML = [...slides].map((_, i) =>
            `<button class="hero-dot${i===0?' active':''}" data-index="${i}" aria-label="Slide ${i+1}"></button>`
        ).join('');
    }
    const dots = document.querySelectorAll('.hero-dot');
    let current = 0, timer;

    function goTo(n) {
        slides[current]?.classList.remove('active');
        dots[current]?.classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current]?.classList.add('active');
        dots[current]?.classList.add('active');
    }
    function autoPlay() { timer = setInterval(() => goTo(current + 1), 5000); }

    document.getElementById('heroNext')?.addEventListener('click', () => { clearInterval(timer); goTo(current + 1); autoPlay(); });
    document.getElementById('heroPrev')?.addEventListener('click', () => { clearInterval(timer); goTo(current - 1); autoPlay(); });
    dots.forEach(d => d.addEventListener('click', () => { clearInterval(timer); goTo(+d.dataset.index); autoPlay(); }));
    autoPlay();
}

// =========================================
// FEATURED PRODUCTS
// =========================================
function renderFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    renderProducts(products.filter(p => p.featured).slice(0, 8), container);
}

// =========================================
// PRODUCTS LISTING PAGE
// =========================================
function initProductsPage() {
    const container   = document.getElementById('productsGrid');
    const countEl     = document.getElementById('productsCount');
    const filterSection = document.querySelector('.filters-section');
    if (!container) return;

    const params     = new URLSearchParams(window.location.search);
    const category   = params.get('category');
    const styleParam = params.get('style');

    let filtered = category
        ? products.filter(p => p.category === category && (category !== 'beds' || p.productType === 'bed-frame'))
        : [...products];

    if (styleParam) {
        filtered = filtered.filter(p => p.style === styleParam || p.type === styleParam);
    }

    // Update page heading
    if (category) {
        const labelMap = { beds:'Beds', mattresses:'Mattresses', sofas:'Sofas', dining:'Dining', wardrobes:'Wardrobes' };
        const label = labelMap[category] || (category.charAt(0).toUpperCase() + category.slice(1));
        const h1 = document.querySelector('.page-header h1');
        const bc = document.querySelector('.breadcrumb .current-page');
        if (h1) h1.textContent = label;
        if (bc) bc.textContent = label;
    }

    // Show only relevant filter buttons per category
    if (filterSection) {
        const filterMap = {
            beds:       ['divan','florida-panel','sleigh-hilton','butterfly'],
            mattresses: ['memory-foam','pocket-spring'],
            sofas:      ['3-seater','l-shape'],
            dining:     [],
            wardrobes:  []
        };
        const relevantFilters = category ? (filterMap[category] || []) : Object.values(filterMap).flat();

        document.querySelectorAll('.filter-btn').forEach(btn => {
            const f = btn.dataset.filter;
            if (f === 'all') { btn.style.display = ''; return; }
            btn.style.display = relevantFilters.includes(f) ? '' : 'none';
        });

        if (category === 'dining' || category === 'wardrobes') {
            filterSection.style.display = 'none';
        } else {
            filterSection.style.display = '';
        }
    }

    if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
    renderProducts(filtered, container);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            let list = category ? products.filter(p => p.category === category) : [...products];
            if (category === 'beds') list = list.filter(p => p.productType === 'bed-frame');
            if (f && f !== 'all') list = list.filter(p => p.style === f || p.type === f);
            renderProducts(list, container);
            if (countEl) countEl.textContent = `${list.length} product${list.length !== 1 ? 's' : ''}`;
        });
    });

    document.querySelector('.sort-select')?.addEventListener('change', e => {
        const sorted = [...filtered];
        if (e.target.value === 'price-low')  sorted.sort((a, b) => a.price - b.price);
        if (e.target.value === 'price-high') sorted.sort((a, b) => b.price - a.price);
        if (e.target.value === 'name')       sorted.sort((a, b) => a.name.localeCompare(b.name));
        renderProducts(sorted, container);
    });
}

// =========================================
// PRODUCT DETAIL PAGE
// =========================================
function initProductDetail() {
    const id = parseInt(new URLSearchParams(window.location.search).get('id'));
    const product = products.find(p => p.id == id);

    if (!product) {
        document.querySelector('main').innerHTML = '<div class="container" style="padding:4rem;text-align:center;"><h2>Product not found</h2><a href="products.html" class="btn btn-primary">Browse All Products</a></div>';
        return;
    }

    document.title = `${product.name} | Vantage Home`;

    const bc = document.querySelector('.breadcrumb .current-page');
    if (bc) bc.textContent = product.name;

    // Images
    const mainImg   = document.querySelector('.main-image img');
    const thumbGrid = document.querySelector('.thumbnail-grid');
    if (mainImg) { mainImg.src = product.images[0]; mainImg.alt = product.name; }
    if (thumbGrid) {
        thumbGrid.innerHTML = product.images.map((img, i) =>
            `<img src="${img}" alt="${product.name} ${i+1}" class="thumbnail ${i===0?'active':''}" onclick="switchImage('${img}', this)" onerror="this.src='${PLACEHOLDER}'">`
        ).join('');
    }

    // Text
    const catEl   = document.querySelector('.product-category');
    const titleEl = document.querySelector('.product-details h1');
    const descEl  = document.querySelector('.product-description');
    if (catEl)   catEl.textContent   = product.category;
    if (titleEl) titleEl.textContent = product.name;
    if (descEl)  descEl.textContent  = product.description;

    // Features
    const featList = document.querySelector('.product-features-list');
    if (featList) featList.innerHTML = product.features.map(f =>
        `<li style="display:flex;align-items:center;gap:.5rem;font-size:.9rem;"><span style="color:var(--gold);">✓</span>${f}</li>`
    ).join('');

    // Delivery flags
    const countriesEl = document.querySelector('.delivery-countries-detail');
    if (countriesEl) countriesEl.innerHTML = product.deliveriesTo.map(code => {
        const z = deliveryZones[code];
        return z ? `<img src="https://flagcdn.com/w20/${z.flag}.png" alt="${z.name}" title="${z.name}" style="width:24px;height:16px;object-fit:cover;border-radius:2px;">` : '';
    }).join('');

    const bedStyle = product.style || '';
    const isBed = product.category === 'beds' && product.productType === 'bed-frame';
    const isBedOrMattress = (product.category === 'beds' || product.category === 'mattresses') && product.basePrice;

    // Available sizes
    let availableSizes = BED_SIZES;
    if (isBed && LARGE_ONLY_STYLES.includes(bedStyle)) {
        availableSizes = BED_SIZES_LARGE_ONLY;
    }

    // Size selector
    const sizeSelect = document.getElementById('sizeSelect');
    const priceEl    = document.querySelector('.product-price .current');
    let currentSizeKey;

    if (sizeSelect) {
        if (isBedOrMattress) {
            sizeSelect.innerHTML = availableSizes
                .filter(s => product.basePrice[s] !== undefined)
                .map(s => `<option value="${s}">${BED_SIZE_LABELS[s]} – €${product.basePrice[s]}</option>`)
                .join('');
            currentSizeKey = availableSizes.find(s => product.basePrice[s] !== undefined) || availableSizes[0];
        } else if (product.sizes) {
            sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
            currentSizeKey = product.sizes[0];
        }
        sizeSelect.addEventListener('change', updateDetailPrice);
    }

    // Remove old dynamic groups if re-rendering
    const optionsContainer = document.querySelector('.product-options');
    ['drawerGroup','gasliftGroup','assemblyGroup','mattressGroup'].forEach(id => document.getElementById(id)?.remove());

    // ---- DRAWERS: DIVAN ONLY ----
    const drawerGroup  = document.getElementById('drawerGroup');
    const drawerSelect = document.getElementById('drawerSelect');
    const showDrawers  = isBed && bedStyle === 'divan' && product.hasDrawers && product.drawerOptions;

    if (drawerGroup && drawerSelect) {
        if (showDrawers) {
            drawerGroup.style.display = '';
            drawerSelect.innerHTML = product.drawerOptions.map(o => `<option value="${o}">${o}</option>`).join('');
            drawerSelect.addEventListener('change', updateDetailPrice);
        } else {
            drawerGroup.style.display = 'none';
        }
    }

    // ---- GAS LIFT: florida-panel, sleigh-hilton, butterfly only ----
    const showGaslift = isBed && ['florida-panel','sleigh-hilton','butterfly'].includes(bedStyle);

    if (optionsContainer && showGaslift) {
        const gasliftDiv = document.createElement('div');
        gasliftDiv.className = 'option-group';
        gasliftDiv.id = 'gasliftGroup';
        gasliftDiv.innerHTML = `
            <label>Gas Lift Storage</label>
            <select id="gasliftSelect">
                <option value="no">No Gas Lift – opens manually (included)</option>
                <option value="yes">Add Gas Lift (+€150)</option>
            </select>
            <small style="color:var(--dark-gray);margin-top:.25rem;display:block;">Storage opens manually without gas lift. Gas lift = easier access.</small>`;
        optionsContainer.appendChild(gasliftDiv);
        document.getElementById('gasliftSelect')?.addEventListener('change', updateDetailPrice);
    }

    // ---- ASSEMBLY: specific per bed type ----
    if (optionsContainer && isBed) {
        const assemblyDiv = document.createElement('div');
        assemblyDiv.className = 'option-group';
        assemblyDiv.id = 'assemblyGroup';
        let assemblyOptions = `<option value="no">No Assembly</option>`;

        if (bedStyle === 'divan') {
            assemblyOptions += `<option value="yes">Assembly (+€30)</option>`;
        } else if (['florida-panel','sleigh-hilton','butterfly'].includes(bedStyle)) {
            assemblyOptions += `<option value="yes">Assembly (+€50) — or +€100 with Gas Lift</option>`;
        }

        assemblyDiv.innerHTML = `
            <label>Assembly Service</label>
            <select id="assemblyDetailSelect">${assemblyOptions}</select>`;
        optionsContainer.appendChild(assemblyDiv);
        document.getElementById('assemblyDetailSelect')?.addEventListener('change', updateDetailPrice);
    }

    // ---- DINING ASSEMBLY ----
    if (optionsContainer && product.category === 'dining') {
        const assemblyDiv = document.createElement('div');
        assemblyDiv.className = 'option-group';
        assemblyDiv.id = 'assemblyGroup';
        assemblyDiv.innerHTML = `
            <label>Assembly Service</label>
            <select id="assemblyDetailSelect">
                <option value="no">No Assembly</option>
                <option value="yes">Assembly (+€50)</option>
            </select>`;
        optionsContainer.appendChild(assemblyDiv);
        document.getElementById('assemblyDetailSelect')?.addEventListener('change', updateDetailPrice);
    }

    // ---- 3-SEATER SOFA ASSEMBLY ----
    if (optionsContainer && product.category === 'sofas' && product.type === '3-seater') {
        const assemblyDiv = document.createElement('div');
        assemblyDiv.className = 'option-group';
        assemblyDiv.id = 'assemblyGroup';
        assemblyDiv.innerHTML = `
            <label>Assembly Service</label>
            <select id="assemblyDetailSelect">
                <option value="no">No Assembly</option>
                <option value="yes">Assembly (+€60)</option>
            </select>`;
        optionsContainer.appendChild(assemblyDiv);
        document.getElementById('assemblyDetailSelect')?.addEventListener('change', updateDetailPrice);
    }

    // ---- MATTRESS MODEL (only for bed frames — auto-includes UK spring) ----
    if (optionsContainer && isBed) {
        const mattressDiv = document.createElement('div');
        mattressDiv.className = 'option-group';
        mattressDiv.id = 'mattressGroup';
        mattressDiv.innerHTML = `
            <label>Mattress Model</label>
            <select id="mattressModelSelect">
                ${MATTRESS_MODELS.map(m => `<option value="${m.id}">${m.label}</option>`).join('')}
            </select>
            <small style="color:var(--dark-gray);margin-top:.25rem;display:block;">Orthopaedic Spring mattress is included in the base price.</small>`;
        optionsContainer.appendChild(mattressDiv);
        document.getElementById('mattressModelSelect')?.addEventListener('change', updateDetailPrice);
    }

    // ---- SURCHARGE HELPERS ----
    function getDrawerSurcharge() {
        if (!showDrawers) return 0;
        const ds = document.getElementById('drawerSelect');
        if (!ds) return 0;
        const match = ds.value.match(/(\d+)\s*Drawers?/i);
        if (!match) return 0;
        return parseInt(match[1]) * 30;
    }

    function getGasliftSurcharge() {
        const gs = document.getElementById('gasliftSelect');
        return (gs && gs.value === 'yes') ? 150 : 0;
    }

    function getAssemblySurcharge() {
        const as = document.getElementById('assemblyDetailSelect');
        if (!as || as.value === 'no') return 0;
        if (bedStyle === 'divan') return 30;
        if (['florida-panel','sleigh-hilton','butterfly'].includes(bedStyle)) {
            return getGasliftSurcharge() > 0 ? 100 : 50;
        }
        if (product.category === 'dining') return 50;
        if (product.category === 'sofas' && product.type === '3-seater') return 60;
        return 0;
    }

    function getMattressUplift() {
        const ms = document.getElementById('mattressModelSelect');
        if (!ms) return 0;
        const model = MATTRESS_MODELS.find(m => m.id === ms.value);
        return model ? model.uplift : 0;
    }

    function updateDetailPrice() {
        const sk = sizeSelect ? sizeSelect.value : currentSizeKey;
        let baseP = isBedOrMattress ? (product.basePrice[sk] || product.price) : (product.sizeValues?.[sk] || product.price);
        const drawers  = getDrawerSurcharge();
        const gas      = getGasliftSurcharge();
        const asm      = getAssemblySurcharge();
        const mattress = getMattressUplift();
        const total    = baseP + drawers + gas + asm + mattress;
        if (priceEl) priceEl.textContent = `€${total}`;
        currentSizeKey = sk;
        // Price breakdown
        let breakdownEl = document.getElementById('priceBreakdown');
        if (!breakdownEl) {
            breakdownEl = document.createElement('div');
            breakdownEl.id = 'priceBreakdown';
            breakdownEl.style.cssText = 'margin-top:.5rem;font-size:.82rem;color:var(--dark-gray);display:flex;flex-direction:column;gap:.2rem;';
            priceEl?.parentElement?.appendChild(breakdownEl);
        }
        let rows = [`<span>Base price: €${baseP}</span>`];
        if (mattress) rows.push(`<span>Mattress upgrade: +€${mattress}</span>`);
        if (drawers)  rows.push(`<span>Drawers: +€${drawers}</span>`);
        if (gas)      rows.push(`<span>Gas lift: +€${gas}</span>`);
        if (asm)      rows.push(`<span>Assembly: +€${asm}</span>`);
        if (rows.length > 1) rows.push(`<span style="font-weight:600;border-top:1px solid #eee;padding-top:.2rem;margin-top:.2rem;">Total: €${total}</span>`);
        breakdownEl.innerHTML = rows.join('');
    }

    const initSk = isBedOrMattress
        ? (availableSizes.find(s => product.basePrice[s] !== undefined) || availableSizes[0])
        : (product.sizes ? product.sizes[0] : 'Standard');
    if (priceEl) {
        const initPrice = isBedOrMattress ? (product.basePrice[initSk] || product.price) : product.price;
        priceEl.textContent = `€${initPrice}`;
    }

    // Colour swatches removed — colours displayed via product photos added by admin
    const swatches = document.querySelector('.color-swatches');
    const colorOptionGroup = swatches?.closest('.option-group');
    if (colorOptionGroup) colorOptionGroup.style.display = 'none';

    // Quantity
    let qty = 1;
    document.querySelector('.quantity-btn.minus')?.addEventListener('click', () => { qty = Math.max(1, qty-1); document.querySelector('.quantity-input').value = qty; });
    document.querySelector('.quantity-btn.plus')?.addEventListener('click',  () => { qty++; document.querySelector('.quantity-input').value = qty; });

    // Proceed to Checkout — adds item with all options then navigates directly to checkout
    document.querySelector('.add-to-cart-btn')?.addEventListener('click', () => {
        const sk = sizeSelect ? sizeSelect.value : (product.sizes ? product.sizes[0] : 'Standard');
        if (!sk) { showToast('Please select a size first', 'error'); return; }

        let baseP = isBedOrMattress ? (product.basePrice[sk] || product.price) : (product.sizeValues?.[sk] || product.price);
        const drawers  = getDrawerSurcharge();
        const gas      = getGasliftSurcharge();
        const asm      = getAssemblySurcharge();
        const mattress = getMattressUplift();
        const totalPrice = baseP + drawers + gas + asm + mattress;
        const color = document.querySelector('.color-swatch.selected')?.dataset.color || product.colors[0]?.name;
        const gasliftLabel  = gas  > 0 ? `Gas Lift (+€${gas})` : null;
        const assemblyLabel = asm  > 0 ? `Assembly (+€${asm})` : null;
        const mattressLabel = document.getElementById('mattressModelSelect')
            ? MATTRESS_MODELS.find(m => m.id === document.getElementById('mattressModelSelect').value)?.label
            : null;

        // Clear cart so only this item proceeds (single-item checkout flow)
        cart = [];
        cart.push({
            id: product.id,
            name: product.name,
            image: product.images[0],
            size: sk,
            color,
            price: totalPrice,
            quantity: qty,
            drawerOption: (showDrawers && document.getElementById('drawerSelect')?.value !== 'No Drawers') ? document.getElementById('drawerSelect')?.value : null,
            gaslift: gasliftLabel,
            assembly: assemblyLabel,
            mattressModel: mattressLabel
        });
        saveCart();
        window.location.href = 'checkout.html';
    });

    // Related products
    const related = document.getElementById('relatedProducts');
    if (related) renderProducts(products.filter(p => p.category === product.category && p.id != product.id).slice(0, 4), related);
}

function switchImage(src, thumbEl) {
    const mainImg = document.querySelector('.main-image img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbEl?.classList.add('active');
}

function selectColor(btn) {
    document.querySelectorAll('.color-swatch').forEach(s => { s.style.border = '2px solid transparent'; s.classList.remove('selected'); });
    btn.style.border = '2px solid var(--charcoal)';
    btn.classList.add('selected');
}

// =========================================
// DELIVERY FEE CALCULATOR
// =========================================
function getDeliveryFee(countryCode, postcode) {
    if (countryCode === 'BE') return 0; // FREE for Belgium
    if (countryCode === 'NL') {
        const pc = (postcode || '').replace(/\s/g,'');
        if (pc.startsWith('7') || pc.startsWith('8')) return 50;
        return 30;
    }
    return 30; // LU, FR, DE: €30
}

// =========================================
// CHECKOUT
// =========================================
function initCheckout() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    renderOrderSummary();

    const countrySelect = document.getElementById('country');
    const postcodeInput = document.getElementById('postcode');

    countrySelect?.addEventListener('change', () => { validatePostcode(); renderOrderSummary(); });
    postcodeInput?.addEventListener('input', debounce(() => { validatePostcode(); renderOrderSummary(); }, 300));

    // Delivery day popup
    postcodeInput?.addEventListener('input', debounce(() => {
        const pc    = postcodeInput.value.trim();
        const hint  = getDeliveryDayHint(countrySelect?.value, pc);
        const hintEl = document.getElementById('deliveryDayHint');
        const textEl = document.getElementById('deliveryDayText');
        if (hintEl && hint && pc.length >= 4) {
            if (textEl) textEl.textContent = hint;
            hintEl.style.display = 'block';
        } else if (hintEl) {
            hintEl.style.display = 'none';
        }
    }, 400));

    // Promo code
    const promoInput  = document.getElementById('promoCodeInput');
    const promoApply  = document.getElementById('promoApplyBtn');
    const promoMsg    = document.getElementById('promoMessage');
    let appliedPromo  = null;

    promoApply?.addEventListener('click', () => {
        const code = (promoInput?.value || '').trim().toUpperCase();
        if (PROMO_CODES[code]) {
            appliedPromo = { code, ...PROMO_CODES[code] };
            promoMsg.textContent = `✓ ${appliedPromo.label} applied!`;
            promoMsg.style.color = '#16a34a';
            renderOrderSummary(appliedPromo);
        } else if (code) {
            promoMsg.textContent = '✗ Invalid promo code. Please check and try again.';
            promoMsg.style.color = '#dc2626';
            appliedPromo = null;
            renderOrderSummary(null);
        }
    });

    form.querySelector('[name="floor"]')?.addEventListener('change', () => renderOrderSummary(appliedPromo));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validatePostcode()) { showToast('Please check your delivery address', 'error'); return; }
        if (cart.length === 0)   { showToast('Your cart is empty', 'error'); return; }

        const fd = new FormData(form);
        const subtotal = getCartTotal();
        const countryCode = fd.get('country');
        const postcode    = fd.get('postcode');
        const deliveryFee = getDeliveryFee(countryCode, postcode);
        const freeDelivery = subtotal >= CONFIG.FREE_DELIVERY_THRESHOLD && countryCode === 'BE';
        const finalDelivery = freeDelivery ? 0 : deliveryFee;
        const floorCost  = parseInt(fd.get('floor')) || 0;
        const promoCode  = (fd.get('promoCode') || '').trim().toUpperCase();
        const promoData  = PROMO_CODES[promoCode] || null;
        const promoDiscount = promoData ? promoData.discount : 0;
        const total = subtotal + finalDelivery + floorCost - promoDiscount;

        const cartSummary = cart.map(i =>
            `${i.name} | Size: ${i.size} | Colour: ${i.color} | Qty: ${i.quantity}${i.drawerOption&&i.drawerOption!=='No Drawers'?' | '+i.drawerOption:''} ${i.gaslift?' | '+i.gaslift:''} ${i.assembly?' | '+i.assembly:''} ${i.mattressModel?' | Mattress: '+i.mattressModel:''} | €${(i.price*i.quantity).toFixed(2)}`
        ).join('\n');

        const hiddenFields = {
            _subject: `New COD Order – ${fd.get('firstName')} ${fd.get('lastName')}`,
            cart_items: cartSummary,
            subtotal: `€${subtotal.toFixed(2)}`,
            delivery_fee: freeDelivery ? 'FREE (Belgium ≥€500)' : `€${finalDelivery.toFixed(2)}`,
            floor_surcharge: floorCost > 0 ? `+€${floorCost}` : 'None',
            promo_code: promoData ? `${promoCode} – ${promoData.label}` : 'None',
            promo_discount: promoData ? `-€${promoData.discount}` : 'None',
            order_total: `€${total.toFixed(2)}`,
            payment_method: 'Cash on Delivery',
            country: deliveryZones[countryCode]?.name || countryCode,
            floor: fd.get('floor')
        };
        Object.entries(hiddenFields).forEach(([k, v]) => fd.append(k, v));

        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        try {
            const resp = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
                method: 'POST', body: fd,
                headers: { 'Accept': 'application/json' }
            });
            if (resp.ok) {
                cart = []; saveCart();
                showOrderConfirmation({
                    customer: { firstName: fd.get('firstName'), lastName: fd.get('lastName') },
                    address:  { street: fd.get('address'), city: fd.get('city'), postcode, country: countryCode },
                    total
                });
            } else {
                const data = await resp.json();
                showToast(data?.errors?.[0]?.message || 'Could not send order. Please contact us directly.', 'error');
                submitBtn.textContent = 'Place Order – Pay on Delivery';
                submitBtn.disabled = false;
            }
        } catch {
            cart = []; saveCart();
            showOrderConfirmation({
                customer: { firstName: fd.get('firstName'), lastName: fd.get('lastName') },
                address:  { street: fd.get('address'), city: fd.get('city'), postcode, country: countryCode },
                total
            });
        }
    });
}

function validatePostcode() {
    const countrySelect = document.getElementById('country');
    const postcodeInput = document.getElementById('postcode');
    const postcodeError = document.getElementById('postcodeError');
    if (!countrySelect || !postcodeInput || !postcodeError) return true;

    const zone = deliveryZones[countrySelect.value];
    postcodeInput.classList.remove('error');
    postcodeError.style.display = 'none';
    if (!zone || zone.fullCoverage || !postcodeInput.value.trim()) return true;

    const pc       = postcodeInput.value.trim();
    const valid    = zone.validPrefixes.some(p => pc.startsWith(p));
    const excluded = zone.excludedPrefixes?.some(p => pc.startsWith(p));

    if (!valid || excluded) {
        postcodeInput.classList.add('error');
        postcodeError.textContent = zone.message;
        postcodeError.style.display = 'block';
        return false;
    }
    return true;
}

function getDeliveryDayHint(country, postcode) {
    if (!country || !postcode) return null;
    const pc = postcode.replace(/\s/g, '').toUpperCase();
    if (country === 'BE') {
        if (pc.startsWith('2')) return 'Monday';
        if (pc.startsWith('3')) return 'Tuesday';
        if (pc.startsWith('4')) return 'Wednesday';
        if (['1','7','8','9'].some(p => pc.startsWith(p))) return 'Thursday';
        if (['5','6'].some(p => pc.startsWith(p))) return 'Friday';
    }
    if (country === 'NL') {
        const n = parseInt(pc.substring(0, 2));
        if (n >= 10 && n <= 49) return 'Monday';
        if ((n >= 50 && n <= 69) || (n >= 70 && n <= 83)) return 'Tuesday';
    }
    if (country === 'DE') return ['4','5','6','7'].some(p => pc.startsWith(p)) ? 'Wednesday' : null;
    if (country === 'FR') {
        if (['02','08','54','57'].some(p => pc.startsWith(p))) return 'Saturday';
        if (['59','60','62'].some(p => pc.startsWith(p))) return 'Thursday';
    }
    if (country === 'LU') return 'Saturday';
    return null;
}

function renderOrderSummary(appliedPromo) {
    const itemsEl    = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const deliveryEl = document.getElementById('deliveryFee');
    const totalEl    = document.getElementById('grandTotal');
    if (!itemsEl) return;

    if (!cart.length) {
        itemsEl.innerHTML = '<p style="color:var(--dark-gray);text-align:center;padding:1rem;">Your cart is empty. <a href="products.html" style="color:var(--gold);">Browse products</a></p>';
        return;
    }

    itemsEl.innerHTML = cart.map((item, i) => {
        let extras = [];
        if (item.mattressModel) extras.push(`Mattress: ${item.mattressModel}`);
        if (item.drawerOption && item.drawerOption !== 'No Drawers') extras.push(item.drawerOption);
        if (item.gaslift)  extras.push(item.gaslift);
        if (item.assembly) extras.push(item.assembly);
        return `
        <div class="order-item">
            <div class="order-item-image"><img src="${item.image}" alt="${item.name}" onerror="this.src='${PLACEHOLDER}'"></div>
            <div class="order-item-details">
                <p class="order-item-name">${item.name}</p>
                <p class="order-item-options">${item.size} | ${item.color} | Qty: ${item.quantity}${extras.length?' | '+extras.join(' | '):''}</p>
            </div>
            <div class="order-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
        </div>`;
    }).join('');

    const sub = getCartTotal();
    const countrySelect = document.getElementById('country');
    const postcodeInput = document.getElementById('postcode');
    const countryCode   = countrySelect ? countrySelect.value : 'BE';
    const postcode      = postcodeInput ? postcodeInput.value : '';
    const deliveryFee   = getDeliveryFee(countryCode, postcode);
    const freeDelivery  = sub >= CONFIG.FREE_DELIVERY_THRESHOLD && countryCode === 'BE';
    const finalDelivery = freeDelivery ? 0 : deliveryFee;

    const floorSelect = document.querySelector('[name="floor"]');
    const floorCost   = floorSelect ? parseInt(floorSelect.value) || 0 : 0;
    const promoDiscount = appliedPromo ? appliedPromo.discount : 0;

    if (subtotalEl) subtotalEl.textContent = `€${sub.toFixed(2)}`;

    let deliveryLabel = freeDelivery ? 'FREE (Belgium – order over €500)' : `€${finalDelivery.toFixed(2)}`;
    if (!freeDelivery && countryCode !== 'BE') {
        const specialNote = (countryCode === 'NL' && (postcode.startsWith('7') || postcode.startsWith('8'))) ? ' (NL 7xxx/8xxx surcharge)' : '';
        deliveryLabel += specialNote;
    }
    if (deliveryEl) deliveryEl.textContent = deliveryLabel;

    // Extra rows
    let extrasEl = document.getElementById('extraCharges');
    if (!extrasEl) {
        extrasEl = document.createElement('div');
        extrasEl.id = 'extraCharges';
        extrasEl.style.cssText = 'display:flex;flex-direction:column;gap:.5rem;';
        totalEl?.parentElement?.insertAdjacentElement('beforebegin', extrasEl);
    }
    let extraRows = '';
    if (floorCost > 0)    extraRows += `<div class="total-row"><span>Floor surcharge</span><span>+€${floorCost}</span></div>`;
    if (promoDiscount > 0) extraRows += `<div class="total-row" style="color:#16a34a;"><span>Promo (${appliedPromo.code})</span><span>-€${promoDiscount}</span></div>`;
    extrasEl.innerHTML = extraRows;

    const grand = sub + finalDelivery + floorCost - promoDiscount;
    if (totalEl) totalEl.textContent = `€${Math.max(0,grand).toFixed(2)}`;
}

function showOrderConfirmation(order) {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `
        <section style="padding:4rem 1rem;background:var(--off-white);min-height:70vh;">
            <div class="container" style="max-width:600px;text-align:center;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="margin-bottom:1.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h1 style="font-family:var(--font-display);font-size:2.5rem;margin-bottom:1rem;color:var(--charcoal);">Order Confirmed!</h1>
                <p style="font-size:1.1rem;color:var(--dark-gray);margin-bottom:2rem;">Thank you, ${order.customer.firstName}! We'll contact you within 24 hours to confirm your delivery day.</p>
                <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);margin-bottom:2rem;text-align:left;">
                    <p><strong>Payment:</strong> Cash on Delivery – pay only after inspecting your furniture</p>
                    <p style="margin-top:.5rem;"><strong>Delivery to:</strong><br>${order.address.street}<br>${order.address.postcode} ${order.address.city}<br>${deliveryZones[order.address.country]?.name || order.address.country}</p>
                    <p style="margin-top:.5rem;"><strong>Order Total:</strong> €${order.total.toFixed(2)}</p>
                </div>
                <div style="background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);margin-bottom:2rem;text-align:left;">
                    <h3 style="font-family:var(--font-display);margin-bottom:.75rem;font-size:1.1rem;">Need help or have questions?</h3>
                    <p style="color:var(--dark-gray);font-size:.9rem;line-height:1.7;">
                        📘 <a href="#" style="color:var(--gold);">Facebook</a> – Message us on Facebook<br>
                        📸 <a href="#" style="color:var(--gold);">Instagram</a> – DM us on Instagram<br>
                        ✉️ <a href="contact.html" style="color:var(--gold);">Contact Form</a> – Send us an email
                    </p>
                </div>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        </section>`;
}

// =========================================
// CART PAGE
// =========================================
function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartSummary   = document.getElementById('cartSummary');
    if (!cartContainer) return;

    if (!cart.length) {
        cartContainer.innerHTML = `<div style="text-align:center;padding:4rem 2rem;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--medium-gray)" stroke-width="1.5" style="margin-bottom:1rem;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <h2 style="font-family:var(--font-display);margin-bottom:.5rem;color:var(--charcoal);">Your cart is empty</h2>
            <p style="color:var(--dark-gray);margin-bottom:1.5rem;">Discover our premium furniture collection.</p>
            <a href="products.html" class="btn btn-primary">Shop Now</a>
        </div>`;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    if (cartSummary) cartSummary.style.display = 'block';
    cartContainer.innerHTML = cart.map((item, index) => {
        let extras = [];
        if (item.mattressModel) extras.push(`Mattress: ${item.mattressModel}`);
        if (item.drawerOption && item.drawerOption !== 'No Drawers') extras.push(item.drawerOption);
        if (item.gaslift)  extras.push(item.gaslift);
        if (item.assembly) extras.push(item.assembly);
        return `
        <div class="cart-item" style="display:flex;gap:1rem;padding:1.5rem 0;border-bottom:1px solid var(--light-gray);">
            <img src="${item.image}" alt="${item.name}" style="width:110px;height:110px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0;" onerror="this.src='${PLACEHOLDER}'">
            <div style="flex:1;">
                <h3 style="font-family:var(--font-display);font-size:1.1rem;margin-bottom:.25rem;color:var(--charcoal);">${item.name}</h3>
                <p style="color:var(--dark-gray);font-size:.85rem;margin-bottom:.25rem;">${item.size} | ${item.color}${extras.length?' | '+extras.join(' | '):''}</p>
                <p style="font-weight:600;color:var(--gold);">€${item.price} each</p>
                <div style="display:flex;align-items:center;gap:.5rem;margin-top:.75rem;">
                    <button onclick="updateQuantity(${index},-1)" style="width:32px;height:32px;border-radius:4px;background:var(--off-white);cursor:pointer;font-size:1.1rem;border:none;">−</button>
                    <span style="width:36px;text-align:center;font-weight:600;">${item.quantity}</span>
                    <button onclick="updateQuantity(${index},1)"  style="width:32px;height:32px;border-radius:4px;background:var(--off-white);cursor:pointer;font-size:1.1rem;border:none;">+</button>
                    <button onclick="removeFromCart(${index})" style="margin-left:auto;color:var(--error);font-size:.85rem;background:none;border:none;cursor:pointer;">Remove</button>
                </div>
            </div>
            <div style="text-align:right;font-weight:600;color:var(--charcoal);">€${(item.price*item.quantity).toFixed(2)}</div>
        </div>`;
    }).join('');

    const sub = getCartTotal();
    const s = document.getElementById('cartSubtotal');
    const d = document.getElementById('cartDelivery');
    const t = document.getElementById('cartTotal');
    if (s) s.textContent = `€${sub.toFixed(2)}`;
    if (d) d.textContent = sub >= CONFIG.FREE_DELIVERY_THRESHOLD ? 'FREE (Belgium orders ≥€500) – surcharge shown at checkout for other countries' : 'Calculated at checkout (free in Belgium over €500)';
    if (t) t.textContent = `€${sub.toFixed(2)} + delivery`;
}

// =========================================
// DELIVERY PAGE
// =========================================
function renderDeliveryPage() {
    const container = document.getElementById('deliverySchedule');
    if (!container) return;

    container.innerHTML = deliverySchedule.map(day => `
        <div class="schedule-day ${day.day==='Sunday'?'sunday':''}">
            <div class="schedule-day-header">
                <span class="schedule-emoji">${day.emoji}</span>
                <h3>${day.day}</h3>
            </div>
            <ul>${day.routes.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>`).join('');

    const lookupForm   = document.getElementById('postcodeLookupForm');
    const lookupResult = document.getElementById('postcodeLookupResult');
    if (lookupForm && lookupResult) {
        lookupForm.addEventListener('submit', e => {
            e.preventDefault();
            const country  = document.getElementById('lookupCountry').value;
            const postcode = document.getElementById('lookupPostcode').value.trim();
            const zone  = deliveryZones[country];
            const valid = zone?.fullCoverage || zone?.validPrefixes?.some(p => postcode.startsWith(p));
            const excl  = zone?.excludedPrefixes?.some(p => postcode.startsWith(p));
            const day   = getDeliveryDayHint(country, postcode);
            const fee   = getDeliveryFee(country, postcode);
            const feeLabel = country === 'BE' ? 'Free delivery (Belgium)' : `€${fee} delivery surcharge`;

            if (!valid || excl) {
                lookupResult.innerHTML = `<div class="lookup-result error">⚠ We don't currently deliver to this postcode area.</div>`;
            } else if (day) {
                lookupResult.innerHTML = `<div class="lookup-result success">✅ Estimated delivery day: <strong>${day}</strong><br><small>${feeLabel} · Delivery may be rescheduled if fewer than 4 orders on your route.</small></div>`;
            } else {
                lookupResult.innerHTML = `<div class="lookup-result info">📅 We deliver to your area (${feeLabel}). Contact us for the exact delivery day.</div>`;
            }
        });
    }
}

// =========================================
// NEWSLETTER
// =========================================
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', e => { e.preventDefault(); showToast('Thank you for subscribing!', 'success'); form.reset(); });
}

// =========================================
// SHARED NAV (with Home button everywhere)
// =========================================
function buildSharedNav() {
    return `
    <div class="announcement-bar" id="sharedAnnouncementBar">
        <p>Free Delivery in Belgium on Orders Over €500 &nbsp;|&nbsp; Cash on Delivery &nbsp;|&nbsp; BE · NL · LU · FR · DE</p>
    </div>
    <header class="header" id="header">
        <div class="header-container">
            <a href="index.html" class="logo">
                <span class="logo-text">VANTAGE</span>
                <span class="logo-subtext">HOME</span>
            </a>
            <nav class="main-nav" id="mainNav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="index.html" class="nav-link" style="font-weight:600;">🏠 Home</a></li>
                    <li class="nav-item has-dropdown">
                        <a href="products.html?category=beds" class="nav-link">Beds</a>
                        <div class="dropdown-menu"><div class="dropdown-content">
                            <div class="dropdown-column"><h4>Shop by Style</h4><ul>
                                <li><a href="products.html?category=beds&style=divan">Divan Beds</a></li>
                                <li><a href="products.html?category=beds&style=florida-panel">Panel Beds</a></li>
                                <li><a href="products.html?category=beds&style=sleigh-hilton">Sleigh & Hilton Beds</a></li>
                                <li><a href="products.html?category=beds&style=butterfly">Butterfly Beds</a></li>
                            </ul></div>
                            <div class="dropdown-column"><h4>Shop by Size</h4><ul>
                                <li><a href="products.html?category=beds">Single (90×200)</a></li>
                                <li><a href="products.html?category=beds">Double (140×200)</a></li>
                                <li><a href="products.html?category=beds">King (160×200)</a></li>
                                <li><a href="products.html?category=beds">Super King (180×200)</a></li>
                            </ul></div>
                        </div></div>
                    </li>
                    <li class="nav-item"><a href="products.html?category=mattresses" class="nav-link">Mattresses</a></li>
                    <li class="nav-item"><a href="products.html?category=sofas" class="nav-link">Sofas</a></li>
                    <li class="nav-item"><a href="products.html?category=dining" class="nav-link">Dining</a></li>
                    <li class="nav-item"><a href="products.html?category=wardrobes" class="nav-link">Wardrobes</a></li>
                    <li class="nav-item"><a href="delivery.html" class="nav-link" style="color:var(--gold);font-weight:600;">🚚 Delivery</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <button class="icon-btn search-toggle" aria-label="Search">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                </button>
                <a href="cart.html" class="icon-btn cart-btn" aria-label="Cart">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    <span class="cart-count" id="cartCount" style="display:none;">0</span>
                </a>
                <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Menu"><span></span><span></span><span></span></button>
            </div>
        </div>
        <div class="search-overlay" id="searchOverlay">
            <div class="search-container">
                <input type="text" placeholder="Search beds, sofas, mattresses..." id="searchInput">
                <button class="search-close" id="searchClose"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div class="search-results" id="searchResults"></div>
        </div>
    </header>
    <div class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-content">
            <div class="mobile-nav-header">
                <a href="index.html" style="display:flex;flex-direction:column;line-height:1;">
                    <span class="logo-text" style="font-family:var(--font-display);font-size:1.4rem;font-weight:600;color:var(--charcoal);letter-spacing:.15em;">VANTAGE</span>
                    <span style="font-size:.6rem;font-weight:500;color:var(--gold);letter-spacing:.4em;text-transform:uppercase;">HOME</span>
                </a>
                <button class="mobile-nav-close" id="mobileNavClose">✕</button>
            </div>
            <ul class="mobile-nav-list">
                <li class="mobile-nav-item"><a href="index.html" class="mobile-nav-link" style="color:var(--gold);font-weight:600;">🏠 Home</a></li>
                <li class="mobile-nav-item"><button class="mobile-nav-link" data-target="mob-beds">Beds <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                    <ul class="mobile-submenu" id="mob-beds">
                        <li><a href="products.html?category=beds&style=divan">Divan Beds</a></li>
                        <li><a href="products.html?category=beds&style=florida-panel">Panel Beds</a></li>
                        <li><a href="products.html?category=beds&style=sleigh-hilton">Sleigh & Hilton Beds</a></li>
                        <li><a href="products.html?category=beds&style=butterfly">Butterfly Beds</a></li>
                        <li><a href="products.html?category=beds" class="view-all">View All Beds →</a></li>
                    </ul>
                </li>
                <li class="mobile-nav-item"><a href="products.html?category=mattresses" class="mobile-nav-link">Mattresses</a></li>
                <li class="mobile-nav-item"><a href="products.html?category=sofas" class="mobile-nav-link">Sofas</a></li>
                <li class="mobile-nav-item"><a href="products.html?category=dining" class="mobile-nav-link">Dining Tables</a></li>
                <li class="mobile-nav-item"><a href="products.html?category=wardrobes" class="mobile-nav-link">Wardrobes</a></li>
                <li class="mobile-nav-item"><a href="delivery.html" class="mobile-nav-link" style="color:var(--gold);">🚚 Delivery Info</a></li>
            </ul>
        </div>
    </div>`;
}

function buildSharedFooter() {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <a href="index.html" class="logo" style="margin-bottom:1rem;display:inline-flex;">
                        <span class="logo-text" style="color:#fff;">VANTAGE</span>
                        <span style="color:var(--gold);font-size:.6rem;letter-spacing:.4em;margin-left:4px;align-self:flex-end;margin-bottom:4px;">HOME</span>
                    </a>
                    <p>Premium furniture for modern living. Serving Belgium, Netherlands, Luxembourg, France and Germany with Cash on Delivery. Inspect before you pay.</p>
                    <div class="social-links">
                        <a href="#" aria-label="Facebook" title="Chat with us on Facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                        <a href="#" aria-label="Instagram" title="DM us on Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                    </div>
                    <p style="font-size:.8rem;color:rgba(255,255,255,.6);margin-top:.75rem;">💬 Chat via Facebook, Instagram, or <a href="contact.html" style="color:var(--gold);">email us</a> before ordering</p>
                </div>
                <div class="footer-links"><h4>Shop</h4><ul>
                    <li><a href="products.html?category=beds">Beds</a></li>
                    <li><a href="products.html?category=mattresses">Mattresses</a></li>
                    <li><a href="products.html?category=sofas">Sofas</a></li>
                    <li><a href="products.html?category=dining">Dining Tables</a></li>
                    <li><a href="products.html?category=wardrobes">Wardrobes</a></li>
                </ul></div>
                <div class="footer-links"><h4>Support</h4><ul>
                    <li><a href="contact.html">Contact Us</a></li>
                    <li><a href="delivery.html">Delivery Information</a></li>
                    <li><a href="cart.html">My Cart</a></li>
                    <li><a href="checkout.html">Checkout</a></li>
                </ul></div>
                <div class="footer-links"><h4>Company</h4><ul>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="privacy.html">Privacy Policy</a></li>
                    <li><a href="terms.html">Terms & Conditions</a></li>
                </ul></div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 Vantage Home. All rights reserved.</p>
                <div class="delivery-countries">
                    <span>We deliver to:</span>
                    <img src="https://flagcdn.com/w20/be.png" alt="Belgium" title="Belgium – Free delivery over €500">
                    <img src="https://flagcdn.com/w20/nl.png" alt="Netherlands" title="Netherlands – +€30 (7xxx/8xxx +€50)">
                    <img src="https://flagcdn.com/w20/lu.png" alt="Luxembourg" title="Luxembourg – +€30">
                    <img src="https://flagcdn.com/w20/fr.png" alt="France" title="France – Northern regions, +€30">
                    <img src="https://flagcdn.com/w20/de.png" alt="Germany" title="Germany – Select regions, +€30">
                </div>
            </div>
        </div>
    </footer>`;
}

function injectSharedComponents() {
    document.querySelectorAll('[data-include="nav"]').forEach(el => { el.outerHTML = buildSharedNav(); });
    document.querySelectorAll('[data-include="footer"]').forEach(el => { el.outerHTML = buildSharedFooter(); });
}

function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    injectSharedComponents();
    await loadProducts();
    initHeader();
    updateCartCount();
    initNewsletter();

    const path = window.location.pathname;
    if (path.includes('index.html') || path.endsWith('/') || path === '') {
        initHeroSlider();
        renderFeaturedProducts();
    }
    if (path.includes('products.html'))  initProductsPage();
    if (path.includes('detail.html'))    initProductDetail();
    if (path.includes('checkout.html'))  initCheckout();
    if (path.includes('cart.html'))      renderCart();
    if (path.includes('delivery.html'))  renderDeliveryPage();
});