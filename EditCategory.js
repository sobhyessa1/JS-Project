
// import { getFromStorage, saveToStorage ,deleteProductsByCategory } from "./utils.js";

// const params = new URLSearchParams(window.location.search);
// const id     = Number(params.get("id"));

// let categories = getFromStorage("categories", []);
// let category   = categories.find(c=>c.id === id);

// if(!category){
//   alert("Category not found");
//   window.location.href = "categories.html";
// }

// document.getElementById("catName").value = category.name;

// document.getElementById("editForm").addEventListener("submit",(e)=>{

//   e.preventDefault();
//   category.name = document.getElementById("catName").value.trim();
//    const savedList = getFromStorage("categories", []);
//     const savedNames = savedList.map(c=>c.name.toLowerCase());
  
//     if ( savedNames.includes(category.name.toLowerCase())){
//       return alert("Category already exists");
//     }
//   else {
//   saveToStorage("categories", categories);
//   alert("Category updated successfully!");
//   window.location.href = "categories.html";}
// });



import { getFromStorage, saveToStorage, updateProductsCategory } from "./utils.js";

const params = new URLSearchParams(window.location.search);
const id     = Number(params.get("id"));

let categories = getFromStorage("categories", []);
let category   = categories.find(c => c.id === id);

if (!category) {
  alert("Category not found");
  window.location.href = "categories.html";
}

document.getElementById("catName").value = category.name;

document.getElementById("editForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const oldName = category.name; 
  const newName = document.getElementById("catName").value.trim();

  const savedList = getFromStorage("categories", []);
  const savedNames = savedList.map(c => c.name.toLowerCase());

  if (savedNames.includes(newName.toLowerCase())) {
    return alert("Category already exists");
  }

  category.name = newName;
  saveToStorage("categories", categories);
  updateProductsCategory(oldName, newName);

  alert("Category updated successfully!");
  window.location.href = "categories.html";
});