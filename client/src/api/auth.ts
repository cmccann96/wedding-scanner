import axios from 'axios';

const BASE = '/api';

export async function login(username: string, password: string) {
  const res = await axios.post(`${BASE}/auth/login`, { username, password });
  return res.data as { token: string; user: { username: string } };
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
