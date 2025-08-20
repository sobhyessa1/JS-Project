// js/app.js
// Authentication + LocalStorage + Validation
// NOTE: Demo only. Do not store plain passwords or rely on localStorage for real apps.


 export const Auth= (function () {
  'use strict';
console.log("Auth module loaded");
  const STORAGE = {
    USERS: 'users',
    CURRENT_USER: 'currentUser', // {id, role}
  };

  // ========== Utilities ==========
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; // min 6, at least 1 letter & 1 number

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"'`=\/]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
      "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
    }[c]));

  function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
  }

  function generateId() {
    return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
  }

  function setCurrentUserSummary(summary) {
    localStorage.setItem(STORAGE.CURRENT_USER, JSON.stringify(summary));
  }

  function getCurrentUserSummary() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.CURRENT_USER));
    } catch {
      return null;
    }
  }

  function getCurrentUserFull() {
    const summary = getCurrentUserSummary();
    if (!summary) return null;
    const users = loadUsers();
    return users.find(u => u.id === summary.id) || null;
  }

  function clearCurrentUser() {
    localStorage.removeItem(STORAGE.CURRENT_USER);
  }

  function findUserByEmail(email) {
    const users = loadUsers();
    const em = normalizeEmail(email);
    return users.find(u => u.email === em) || null;
  }

  function findUserById(id) {
    const users = loadUsers();
    return users.find(u => u.id === id) || null;
  }

  function seedDefaultAdmin() {
    const users = loadUsers();
    const hasAdmin = users.some(u => u.role === 'admin');
    if (!hasAdmin) {
      users.push({
        id: generateId(),
        name: 'Default Admin',
        email: normalizeEmail('admin@example.com'),
        password: 'Admin@123', // demo only
        role: 'admin',
        createdAt: nowISO(),
      });
      saveUsers(users);
    }
  }

  // ========== Validators ==========
  const Validators = {
    name(name) {
      const n = (name || '').trim();
      if (!n) return 'Name is required';
      if (n.length < 3) return 'Name must be at least 3 characters';
      if (n.length > 50) return 'Name is too long';
      return null;
    },
    email(email) {
      const e = normalizeEmail(email);
      if (!e) return 'Email is required';
      if (!emailRegex.test(e)) return 'Invalid email format';
      return null;
    },
    password(pw) {
      const p = (pw || '').trim();
      if (!p) return 'Password is required';
      if (!passRegex.test(p)) return 'Password must be at least 6 characters and include a letter and a number';
      return null;
    },
    confirm(pw, pw2) {
      if (!pw2) return 'Confirm password is required';
      if (pw !== pw2) return 'Passwords do not match';
      return null;
    }
  };

  // ========== Auth Core ==========
  function registerUser({ name, email, password, role }) {
    const errors = [];
    const e1 = Validators.name(name); if (e1) errors.push(e1);
    const e2 = Validators.email(email); if (e2) errors.push(e2);
    const e3 = Validators.password(password); if (e3) errors.push(e3);
    if (errors.length) {
      const err = new Error(errors.join(' | '));
      err.code = 'VALIDATION';
      throw err;
    }

    const users = loadUsers();
    const em = normalizeEmail(email);
    const exists = users.some(u => u.email === em);
    if (exists) {
      const err = new Error('This email is already in use');
      err.code = 'DUPLICATE';
      throw err;
    }

    const user = {
      id: generateId(),
      name: name.trim(),
      email: em,
      password: password, // demo only
      role: role || 'customer',
      createdAt: nowISO(),
    };

    users.push(user);
    saveUsers(users);

    return { id: user.id, role: user.role };
  }

  // REQUIRED: returns current user {id, role} on successful login
  function loginUser(email, password) {
    const errs = [];
    const e1 = Validators.email(email); if (e1) errs.push(e1);
    if (!password) errs.push('Password is required');

    if (errs.length) {
      const err = new Error(errs.join(' | '));
      err.code = 'VALIDATION';
      throw err;
    }

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      const err = new Error('Invalid email or password');
      err.code = 'AUTH';
      throw err;
    }

    const summary = { id: user.id, role: user.role };
    setCurrentUserSummary(summary);
    return summary; // <= returns {id, role}
  }

  function logout() {
    clearCurrentUser();
    window.location.href = 'login.html';
  }

  function requireAuth(role) {
    const current = getCurrentUserSummary();
    if (!current) {
      window.location.href = 'login.html';
      return false;
    }
    if (role && current.role !== role) {
      // redirect to their dashboard
      window.location.href = current.role === 'admin' ? '/project/project/admin/product.html' : 'home.html';
      return false;
    }
    return true;
  }

  // ========== UI Helpers ==========
  function showErrors(containerEl, messages) {
    if (!containerEl) return;
    const arr = Array.isArray(messages) ? messages : [messages];
    containerEl.innerHTML = arr.map(m => `<div>• ${escapeHtml(m)}</div>`).join('');
    containerEl.style.display = 'block';
  }

  function clearBox(el) {
    if (!el) return;
    el.innerHTML = '';
    el.style.display = 'none';
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  // ========== Page Bindings ==========
  function bindLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const errorBox = document.getElementById('loginError');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearBox(errorBox);

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const { id, role } = loginUser(email, password); // returns {id, role}
        // redirect based on role
        window.location.href = role === 'admin' ? '/project/project/admin/product.html' : 'home.html';
      } catch (err) {
        showErrors(errorBox, err.message || 'Unexpected error occurred');
      }
    });
  }

  function bindRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const errorBox = document.getElementById('registerError');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearBox(errorBox);

      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;

      const errs = [];
      const e1 = Validators.name(name); if (e1) errs.push(e1);
      const e2 = Validators.email(email); if (e2) errs.push(e2);
      const e3 = Validators.password(password); if (e3) errs.push(e3);
      const e4 = Validators.confirm(password, confirm); if (e4) errs.push(e4);

      if (errs.length) {
        showErrors(errorBox, errs);
        return;
      }

      try {
        // Register as customer
        const { id, role } = registerUser({ name, email, password, role: 'customer' });
        // Auto-login after register
        setCurrentUserSummary({ id, role });
        window.location.href = 'home.html';
      } catch (err) {
        showErrors(errorBox, err.message || 'An unexpected error occurred during registration');
      }
    });
  }

  function bindAdminPage() {
    const form = document.getElementById('addAdminForm');
    if (!form) return;

    if (!requireAuth('admin')) return;

    const errorBox = document.getElementById('addAdminError');
    const successBox = document.getElementById('addAdminSuccess');
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearBox(errorBox);
      clearBox(successBox);

      const name = document.getElementById('adminName').value;
      const email = document.getElementById('adminEmail').value;
      const password = document.getElementById('adminPassword').value;
      const confirm = document.getElementById('adminConfirm').value;

      const errs = [];
      const e1 = Validators.name(name); if (e1) errs.push(e1);
      const e2 = Validators.email(email); if (e2) errs.push(e2);
      const e3 = Validators.password(password); if (e3) errs.push(e3);
      const e4 = Validators.confirm(password, confirm); if (e4) errs.push(e4);

      if (findUserByEmail(email)) {
        errs.push('This email is already in use');
      }

      if (errs.length) {
        showErrors(errorBox, errs);
        return;
      }

      try {
        registerUser({ name, email, password, role: 'admin' });
        successBox.textContent = 'Admin added successfully';
        successBox.style.display = 'block';
        form.reset();
        renderUsersTable();
      } catch (err) {
        showErrors(errorBox, err.message || 'Failed to add admin');
      }
    });

    renderUsersTable();
  }

  function bindCustomerPage() {
    const nameEl = document.getElementById('currentUserName');
    const roleEl = document.getElementById('currentUserRole');
    if (!nameEl || !roleEl) return;

    if (!requireAuth('customer')) return;

    const user = getCurrentUserFull();
    if (user) {
      nameEl.textContent = user.name;
      roleEl.textContent = user.role;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
  }

   
    function renderUsersTable() {
    const tbody = document.getElementById('usersTbody');
    if (!tbody) return;
    const users = loadUsers();

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${escapeHtml(u.id)}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>${escapeHtml(formatDate(u.createdAt))}</td>
      </tr>
    `).join('');
  }

  // ========== Init ==========
  
   
  document.addEventListener('DOMContentLoaded', () => {
    seedDefaultAdmin();
    bindLoginPage();
    bindRegisterPage();
    bindAdminPage();
    bindCustomerPage();

 
  });
   window.Auth = Auth;
   return  {
      loginUser,          // usage: const {id, role} = Auth.loginUser(email, pass)
      logout,
      getCurrentUserSummary,
      getCurrentUserFull,
      registerUser

    };
   
})();