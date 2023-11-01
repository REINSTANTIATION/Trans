// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './routeur/index';  // Assurez-vous que le chemin est correct
import store from './store'; // Ajustez le chemin selon votre structure
import axios from 'axios';

const storedUsername = localStorage.getItem('username');
if (storedUsername) {
  store.commit('setUser', { username: storedUsername });
}

const storedAvatarUrl = localStorage.getItem('avatarUrl');
if (storedAvatarUrl) {
  store.commit('SET_AVATAR_URL', { avatarUrl: storedAvatarUrl });
}

// Configurer l'intercepteur de requêtes Axios
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Ajouter le token aux en-têtes
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

createApp(App)
  .use(router)
  .use(store)
  .mount('#app');
