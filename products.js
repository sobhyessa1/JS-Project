// path: js/products.js
import { RunderProducts } from "./constant.js";
import { getProducts } from "./utils.js";

const container     = document.getElementById("products");
const searchInput   = document.getElementById("search-input");
const searchButton  = document.getElementById("search-button");

// عناصر السايدبار
const sbName     = document.getElementById('filter-name');
const sbCategory = document.getElementById('filter-category');
const sbMaxPrice = document.getElementById('filter-max-price');
const sbReset    = document.getElementById('filters-reset');

// Loader الستكي
const loaderEl = document.getElementById('products-loader');

let _productsCache = null;
async function getProductsCached() {
  if (_productsCache) return _productsCache;
  _productsCache = await getProducts();
  return _productsCache;
}

const normalize = v => (v ?? '').toString().toLowerCase().trim();
const toNumber = v => {
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const isSet = v => v !== undefined && v !== null && v !== '';

export async function filterProducts(filters = {}, { useCache = true } = {}) {
  const {
    name = '',
    category = '',
    maxPrice,   // رقم أو نص
    minPrice    // اختياري
  } = filters;

  const term = normalize(name);
  const termTokens = term.split(/\s+/).filter(Boolean);
  const cat = normalize(category);

  const hasMax = isSet(maxPrice) && !Number.isNaN(Number(maxPrice));
  const hasMin = isSet(minPrice) && !Number.isNaN(Number(minPrice));
  const maxP = hasMax ? Number(maxPrice) : Infinity;
  const minP = hasMin ? Number(minPrice) : 0;

  const products = useCache ? await getProductsCached() : await getProducts();

  return products.filter(p => {
    const pName = normalize(p.name);
    const pCat = normalize(p.category);
    const pPrice = toNumber(p.price);

    const okName  = termTokens.length === 0 || termTokens.every(t => pName.includes(t));
    const okCat   = !cat || pCat === cat;
    const okPrice = pPrice >= minP && pPrice <= maxP;

    return okName && okCat && okPrice;
  });
}

// حالة الفلاتر
const state = { name: "", category: "", maxPrice: "" };

let lastReqId = 0;
export async function showProducts({ name = "", category = "", maxPrice = "" } = {}) {
  if (!container) return;

  // حدث تغيير الحالة من أي مكان
  state.name = name ?? state.name;
  state.category = category ?? state.category;
  state.maxPrice = maxPrice ?? state.maxPrice;

  const reqId = ++lastReqId;

  // شغّل اللودر الستكي
  if (loaderEl) loaderEl.style.display = 'inline-block';

  // فلترة
  const mp = (state.maxPrice === "" || state.maxPrice === null) ? undefined : Number(state.maxPrice);
  const products = await filterProducts({ name: state.name, category: state.category, maxPrice: mp });

  // لو في طلب أحدث اتجاهل النتيجة
  if (reqId !== lastReqId) return;

  // قفّل اللودر
  if (loaderEl) loaderEl.style.display = 'none';

  if (!products || products.length === 0) {
    container.innerHTML = '<p class="text-muted">No products found.</p>';
    return;
  }

  // رندر
  RunderProducts(products, container, searchInput, searchButton);
}

// تهيئة قائمة التصنيفات والحد الأقصى للسعر
async function initCategories() {
  try {
    const all = await getProductsCached();
    const cats = [...new Set(all.map(p => p.category).filter(Boolean))].sort();
    if (sbCategory) {
      sbCategory.innerHTML = '<option value="">All</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    const max = Math.max(...all.map(p => Number(p.price) || 0));
    if (sbMaxPrice && Number.isFinite(max) && max > 0) {
      sbMaxPrice.max = Math.ceil(max);
      if (!sbMaxPrice.placeholder) sbMaxPrice.placeholder = `e.g. ${Math.round(max * 0.8)}`;
    }
  } catch (e) {
    console.warn('initCategories failed', e);
  }
}

// ربط السايدبار + سيرش النافبار
function wireUI() {
  const debounce = (fn, ms = 250) => {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };
  const debouncedShow = debounce(() => showProducts(state), 250);

  sbName?.addEventListener('input', e => { state.name = e.target.value; debouncedShow(); });
  sbCategory?.addEventListener('change', e => { state.category = e.target.value; showProducts(state); });
  sbMaxPrice?.addEventListener('input', e => { state.maxPrice = e.target.value; debouncedShow(); });
  sbReset?.addEventListener('click', () => {
    state.name = ""; state.category = ""; state.maxPrice = "";
    if (sbName) sbName.value = "";
    if (sbCategory) sbCategory.value = "";
    if (sbMaxPrice) sbMaxPrice.value = "";
    showProducts(state);
  });

  if (searchInput) {
    const form = searchButton?.closest('form') || searchInput.closest('form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        state.name = searchInput.value.trim();
        showProducts(state);
      });
    }
  }
}

// إقلاع
(async function init() {
  await initCategories();
  wireUI();
  await showProducts(state);
})();