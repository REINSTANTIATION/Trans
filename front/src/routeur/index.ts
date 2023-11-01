import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import Classic from '../views/Classic.vue';
import CreateUser from '../views/CreateUser.vue';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Login from '../views/Login.vue';
import MainMenu from '../views/MainMenu.vue';
import ScoreBoard from '../views/ScoreBoard.vue';
import PongGame from '../views/PongGame.vue';
import CustomPongGame from '../views/CustomPongGame.vue';
import store from '../store';
import Chat from '../views/Chat.vue'
import UserInfo from '../views/UserInfo.vue'


function requiresAuth(_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
  const socket = store.getters.socket;
  const token = localStorage.getItem('access_token');

  if (socket || token) {
    next();  // Si l'utilisateur est authentifié, continuez vers la route demandée
  } else {
    next('/');  // Sinon, redirigez vers la page de connexion
  }
}

// function socketInitialized(_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
//   const socket = store.getters.socket;
//   if (socket) {
//       next();  // Si le socket est initialisé, continuez vers la route demandée
//   } else {
//       console.warn("Socket is not initialized. Redirecting to login.");
//       next('/login');  // Sinon, redirigez vers la page de connexion
//   }
// }

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/classic',
    name: 'Classic',
    component: Classic
  },
  {
    path: '/createuser',
    name: 'CreateUser',
    component: CreateUser
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    beforeEnter: requiresAuth
    // , socketInitialized  // Appliquer la garde de navigation
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/menu',
    name: 'Menu',
    component: MainMenu,
    beforeEnter: requiresAuth  // Appliquer la garde de navigation
  },
  {
    path: '/userinfo',
    name: 'UserInfo',
    component: UserInfo,
    beforeEnter: requiresAuth  // Appliquer la garde de navigation
  },
  {
    path: '/scoreBoard',
    name: 'ScoreBoard',
    component: ScoreBoard,
    beforeEnter: requiresAuth  // Appliquer la garde de navigation
  },
  {
    path: '/ponggame',
    name: 'PongGame',
    component: PongGame,
    beforeEnter: requiresAuth  // Appliquer la garde de navigation
  },
  {
    path: '/customponggame',
    name: 'CustomPongGame',
    component: CustomPongGame,
    beforeEnter: requiresAuth  // Appliquer la garde de navigation
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    beforeEnter: requiresAuth  // Appliquer la garde de navigation
  }
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

//--------------------------------------

// const socket = store.getters.socket;
// router.afterEach(() => {
//   if (socket && socket.connected) {
//     socket.emit('navigateAway');
//   }
// });

// router.beforeEach((to, from, next) => {
//   // Si l'utilisateur quitte la route du chat
//   if (from.name === 'Chat') {
//     const currentChannelName = ...; // Récupérez le nom du canal actuel depuis le store ou une autre source
// store.getters.socket.emit('navigateAway', { channelName: currentChannelName });
//   }
// next();
// });

export default router;