
import { getProducts, saveToStorage } from "./utils.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
let products = getProducts() || [];
let prod = products.find(p => p.id === id);

const inputName  = document.getElementById("pName");
const inputCat   = document.getElementById("pCategory");
const inputPrice = document.getElementById("pPrice");
const inputDesc  = document.getElementById("pDesc");
const inputImage = document.getElementById("pImage");
const preview    = document.getElementById("preview");

if (!prod) {
  alert("Product not found");
} else {
  // fill
  inputName.value  = prod.name;
  inputCat.value   = prod.category;
  inputPrice.value = prod.price;
  inputDesc.value  = prod.description;
  preview.src      = prod.image; // show current image
}

// preview when user selects a new image
inputImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => { preview.src = ev.target.result };
    reader.readAsDataURL(file);
  }
});

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!prod) return;

  prod.name       = inputName.value.trim();
  prod.category   = inputCat.value.trim();
  prod.price      = Number(inputPrice.value);
  prod.description = inputDesc.value.trim();

  const file = inputImage.files[0];
  if (file) {
    // store new image
    const r = new FileReader();
    r.onload = (evt) => {
      prod.image = evt.target.result;
      saveToStorage("products", products);
      finish();
    };
    r.readAsDataURL(file);
  } else {
    // no new image
    saveToStorage("products", products);
    finish();
  }

  function finish(){
    alert("Product updated successfully!");
    window.location.href = "product.html";
  }
});
