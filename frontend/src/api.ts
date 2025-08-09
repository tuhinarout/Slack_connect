import axios from 'axios';

const backend = 'http://localhost:5000';

export const api = axios.create({
  baseURL: backend,
  headers: { 'Content-Type': 'application/json' }
});
