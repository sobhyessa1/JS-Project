// orders.js
import { getFromStorage, saveToStorage ,saveProducts ,getProducts} from './utils.js';

const asArray = (v) => Array.isArray(v) ? v : [];

export function getAllOrders() {
  return asArray(getFromStorage("orders"));
}

export function renderOrdersTable() {
  const orders = getAllOrders();
  const tbody = document.querySelector('table tbody');
  if (!tbody) {
    console.error('Table body not found');
    return;
  }
  tbody.innerHTML = ''; // تفريغ الجدول

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="text-center">No orders found.</td></tr>
    `;
    return;
  }

  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.userId}</td>
      <td>$${order.total}</td>
      <td class="${order.status === 'pending' ? 'text-warning' : order.status === 'completed' ? 'text-success' : 'text-danger'}">${order.status}</td>
      <td>
        <button class="btn btn-success btn-sm" data-id="${order.orderId}" data-action="accept" ${order.status === 'completed' ? 'disabled' : ''}>Accept</button>
        <button class="btn btn-danger btn-sm" data-id="${order.orderId}" data-action="cancel" ${order.status === 'cancelled' ? 'disabled' : ''}>Cancel</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', e => {
      const orderId = e.target.getAttribute('data-id');
      const action = e.target.getAttribute('data-action');
      if (action === 'accept') {
        updateOrderStatus(orderId, 'completed');
      } else if (action === 'cancel') {
        updateOrderStatus(orderId, 'cancelled');
      }
      renderOrdersTable();  // إعادة تحميل الصفحة بعد التحديث
    });
  });
}
export function updateOrderStatus(orderId, status) {
  const allowedStatuses = new Set(["pending", "completed", "cancelled"]);
  if (!allowedStatuses.has(status)) {
    console.error("Invalid status");
    return false;
  }
  const orders = asArray(getFromStorage("orders"));
  const orderIndex = orders.findIndex(o => o.orderId === orderId);
  if (orderIndex === -1) return false;

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();

  saveToStorage("orders", orders);
   if(orders[orderIndex].status === 'completed') {
    console.log("Order completed:", orders[orderIndex]);
    reduceStockQuantities(orders[orderIndex]);}
  return true;
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  renderOrdersTable();
});


function reduceStockQuantities(order) {
  const products = getProducts();
  console.log(products);
  order.items.forEach(orderItem => {
   
    console.log("Order Item:", orderItem);

    
    const product = products.find(p => p.id === orderItem.productId );

    if (product) {
      console.log("Reducing stock for product:", product.name, "Current stock:", product.stockQuantity);

      const orderedQty = orderItem.qty || orderItem.quantity || 0;
      product.stockQuantity = Math.max((product.stockQuantity || 0) - orderedQty, 0);

      console.log("New stock:", product.stockQuantity);
    } else {
      console.warn("Product not found for order item:", orderItem);
    }
  });

  saveProducts(products);
}
