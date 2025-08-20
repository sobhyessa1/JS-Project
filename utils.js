export function getFromStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

export function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const PRODUCTS_KEY = "products";

export async function fetchAndStoreProducts() {
  const res = await fetch("../../products.json");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  saveToStorage(PRODUCTS_KEY, data);
  return data;
}

export function getProducts() {
  //fetchAndStoreProducts().catch(err => console.error("Error fetching products:", err));
  return getFromStorage(PRODUCTS_KEY);
}
export function saveProducts(products) {
  saveToStorage(PRODUCTS_KEY, products);
}


export function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
}

export function addProduct(newProduct) {
  const products = getProducts();
  products.push(newProduct);
  saveToStorage(PRODUCTS_KEY, products);
  return products;
}


export function extractCategoriesFromProducts() {
  const products = getProducts() || [];
  const prodCats = [...new Set(products.map(p => p.category?.toLowerCase()))]; // unique categories

  let savedList = getFromStorage("categories") || [];

  const savedNames = savedList.map(c => c.name.toLowerCase());

  prodCats.forEach(cat => {
    if (!savedNames.includes(cat)) {
      const newId = (savedList.length > 0 ? savedList[savedList.length - 1].id + 1 : 1);
      savedList.push({ id: newId, name: cat });
      savedNames.push(cat); 
    }
  });

  saveToStorage("categories", savedList);

  return savedList;
}


export function deleteProductsByCategory(categoryName) {
  let products = getProducts() || [];

  
  const target = categoryName.toLowerCase();


  const filtered = products.filter(p => p.category?.toLowerCase() !== target);

 
  saveToStorage(PRODUCTS_KEY, filtered);

}

export function updateProductsCategory(oldName, newName) {
  let products = getFromStorage(PRODUCTS_KEY) || [];

  const oldCat = oldName.toLowerCase();
  const newCat = newName.trim();

  
  products = products.map(p => {
    if (p.category?.toLowerCase() === oldCat) {
      return { ...p, category: newCat };
    }
    return p;
  });

  saveToStorage(PRODUCTS_KEY, products);

  return products; 
}


function getUserId() {
  try {
    const summary = window.Auth?.getCurrentUserSummary?.();
    if (summary?.id) return summary.id;
    const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return stored?.id || null;
   
  } catch {
    return null;
  }
}


export function  requireUserId() {
  const uid = getUserId();
  if (!uid) {
    alert('Please sign in to continue.');
    location.href = 'login.html';
    return null;
  }
  return uid;
}
export function logout() {
  try {
    
  window.Auth?.logout?.();}
  catch (err) {
    console.error("Logout failed:", err);
  }
}