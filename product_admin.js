 
  import { getProducts, saveToStorage } from "./utils.js";

  window.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("products-body");
    let products = getProducts() || [];

    // render
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No products found.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>$${p.price}</td>
        <td>${p.description}</td>
        <td><img src="${p.image}" alt="${p.name}" width="60"></td>
        <td>
          <a href="edit_product.html?id=${p.id}" class="btn btn-warning btn-sm px-3">Edit</a>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `).join("");

    // delete handler
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-action="delete"]');
      if (!btn) return;

      const id = Number(btn.dataset.id);
      products = products.filter(p => p.id !== id);
      saveToStorage("products", products);
      location.reload();
    });
  });
  
