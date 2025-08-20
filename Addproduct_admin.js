 import { getProducts, saveToStorage, getFromStorage} from "./utils.js";

  // fill categories (from existing products)
  const select = document.getElementById("productCategory");
  const prods  = getProducts() || [];
//   const cats   = [...new Set(prods.map(p => p.category))];
//   select.innerHTML = '<option value="" disabled selected>Choose...</option>' +
//                      cats.map(c => `<option value="${c}">${c}</option>`).join("");


const categories = getFromStorage("categories", []); 

select.innerHTML = 
  '<option value="" disabled selected>Choose...</option>' +
  categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
  const form = document.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name   = document.getElementById("productName").value.trim();
    const cat    = document.getElementById("productCategory").value;
    const price  = Number(document.getElementById("productPrice").value);
    const stock  = Number(document.getElementById("productStock").value);
    const desc   = document.getElementById("productDescription").value.trim();
    const file   = document.getElementById("productImage").files[0];

    if (!name || !cat || price <= 0 || stock < 0 || !desc) {
      return alert("Please fill all fields");
    }

    const products = getProducts() || [];
    const newId = products.length > 0 ? products[products.length-1].id + 1 : 1;

    const saveProduct = (imgVal) => {
      products.push({
        id: newId,
        name,
        category: cat,
        price,
        stockQuantity: stock,
        description: desc,
        image: imgVal
      });
      saveToStorage("products", products);
      alert("Product added successfully!");
      form.reset();
    };

    if (file) {
      const r = new FileReader();
      r.onload = e => saveProduct(e.target.result);
      r.readAsDataURL(file);
    } else {
      saveProduct("images/placeholder.png");
    }
  });