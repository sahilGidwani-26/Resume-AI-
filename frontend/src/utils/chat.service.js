import axios from 'axios';

const API = axios.create({ baseURL: 'https://resume-ai-2-91mv.onrender.com/api'});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sendMessage   = (message, chatId) => API.post('/chat/send', { message, chatId });
export const getChats      = ()     => API.get('/chat');
export const getChatById   = (id)   => API.get(`/chat/${id}`);
export const deleteChat    = (id)   => API.delete(`/chat/${id}`);
export const clearAllChats = ()     => API.delete('/chat');
export const renameChat    = (id, title) => API.put(`/chat/${id}/rename`, { title });