//store: index.ts

import axios from 'axios';
import { io } from 'socket.io-client';
import { createStore } from 'vuex';

interface State {
  username: string | null;
  status: string;
  token: string | null;
  user: {};
  isInQueue: boolean;
  isInCustomQueue: boolean;
  currentGame: {} | null;
  socket: any | null; // Ajout de la propriété socket
  playerNumber: number | null;
  currentRoom: string | null;
  avatarUrl: string | null;
}

export default createStore<State>({
  state: {
    username: null,
    status: '',
    token: localStorage.getItem('token') || null,
    user: {},
    isInQueue: false,
    isInCustomQueue: false,
    currentGame: null,
    socket: null,  // Initialisation de socket à null
    playerNumber: null,
    currentRoom: null,
    avatarUrl: null,
  },

  mutations: {
    setUser(state, payload) {
      console.log("Received username in mutation:", payload.username);
      state.username = payload.username;
    },
    AUTH_REQUEST(state) {
      state.status = 'loading';
    },
    AUTH_SUCCESS(state, token) {
      state.status = 'success';
      state.token = token;
    },
    AUTH_ERROR(state) {
      state.status = 'error';
    },
    LOGOUT(state) {
      state.status = '';
      state.token = null;
    },
    JOIN_QUEUE(state) {
      state.isInQueue = true;
    },
    JOIN_CUSTOM_QUEUE(state) {
      state.isInCustomQueue = true;
    },
    LEAVE_QUEUE(state) {
      state.isInQueue = false;
    },
    LEAVE_CUSTOM_QUEUE(state) {
      state.isInCustomQueue = false;
    },
    START_GAME(state, gameData) {
      console.log("START_GAME mutation called with:", gameData);
      state.currentGame = gameData;
    },
    SET_SOCKET(state, socketInstance) {
      state.socket = socketInstance;
      const event = new CustomEvent('socket-stored', { detail: socketInstance });
      window.dispatchEvent(event);
    },
    DISCONNECT_SOCKET(state) {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
    },
    ASSIGN_PLAYER(state, playerNumber) {
      state.playerNumber = playerNumber;
    },
    SET_ROOM(state, roomName) {
      state.currentRoom = roomName;
    },
    END_GAME(state, gameData) {
      console.log("END_GAME mutation called with:", gameData);
      state.currentGame = null;
      state.currentRoom = null;
    },

    SET_AVATAR_URL(state, payload) {
      console.log("Received avatar URL in mutation:", payload.avatarUrl);
      state.avatarUrl = payload.avatarUrl;
    },

    ADD_TOAST_NOTIFICATION(_state, _notification) { }

  },

  actions: {
    initializeSocket({ commit, state }) {
      if (!state.socket) {
        const token = localStorage.getItem('access_token'); // récupérer le token du local storage
        if (!token) {
          // Pas de token, l'utilisateur doit se connecter
          return;
        }

        const socket = io("http://localhost:3000", {
          query: { token }, // passer le token comme paramètre de requête
          autoConnect: true, // s'assurer que la reconnexion est automatique
          reconnectionAttempts: 5, // nombre maximal de tentatives de reconnexion
        });

        socket.on('connect', () => {
          console.log('Socket connecté depuis le store Vuex');
          commit('SET_SOCKET', socket); // enregistrer l'instance de socket dans le store
        });

        socket.on('disconnect', (reason) => {
          if (reason === 'io server disconnect') {
            // le serveur a déconnecté le client, vous devez vous reconnecter manuellement
            socket.connect();
          }
          // sinon, la reconnexion est gérée automatiquement
        });

        socket.on('connect_error', (error) => {
          // gérer les erreurs de connexion, par exemple un jeton non valide
          if (error.message === 'authentication error') {
            // déconnecter l'utilisateur ou demander une nouvelle connexion
          }
        });
      }
    },

    disconnectSocket({ commit, state }) {
      if (state.socket) {
        state.socket.disconnect();
        commit('DISCONNECT_SOCKET');
      }
    },

    async fetchUserAvatar({ commit, state }) {
      try {
        const response = await axios.get(`http://localhost:3000/users/avatar/${state.username}`);
        if (response.data && response.data.avatarUrl) {
          console.log("data avatar Url: ", response.data.avatarUrl);
          commit('SET_AVATAR_URL', response.data.avatarUrl);
        }
      } catch (error) {
        console.error('An error occurred while fetching user avatar:', error);
      }
    },

    addToast({ commit }, notification) {
      commit('ADD_TOAST_NOTIFICATION', notification);
    },
  },

  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    username: state => state.username,
    isInQueue: state => state.isInQueue,
    isInCustomQueue: state => state.isInCustomQueue,
    currentGame: state => state.currentGame,
    socket: state => state.socket,
    currentRoom: state => state.currentRoom,
    avatarUrl: state => state.avatarUrl,
  },

  modules: {},
});
