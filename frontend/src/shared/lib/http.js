import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: false, //needs true in case of cookies
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}), (err) => Promise.reject(err);

http.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default http;