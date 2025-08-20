import { getFromStorage, saveToStorage,getProducts,getProductById ,requireUserId } from './utils.js';
import { placeOrder } from './orders.js';

import { RenderCartItem } from './constant.js';
const container = document.getElementById("cart-container");
const KEY = "carts"; // Get the current user ID
const totalElem = document.getElementById("cart-total");
const checkoutButton = document.getElementById("check-out");
if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        if (placeOrder(requireUserId())) {
            alert("Order placed successfully!");}
        });
    }
export function getCart(userId) {
    console.log("getCart called with userId:", userId);
    let carts = getFromStorage(KEY);
     if (!carts || !Array.isArray(carts)) {
        carts = [];
    }
    const userCart = carts.find(c => c.userId === userId);
    if (!userCart) {
        
        const newCart = { userId, items: [] };
        carts.push(newCart);
        saveToStorage(KEY, carts);
        console.log("Created new cart:", newCart);
        return newCart;
    }

    console.log("Found existing cart:", userCart);
    console.log("Cart items:", userCart.items);
    return userCart;
    
}
export function addToCart(userId, product, quantity = 1) {
    console.log("Adding product:", product);

    
    let carts = getFromStorage(KEY);
    if (!carts || !Array.isArray(carts)) {
        carts = [];
    }

    
    let userCart = carts.find(c => c.userId === userId);
    if (!userCart) {
        userCart = { userId, items: [] };
        carts.push(userCart);
    }

    
    let item = userCart.items.find(i => i.productId === product.id);
    if (item) {
        item.quantity += quantity;
    } else {
        userCart.items.push({ productId: product.id, name: product.name, price: product.price, quantity });
    }

    
    saveToStorage(KEY, carts);
    console.log("Cart updated successfully:", carts);
}


export function updateQuantity(userId, productId, change) {
    let carts = getFromStorage(KEY);
    if (!Array.isArray(carts)) carts = [];

    let userCart = carts.find(c => c.userId === userId);
    if (!userCart) {
        console.warn("No cart found for user:", userId);
        
        return;
    }

    let item = userCart.items.find(i => i.productId === productId);

    if (item) {
        const product = getProductById(productId); // جبت المنتج من localStorage

        // لو المنتج موجود وعايز أزود الكمية
        if (change > 0 && product && item.quantity >= product.stockQuantity) {
            alert(`Reached stock limit for: ${product.name}` );
            return; // مايزودش عن الـ stock
        }

        item.quantity += change;

        if (item.quantity <= 0) {
           if( confirm("Are you sure you want to remove this item from the cart?") )
            userCart.items = userCart.items.filter(i => i.productId !== productId);
        else {
            item.quantity = 1; // إعادة الكمية إلى 1 إذا تم إلغاء الإزالة
           
        }
        
        }
    } else {
        console.warn("Product not found in cart:", productId);
    }
 container.innerHTML = "";
    // Clear the total element 
    saveToStorage(KEY, carts);
    showCart(requireUserId());
}




// export function updateQuantity(userId, productId, change) {
//     let carts = getFromStorage(KEY);
//     if (!Array.isArray(carts)) carts = [];

    
//     let userCart = carts.find(c => c.userId === userId);
//     if (!userCart) {
//         console.warn("No cart found for user:", userId);
//         return;
//     }

    
//     let item = userCart.items.find(i => i.productId === productId);

//     if (item) {
        
//         item.quantity += change;

//         if (item.quantity <= 0) {
            
//             userCart.items = userCart.items.filter(i => i.productId !== productId);
//         }
//     } else {
//         console.warn("Product not found in cart:", productId);
//     }
//      container.innerHTML = "";
// // Clear the container before rendering
    
//     saveToStorage(KEY, carts);
//     showCart(User_Id) 
// }


export function getTotalPrice(userId) {

    return getCart(userId).items.reduce((t, i) => t + (i.price * i.quantity), 0);
}

export async function showCart(userId) {
    console.log("showCart called with userId:", userId);
    const products = await getProducts();
    const cartItems = getCart(userId).items;
    

    if (!container) return;
    if (cartItems.length === 0) {
        totalElem.innerHTML = "$0.00";
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }
     
   RenderCartItem(cartItems, products, container);

}
