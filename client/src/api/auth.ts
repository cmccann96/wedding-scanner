import axios from 'axios';

const BASE = 'http://localhost:4000/api';

export async function register(email: string, password: string) {
  const res = await axios.post(`${BASE}/auth/register`, { email, password });
  return res.data as { token: string; user: { id: number; email: string } };
}

export async function login(email: string, password: string) {
  const res = await axios.post(`${BASE}/auth/login`, { email, password });
  return res.data as { token: string; user: { id: number; email: string } };
}

export async function fetchSaved(token: string) {
  const res = await axios.get(`${BASE}/saved`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

export async function saveItem(token: string, product: object) {
  await axios.post(`${BASE}/saved`, product, { headers: { Authorization: `Bearer ${token}` } });
}

export async function unsaveItem(token: string, productId: string) {
  await axios.delete(`${BASE}/saved/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
}
