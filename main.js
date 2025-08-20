import { showProducts } from "./products.js";
import { showCart } from "./cart.js";
import { showWishlist } from "./wishlist.js";
import { showOrders_user } from "./orders.js";
import { addToCart } from "./cart.js";
import { toggleWishlist } from "./wishlist.js";
import { requireUserId  ,logout} from "./utils.js";


 // Get the current user ID
console.log("Auth module loaded");
  const STORAGE = {
    USERS: 'users',
    CURRENT_USER: 'currentUser', // {id, role}
  };

// window.addToCart = (product) => addToCart(USER_ID, product);
// window.toggleWishlist = (productId) => toggleWishlist(USER_ID, productId);

document.addEventListener("DOMContentLoaded", () => {
  console.log("Home page loaded");
  showProducts({});
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem(STORAGE.CURRENT_USER);
location.href="login.html"
 // Redirect to login page after logout
});

document.getElementById("BacktoStore")?.addEventListener("click", () => {
  localStorage.removeItem(STORAGE.CURRENT_USER);
location.href="../../../home.html"
 // Redirect to login page after logout
});

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
const fileName = path.split("/").pop();
console.log(fileName);

  if (fileName === "home.html"|| fileName === "product.html" ) {
    console .log("Home page loaded");
    showProducts({});
  }
  if (fileName==="cart.html") {
    const USER_ID = requireUserId();
    showCart(USER_ID);
  }
  if (fileName===("wishlist.html")) {
    const USER_ID = requireUserId();
    showWishlist(USER_ID);
  }
  if (fileName===("orders.html")) {
    const USER_ID = requireUserId();
    showOrders(USER_ID);
  }
});
