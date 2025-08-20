import { getProducts, getFromStorage, saveToStorage ,extractCategoriesFromProducts, deleteProductsByCategory } from "./utils.js";

window.addEventListener("DOMContentLoaded", ()=>{

  const tbody = document.getElementById("categories-body");
extractCategoriesFromProducts(); // Ensure categories are extracted from products
  const storedCats  = getFromStorage("categories", []); // [{id,name}]
   
  if(storedCats.length === 0){
    tbody.innerHTML = `<tr><td colspan="2">No categories</td></tr>`;
    return;
  }

  tbody.innerHTML = storedCats.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>
        <a href="edit_categories.html?id=${c.id}" class="btn btn-warning btn-sm px-3">Edit</a>
        <button class="btn btn-danger btn-sm" data-delete="${c.id}">Delete</button>
      </td>
    </tr>
  `).join("");


  // delete handler
 tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete]");
    if (!btn) return;

    if (confirm("Are you sure you want to delete this category?")) {
      const id = Number(btn.dataset.delete);

      
      const category = storedCats.find(c => c.id === id);
      if (category) {
        deleteProductsByCategory(category.name);
      }
      const filtered = storedCats.filter(c => c.id !== id);
      saveToStorage("categories", filtered);

      location.reload();
    }
    location.reload();
  });

});