// orders.js
import { getFromStorage, saveToStorage } from './utils.js';

const asArray = (v) => Array.isArray(v) ? v : [];

export function placeOrder(userId) {
  const carts = asArray(getFromStorage("carts")) || [];
  const orders = asArray(getFromStorage("orders")) || [];

  const userCart = carts.find(c => c?.userId === userId);

  if (!userCart || !Array.isArray(userCart.items) || userCart.items.length === 0) {
    alert("Cart is empty!");
    return false;
  }

  const total = userCart.items.reduce((sum, item) => {
    return sum + (item.price * (item.qty || item.quantity || 1));
  }, 0);

  const newOrder = {
    orderId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    userId,
    items: userCart.items.map(i => ({ ...i })),
    total: total.toFixed(2),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  userCart.items = [];

  saveToStorage("carts", carts);
  saveToStorage("orders", orders);

  return true;
}

export function getOrders(userId) {
  const orders = asArray(getFromStorage("orders")) || [];
  return orders.filter(order => order.userId === userId);
}

export function showOrders_user(userId) {
  const container = document.getElementById("orders-container");
  if (!container) {
    console.error("Orders container not found");
    return;
  }

  const orders = getOrders(userId);

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info text-center mt-4">
        No previous orders found.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <span class="badge bg-primary">${orders.length} Orders</span>
      </div>
    </div>

    <div class="list-group">
      ${orders.map(order => `
        <div class="list-group-item mb-3 shadow-sm p-3 bg-body rounded">
          <div class="d-flex justify-content-between">
            <div>
              <h5 class="mb-1">Order #${order.orderId}</h5>
              <div class="d-flex gap-2 mb-2">
                <span class="badge
                  ${order.status === 'completed' ? 'bg-success' :
                    order.status === 'rejected' ? 'bg-danger text-dark' :
                    order.status === 'pending' ? 'bg-info text-dark' : 'bg-danger'}">
                  ${order.status}
                </span>
                <small class="text-muted">${new Date(order.createdAt).toLocaleString()}</small>
              </div>
              <div class="mb-2">
                <strong>Items:</strong>
                <ul class="mb-0">
                  ${order.items.map(item => `
                    <li>${item.name || 'Product'} × ${item.qty || item.quantity || 1}</li>
                  `).join('')}
                </ul>
              </div>
            </div>
            <div class="text-end">
              <h5>$${order.total}</h5>
        
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add event listeners for confirm buttons

}

export function updateOrderStatus(orderId, status) {
  const allowedStatuses = new Set(["pending", "completed", "cancelled"]);
  if (!allowedStatuses.has(status)) {
    console.error("Invalid status");
    return false;
  }

  const orders = asArray(getFromStorage("orders")) || [];
  const orderIndex = orders.findIndex(o => o.orderId === orderId);

  if (orderIndex === -1) return false;

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();

  saveToStorage("orders", orders);
  return true;
}
