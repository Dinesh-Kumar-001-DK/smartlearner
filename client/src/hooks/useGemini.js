import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: '/api/gemini'
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useGemini = () => {
  const callGemini = async (endpoint, payload) => {
    const response = await api.post(`/${endpoint}`, payload);
    return response.data;
  };

  return {
    chat: (docText, messages) => callGemini('chat', { docText, messages }),
    summary: (docText) => callGemini('summary', { docText }),
    explain: (docText, topic) => callGemini('explain', { docText, topic }),
    flashcards: (docText, count = 10) => callGemini('flashcards', { docText, count }),
    quiz: (docText, count = 5) => callGemini('quiz', { docText, count })
  };
};

export default useGemini;
