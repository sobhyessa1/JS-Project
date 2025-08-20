function getProducts() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "products.json", false); 
    xhr.send();

    if (xhr.status == 200 && xhr.readyState == 4) {
        return JSON.parse(xhr.responseText);
    } else {
        throw new Error("Failed to fetch products. Status: " + xhr.status);
    }
}

function filterProducts(filters) {
    const products = getProducts();

    return products.filter(product => {
        return (!filters.name || product.name.toLowerCase().includes(filters.name.toLowerCase())) &&
               (!filters.category || product.category.toLowerCase() === filters.category.toLowerCase()) &&
               (!filters.price || product.price <= filters.price);
    });
}

function ShowProducts(name, category, maxPrice) {
    const filtered = {
        name: name,         
        category: category, 
        price: maxPrice             
    };
   
    var products_list = filterProducts(filtered);
    console.log(products_list);
    // var productList = document.getElementById("product-list");
    // productList.innerHTML = ""; // مسح القديم

    // products_list.forEach(function(product) {
    //     var productCard = document.createElement("div");
    //     productCard.className = "product-card";
    //     productCard.innerHTML = `
    //         <img src="${product.image}" alt="${product.name}" width="150">
    //         <h3>${product.name}</h3>
    //         <p>Category: ${product.category}</p>
    //         <p>Price: $${product.price}</p>
    //         <p>${product.description}</p>
    //         <p>Stock: ${product.stockQuantity}</p>
    //     `;
    //     productList.appendChild(productCard);
    // });
}

// ShowProducts("", "", 10); // عرض الكل في البداية



function addToWishlist(userId, productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    let userWishlist = wishlist.find(w => w.userId === userId);

    if (userWishlist) {
        if (!userWishlist.productIds.includes(productId)) {
            userWishlist.productIds.push(productId);
        }
        else {
             userWishlist.productIds = userWishlist.productIds.filter(id => id !== productId);
        }
    } else {
        wishlist.push({
            userId: userId,
            productIds: [productId]
        });
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}


function getWishlist(userId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    let userWishlist = wishlist.find(w => w.userId === userId);
    return userWishlist ? userWishlist.productIds : [];
}

function show_wish_Products(wish_ids) {
    const products = getProducts();

    return products.filter(product => {
        return ( product.id.includes(filters.id)) ;
    });
}



function addToCart(userId, product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let userCart = cart.find(c => c.userId === userId);

    if (!userCart) {
        userCart = { userId: userId, items: [] };
        cart.push(userCart);
    }

    let cartItem = userCart.items.find(item => item.productId === product.id);

    if (cartItem) {
        cartItem.quantity += 1; 
    } else {
        userCart.items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}


function updateQuantity(userId, productId, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let userCart = cart.find(c => c.userId === userId);

    if (userCart) {
        let cartItem = userCart.items.find(item => item.productId === productId);
        if (cartItem) {
            cartItem.quantity += change;

            if (cartItem.quantity <= 0) {
                
                userCart.items = userCart.items.filter(item => item.productId !== productId);
            }
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}

function getTotalPrice(userId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let userCart = cart.find(c => c.userId === userId);

    if (!userCart) return 0;

    return userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}



function getCart(userId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let userCart = cart.find(c => c.userId === userId);
    return userCart ? userCart.items : [];
}

function showCart(userId) {
     const products = getProducts(); 
    var list_cart;
    const cartItems = getCart(userId);
    if (cartItems.length === 0) {
        list_cart = "Your cart is empty.";
    } else {
        list_cart = cartItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}" width="50">
                    <h4>${product.name}</h4>
                    <p>Price: $${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <button onclick="updateQuantity('${userId}', '${item.productId}', -1)">-</button>
                    <button onclick="updateQuantity('${userId}', '${item.productId}', 1)">+</button>
                </div>
            `;
        }).join('');
    }

}

 
   


let product1 = { id: 1, name: "Laptop", price: 5000 };
let product2 = { id: 2, name: "Mouse", price: 200 };

// addToCart(1, product1);
// addToCart(1, product2);
// addToCart(1, product2); 


// console.log("Total:", getTotalPrice(1)); 

// updateQuantity(1, 102, -1); 
// updateQuantity(1, 102, -1); 
// updateQuantity(1, 101, -6); 


// updateQuantity(1, 1, -20); 
// updateQuantity(1, 2, -20); 

// console.log(getCart(1));
// console.log("Total:", getTotalPrice(1));

updateQuantity(1,1,1)


console.log(getCart(1));


















































//     <div id="product-list"></div>

// <script>
// const storedProducts = JSON.parse(localStorage.getItem("products")) || [];

// const productList = document.getElementById("product-list");

// storedProducts.forEach(product => {
//     productList.innerHTML += `
//         <div class="product-card">
//             <img src="${product.image}" alt="${product.name}" width="150">
//             <h3>${product.name}</h3>
//             <p>Category: ${product.category}</p>
//             <p>Price: $${product.price}</p>
//             <p>${product.description}</p>
//             <p>Stock: ${product.stockQuantity}</p>
//         </div>
//     `;
// });
// </script>
