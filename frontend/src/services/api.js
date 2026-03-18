import axios from "axios";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:5001";
const PRODUCT_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || "http://localhost:5002";
const ORDER_URL = import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:5003";

// ── Helper: get auth header ──────────────────
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Auth Service API ─────────────────────────
export const authAPI = {
  register: (data) => axios.post(`${AUTH_URL}/api/auth/register`, data),
  login: (data) => axios.post(`${AUTH_URL}/api/auth/login`, data),
  getProfile: () =>
    axios.get(`${AUTH_URL}/api/auth/profile`, { headers: authHeader() }),
};

// ── Product Service API ──────────────────────
export const productAPI = {
  getAll: () => axios.get(`${PRODUCT_URL}/api/products`),
  getById: (id) => axios.get(`${PRODUCT_URL}/api/products/${id}`),
  create: (data) =>
    axios.post(`${PRODUCT_URL}/api/products`, data, { headers: authHeader() }),
  update: (id, data) =>
    axios.put(`${PRODUCT_URL}/api/products/${id}`, data, { headers: authHeader() }),
  delete: (id) =>
    axios.delete(`${PRODUCT_URL}/api/products/${id}`, { headers: authHeader() }),
};

// ── Order Service API ────────────────────────
export const orderAPI = {
  create: (data) =>
    axios.post(`${ORDER_URL}/api/orders`, data, { headers: authHeader() }),
  getAll: () =>
    axios.get(`${ORDER_URL}/api/orders`, { headers: authHeader() }),
  getById: (id) =>
    axios.get(`${ORDER_URL}/api/orders/${id}`, { headers: authHeader() }),
  updateStatus: (id, status) =>
    axios.patch(
      `${ORDER_URL}/api/orders/${id}/status`,
      { status },
      { headers: authHeader() }
    ),
};
