

import { getProducts, getFromStorage, saveToStorage } from "./utils.js";

// document.getElementById("catForm").addEventListener("submit",(e)=>{
//   e.preventDefault();
//   const name = document.getElementById("catName").value.trim();
//   if(!name) return alert("Please enter a category name");

//   const prodCats  = (getProducts() || []).map(p=>p.category.toLowerCase());
//   const savedList = getFromStorage("categories", []);
//   const savedNames = savedList.map(c=>c.name.toLowerCase());

//   if (prodCats.includes(name.toLowerCase()) || savedNames.includes(name.toLowerCase())){
//     return alert("Category already exists");
//   }

//   const newId = (savedList.length>0 ? savedList[savedList.length-1].id + 1 : 1);
//   savedList.push({ id:newId, name });
//   saveToStorage("categories", savedList);

//   alert("Category added successfully!");
//   e.target.reset();
// });



document.getElementById("catForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("catName").value.trim();

  if (!name) {
    return alert("Please enter a category name");
  }
  const regex = /^[A-Za-z\s]{5,20}$/;  
  if (!regex.test(name)) {
    return alert("Category name must be only letters (5–20 characters).");
  }
  const prodCats  = (getProducts() || []).map(p => p.category.toLowerCase());
  const savedList = getFromStorage("categories", []);
  const savedNames = savedList.map(c => c.name.toLowerCase());

  if (prodCats.includes(name.toLowerCase()) || savedNames.includes(name.toLowerCase())) {
    return alert("Category already exists");
  }

  const newId = (savedList.length > 0 ? savedList[savedList.length - 1].id + 1 : 1);
  savedList.push({ id: newId, name });
  saveToStorage("categories", savedList);

  alert("Category added successfully!");
  window.location.href = "categories.html";
  e.target.reset();
});