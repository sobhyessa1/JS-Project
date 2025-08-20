import { addToCart } from "./cart.js";
import { getFromStorage, saveToStorage, getProducts,getProductById ,requireUserId} from "./utils.js"; // Get the current user ID
const KEY = "wishlists";              // [{ userId, productIds: [..] }]
const ADDED_AT_KEY = "wishlist_addedAt"; // { [userId]: { [productId]: timestamp } }
const wishlistitems = document.getElementById("Addtocart");
// Helpers
const ensureArray = (val) => (Array.isArray(val) ? val : []);
const toId = (v) => String(v);

function getWishlists() {
  return ensureArray(getFromStorage(KEY, []));
}
function saveWishlists(list) {
  saveToStorage(KEY, ensureArray(list));
}

// addedAt helpers (تاريخ الإضافة)
function getAddedAtMap() {
  return getFromStorage(ADDED_AT_KEY, {});
}
function saveAddedAtMap(map) {
  saveToStorage(ADDED_AT_KEY, map || {});
}
function setAddedAt(userId, productId, ts = Date.now()) {
  const map = getAddedAtMap();
  if (!map[userId]) map[userId] = {};
  map[userId][toId(productId)] = ts;
  saveAddedAtMap(map);
}
function removeAddedAt(userId, productId) {
  const map = getAddedAtMap();
  if (map[userId]) {
    delete map[userId][toId(productId)];
    saveAddedAtMap(map);
  }
}
function getAddedAt(userId, productId) {
  const map = getAddedAtMap();
  return map[userId]?.[toId(productId)] || null;
}

// API
export function toggleWishlist(userId, productId) {
  const uid = String(userId);
  const pid = toId(productId);

  const wishlists = getWishlists();
  let record = wishlists.find((w) => String(w.userId) === uid);

  if (!record) {
    record = { userId: uid, productIds: [] };
    wishlists.push(record);
  }

  // خلي IDs كلها Strings لتفادي مشاكل المقارنة
  record.productIds = record.productIds.map(toId);

  const idx = record.productIds.indexOf(pid);
  let added = false;

  if (idx > -1) {
    // remove
    record.productIds.splice(idx, 1);
    removeAddedAt(uid, pid);
  } else {
    // add
    record.productIds.push(pid);
    setAddedAt(uid, pid);
    added = true;
  }

  saveWishlists(wishlists);
  return added; // true لو اتضاف، false لو اتشال
}

export function getWishlist(userId) {
  const uid = String(userId);
  const wishlists = getWishlists();
  const record = wishlists.find((w) => String(w.userId) === uid);
  return record ? record.productIds.map(toId) : [];
}

// UI Rendering
function formatPrice(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isFinite(n)) {
    const s = n % 1 === 0 ? String(n) : n.toFixed(2);
    return `${s}$`; // عشان تبقى زي المثال 120$
  }
  return `${v}$`;
}
function inStockText(p) {
  const hasQty = Number(p?.stock ?? p?.quantity ?? 0) > 0;
  const bool = !!p?.inStock;
  return (hasQty || bool) ? "in stock" : "out of stock";
}
function formatDate(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return "—";
  }
}
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function bindWishlistEvents(userId) {
  const body = document.getElementById("wishlist-body");
  if (!body || body.dataset.bound === "1") return;

  body.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="remove"]');
    if (!btn) return;

    const tr = btn.closest("tr");
    const productId = tr?.dataset.productId;
    if (!productId) return;

    toggleWishlist(userId, productId);
    showWishlist(userId);
  });

  body.dataset.bound = "1";
}

export function showWishlist(userId) {
  const body = document.getElementById("wishlist-body");
  if (!body) {
    console.error("Wishlist body element not found");
    return;
  }

  bindWishlistEvents(userId);

  const productIds = getWishlist(userId); // strings
  const products = getProducts();         // من localStorage
  const byId = new Map(products.map((p) => [toId(p.id), p]));

  // جهز العناصر (بالترتيب: الأحدث أولاً)
  const items = productIds
    .map((pid) => {
      const product = byId.get(pid);
      return {
        pid,
        product,
        addedAt: getAddedAt(userId, pid) || 0
      };
    })
    .filter((x) => !!x.product) // سيب الغير موجود لو اتحذف من الستور
    .sort((a, b) => b.addedAt - a.addedAt);

  if (items.length === 0) {
    body.innerHTML = `
      <tr class="text-center">
        <td colspan="5">Your wishlist is empty.</td>
      </tr>
    `;
    return;
  }

body.innerHTML = items.map(({ pid, product, addedAt }) => `
  <tr data-product-id="${pid}">
    
    <!-- اسم المنتج -->
    <td>
      <div class="product-name d-flex align-items-center gap-2">
        <img 
          class="img-whishlist" 
          src="${escapeHtml(product.image || "images/placeholder.png")}" 
          alt="${escapeHtml(product.name || "product")}" 
        />
        <p class="mb-0">${escapeHtml(product.name || "Unnamed product")}</p>
      </div>
    </td>

    <!-- السعر -->
    <td>${formatPrice(product.price)}</td>

    <!-- زرار Add to Cart -->
    <td>
      <button 
        class="btn rounded-pill px-4 py-2" 
        style="background-color: #3BB3A2; color: #fff; border: none;" 
        data-action="add-to-cart"
      >
        Add to cart
      </button>
    </td>

    <!-- زرار Remove -->
    <td class="text-end">
      <button 
        class="btn btn-link text-danger p-0" 
        data-action="remove" 
        title="Remove"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  </tr>
`).join("");
body.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="add-to-cart"]');
  if (!btn) return;

  const tr = btn.closest("tr");
  const productId = tr?.dataset.productId;
  if (!productId) return;

  const product1 = getProductById(Number(productId));
 
  if (!product1) {
    return;
  } 
 addToCart(requireUserId(), product1, 1);

  alert(`Product ${productId} added to cart!`);
})}