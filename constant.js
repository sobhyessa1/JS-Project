import{ addToCart,getTotalPrice ,updateQuantity} from "./cart.js";
import { toggleWishlist } from "./wishlist.js";
import { showProducts } from "./products.js";
import { getFromStorage, saveToStorage,getProductById} from './utils.js';
import { requireUserId } from "./utils.js";
 // Assuming a static user ID for simplicity
// path: js/constant.js

let productEventsBound = false;
let currentRenderedProducts = [];
 // Get the current user ID

export function RunderProducts(products, container, searchInput, searchButton) {
  if (!container) return;

  currentRenderedProducts = products;
  container.innerHTML = "";

  const frag = document.createDocumentFragment();

  products.forEach(product => {
    const price = Number(product.price) || 0;
    const oldPrice = product.oldPrice != null ? Number(product.oldPrice) : null;

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-3 my-4";

    // مهم للفلترة
    col.setAttribute('data-product', '');
    col.dataset.id = String(product.id);
    col.dataset.name = String(product.name || '');
    col.dataset.category = String(product.category || '');
    col.dataset.price = String(price);

    col.innerHTML = `
      <div class="card">
        <div class="card-color">
          <div class="p-3">
            ${product.sale ? '<span class="bg-danger text-light px-2 py-1 rounded">SALE</span>' : ''}
          </div>
          <div class="cards-img d-flex justify-content-center align-items-center" style="min-height:180px;">
            <img src="${escapeHtml(product.image || '')}" alt="${escapeHtml(product.name || 'Product')}"
                 onerror="this.src='https://via.placeholder.com/600x400?text=Image';"
                 style="max-height:180px; object-fit:contain;">
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title fs-5">${escapeHtml(product.name || '')}</h3>
          <p class="card-text mb-1">
            $${price.toFixed(2)}
            ${oldPrice != null ? `<span class="text-decoration-line-through text-secondary">$${oldPrice.toFixed(2)}</span>` : ''}
          </p>
          <p class="card-text text-secondary">${escapeHtml(product.category || '')}</p>

          <div class="d-flex justify-content-between align-items-center">
            <button class="btn btn-danger add-to-cart" data-id="${product.id}">Add to Cart</button>
            <button class="btn btn-outline-danger add-to-wishlist" data-id="${product.id}">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    frag.appendChild(col);
  });

  container.appendChild(frag);

  // اربط الأحداث مرة واحدة
  if (!productEventsBound) {
    bindProductEvents(container, searchInput, searchButton);
    productEventsBound = true;
  }
}

function bindProductEvents(container, searchInput, searchButton) {
  // تفويض أحداث
  container.addEventListener("click", (e) => {
    const btnWish = e.target.closest(".add-to-wishlist");
    const btnCart = e.target.closest(".add-to-cart");
    if (!btnWish && !btnCart) return;

    const id = (btnWish || btnCart).dataset.id;
    const product = currentRenderedProducts.find(p => String(p.id) === String(id));
    if (!product) return;

    if (btnWish) {
      toggleWishlist?.(requireUserId(), id);
      console.log("Added to wishlist:", product);
    } else {
      addToCart?.(requireUserId(), product, 1);
      console.log("Added to cart:", product);
    }
  });

  // سيرش النافبار
  if (searchInput) {
    const form = searchButton?.closest('form') || searchInput.closest('form');
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await showProducts({ name: searchInput.value.trim() });
      });
    } else if (searchButton) {
      searchButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await showProducts({ name: searchInput.value.trim() });
      });
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function RenderCartItem(cartItems, products, container) 
{
    //  cartItems.forEach(item => {
    //     const product = products.find(p => p.id === item.productId);
    //     if (!product) return;
    //     const row = document.createElement("div");
    //     row.className = "row align-items-center cart-item mt-3";
    //     row.innerHTML = `
    //       <div class="col-md-6 d-flex align-items-center mb-3 mb-md-0">
    //         <img src="${product.image}" class="product-img me-3 w-25" alt="${product.name}">
    //         <div>
    //           <p class="mb-1 fw-semibold">${product.name}</p>
    //           <span class="text-muted">$${product.price}</span>
    //         </div>
    //       </div>
    //       <div class="col-md-3 d-flex justify-content-center mb-3 mb-md-0">
    //         <div class="box-quantity">
    //           <button class="fa-solid fa-minus" data-id="${item.productId}"></button>
    //           <span>${item.quantity}</span>
    //           <button class="fa-solid fa-plus" data-id="${item.productId}"></button>
    //         </div>
    //       </div>
    //       <div class="col-md-3 d-flex justify-content-between align-items-center">
    //         <span class="fw-semibold">$${(item.quantity * product.price).toFixed(2)}</span>
    //         <i class="fa-solid fa-trash text-danger" data-id="${item.productId}"></i>
    //       </div>
    //     `;
    //     container.appendChild(row);
    // });
    ///////////////////////////////////////////////////////////
// cartItems.forEach(item => {
//   const product = products.find(p => p.id === item.productId);
//   if (!product) return;

//   const row = document.createElement("div");
//   row.className = "row align-items-center cart-item mt-3 pb-3 border-bottom";

//   row.innerHTML = `
//     <div class="col-md-6 d-flex align-items-center mb-3 mb-md-0">
//       <img src="${product.image}" class="product-img me-3 rounded border" style="width: 80px; height: 80px; object-fit: cover;" alt="${product.name}">
//       <div>
//         <p class="mb-1 fw-semibold">${product.name}</p>
//         <span class="text-muted">$${Number(product.price).toFixed(2)}</span>
//       </div>
//     </div>
//     <div class="col-md-3 d-flex justify-content-center mb-3 mb-md-0">
//       <div class="box-quantity d-flex align-items-center">
//         <button class="fa-solid fa-minus btn btn-sm btn-outline-secondary me-2" data-id="${item.productId}"></button>
//         <span class="fw-bold">${item.quantity}</span>
//         <button class="fa-solid fa-plus btn btn-sm btn-outline-secondary ms-2" data-id="${item.productId}"></button>
//       </div>
//     </div>
//     <div class="col-md-3 d-flex justify-content-between align-items-center">
//       <span class="fw-semibold">$${(item.quantity * product.price).toFixed(2)}</span>
//       <i class="fa-solid fa-trash text-danger ms-3" role="button" data-id="${item.productId}"></i>
//     </div>
//   `;

//   container.appendChild(row);
// });
///////////////////////////////////////////////////////////////////
cartItems.forEach(item => {
  const product = products.find(p => p.id === item.productId);
  if (!product) return;

  const row = document.createElement("div");
  row.className = "row align-items-center cart-item mt-3";

  row.innerHTML = `
    <div class="col-md-6 d-flex align-items-center mb-3 mb-md-0">
      <img src="${product.image}" class="product-img me-3 w-25" alt="${product.name}">
      <div>
        <p class="mb-1 fw-semibold">${product.name}</p>
        <span class="text-muted">$${product.price}</span>
      </div>
    </div>
    <div class="col-md-3 d-flex justify-content-center mb-3 mb-md-0">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-danger rounded-circle btn-minus" data-id="${item.productId}">
          <i class="fa-solid fa-minus"></i>
        </button>
        <span class="fw-bold">${item.quantity}</span>
        <button class="btn btn-sm btn-outline-success rounded-circle btn-plus" data-id="${item.productId}">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
    <div class="col-md-3 d-flex justify-content-between align-items-center">
      <span class="fw-semibold">$${(item.quantity * product.price).toFixed(2)}</span>
      <i class="fa-solid fa-trash text-danger btn-delete" data-id="${item.productId}"></i>
    </div>
  `;
  container.appendChild(row);
});
     const totalElem = document.getElementById("cart-total");
     totalElem.innerHTML = ""; // Clear previous total
     totalElem.innerHTML = `$${getTotalPrice(requireUserId()).toFixed(4)}`;

    
   AttachCartOperation(container);
}






function AttachCartOperation(container) {
  // زرار الحذف
  container.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const productId = Number(btn.dataset.id);
      updateQuantity(requireUserId(), productId, -Number.MAX_SAFE_INTEGER);
    });
  });

  // زرار الزيادة
  container.querySelectorAll(".btn-plus").forEach(btn => {
    btn.addEventListener("click", () => {
      updateQuantity(requireUserId(), Number(btn.dataset.id), 1);
    });
  });

  // زرار النقص
  container.querySelectorAll(".btn-minus").forEach(btn => {
    btn.addEventListener("click", () => {
      updateQuantity(requireUserId(), Number(btn.dataset.id), -1);
    });
  });
}





