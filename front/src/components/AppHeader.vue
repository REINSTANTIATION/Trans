<template>
  <header>

    <div class="top-header">

      <h1 class="redirectionHome" @click="navigateToMenu">Mon Header</h1>
      <div class="header-content">
        <div class="user-info" v-if="state.username">
          <img :src="state.avatarUrl" alt="User Avatar" class="user-avatar" />
          Bienvenue, {{ state.username }}
          <div class="notification">Vos notifications ici</div>
        </div>
        <div v-else class="user-info">
          Bienvenue, Invité
        </div>

        <div class="burger-menu" @click="toggleMenu">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>

        <div class="menu" v-show="isMenuOpen">

          <div class="menu-item">
            <h3>Rubrique 1</h3>
            <form @submit.prevent="searchUser">
              <input v-model="searchQuery" type="text" placeholder="Recherche utilisateur" />
              <button type="submit">Rechercher</button>
              <span class="notFound" v-if="notFound">not found</span>
            </form>
            <!-- <div v-if="searchResults.length">
              <h4>Résultats de la recherche:</h4>
              <ul>
                <li v-for="user in searchResults" :key="user.id">{{ user.username }}</li>
              </ul>
            </div> -->
          </div>
          <div class="menu-item">Rubrique 2</div>
          <div class="menu-item">Rubrique 3</div>
          <button @click="logout" class="logout-button">
            Logout <i class="fas fa-sign-out-alt"></i>
          </button>

        </div>
      </div>

    </div>

    <!-- <div class="navigation-tab">
      <button :class="{ 'active-route': $route.name === 'infos' }" @click="navigateTo('infos')">Infos</button>
      <button :class="{ 'active-route': $route.name === 'Game' }" @click="navigateTo('Game')">Game</button>
      <button :class="{ 'active-route': $route.name === 'ScoreBoard' }"
        @click="navigateTo('ScoreBoard')">ScoreBoard</button>
      <button :class="{ 'active-route': $route.name === 'Chat' }" @click="navigateTo('Chat')">Chat</button>
      <button :class="{ 'active-route': $route.name === 'gamePage' }" @click="navigateTo('gamePage')">gamePage</button>
    </div> -->
    <div class="navigation-tab">
      <button :class="{ 'active-route': $route.name === 'infos' }" @click="navigateTo('UserInfo')">
        <i class="fas fa-info-circle"></i>
      </button>
      <button :class="{ 'active-route': $route.name === 'Game' }" @click="navigateTo('Game')">
        <i class="fas fa-gamepad"></i>
      </button>
      <button :class="{ 'active-route': $route.name === 'ScoreBoard' }" @click="navigateTo('ScoreBoard')">
        <i class="fas fa-trophy"></i>
      </button>
      <button :class="{ 'active-route': $route.name === 'Chat' }" @click="navigateTo('Chat')">
        <i class="fas fa-comments"></i>
      </button>
      <button :class="{ 'active-route': $route.name === 'gamePage' }" @click="navigateTo('gamePage')">
        <i class="fas fa-play-circle"></i>
      </button>
    </div>

    <UserModal v-if="isModalVisible" :user="selectedUser" @close="isModalVisible = false" />
  </header>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import router from '../routeur/index';
import axios from 'axios';
import UserModal from './UserModal.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AppHeader',
  components: {
    UserModal
  },


  setup() {
    const store = useStore();
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isMenuOpen = ref(false);

    const isModalVisible = ref(false);
    const selectedUser = ref(null);
    const notFound = ref(false);

    // const avatarUrl = computed(() => store.getters.avatarUrl); 

    const logout = () => {
      store.dispatch('disconnectSocket');
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      localStorage.removeItem('avatarUrl');
      store.commit('setUser', { username: null });
      router.push('/');
    };

    const toggleMenu = () => {
      if (store.state.username) {
        isMenuOpen.value = !isMenuOpen.value;
      }
      else {
        alert("no no no !!!!")
      }
    };

    const showUserModal = (user: null) => {
      selectedUser.value = user;
      isModalVisible.value = true;
      console.log(isModalVisible.value)
    };

    const searchUser = async () => {
      if (searchQuery.value) {
        try {
          const response = await axios.get(`http://localhost:3000/users/search?username=${searchQuery.value}`);
          searchResults.value = response.data;
          console.log(response.data);

          // Si des résultats sont trouvés, affichez la modale avec le premier utilisateur trouvé
          if (response.data && response.data.username) {
            showUserModal(response.data);
            searchQuery.value = '';
          }
          else {
            notFound.value = true;
            setTimeout(() => {
              notFound.value = false;
            }, 1500);
            searchQuery.value = '';
          }
          console.log("search User: ", response)
        } catch (error) {
          console.error(error);
        }
      }
    };

    const navigateToMenu = () => {
      router.push('/menu'); // Remplacez '/menu' par le chemin vers votre page de menu
    };

    const router = useRouter();
    // Variables réactives pour suivre l'état du socket
    const isSocketConnected = ref(false);
    const socketId = ref(null);

    // Propriété computed pour surveiller les changements du socket
    const socket = computed(() => store.getters.socket);

    // Watcher pour suivre les changements du socket
    watch(socket, (newSocket) => {
      if (newSocket) {
        isSocketConnected.value = newSocket.connected;
        socketId.value = newSocket.id;

        console.log("Socket ID:", socketId.value);
        console.log("Socket connecté:", isSocketConnected.value);

        newSocket.on('connect', () => {
          console.log('Socket connecté');
          console.log("Socket ID:", newSocket.id);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket déconnecté');
        });
      } else {
        console.log("Aucun socket n'a été initialisé.");
      }
    }, { immediate: true });

    const navigateTo = (routeName: string) => {
      router.push({ name: routeName });
    };

    return {
      user: store.state.user,
      state: store.state,
      logout,
      toggleMenu,
      isMenuOpen,
      searchQuery,
      searchResults,
      searchUser,
      isModalVisible,
      selectedUser,
      showUserModal,
      notFound,
      navigateToMenu,
      avatarUrl: store.state.avatarUrl,
      navigateTo
    };
  }
});
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

.header-content {
  display: flex;
  align-items: center;
}

.user-info {
  margin-right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification {
  margin-top: 15px;
  background-color: #240090;
  padding: 5px 10px;
  border-radius: 10px;
  color: #ecf0f1;
}

.burger-menu {
  cursor: pointer;
  padding: 10px;

}

.line {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 2px 0;
}

.menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 25px;
  top: 100px;
  background-color: #190061;
  border: 1px solid #240090;
  border-radius: 20px;
  width: 200px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.menu-item {
  padding: 15px;
  cursor: pointer;
  color: #ecf0f1;
}

.menu-item:hover {
  background-color: #240090;
}

.notFound {
  color: #ff0000;
  margin-left: 10px;
  font-size: 18px;
}

.redirectionHome {
  cursor: pointer;
  transition: color 0.3s;
}

.redirectionHome:hover {
  color: #3500D3;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  vertical-align: middle;
}

header {
  color: white;
  overflow: auto;
  background-color: #0C0032;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0.5rem 1rem;
}

.navigation-tab {
  display: flex;
  justify-content: center;
  align-items: center;
  /* height: 35px; */
}

.navigation-tab button {
  height: fit-content;
  border-radius: 10px;
  border-top: 2px solid #3500D3;
  border-left: 2px solid #3500D3;
  border-right: 2px solid #3500D3;
  background-color: #0C0032;
  transition: background-color 0.3s;
  margin-left: 0.3em;
}

.navigation-tab button:hover {
  background-color: rgb(13, 13, 13);
}

.navigation-tab .active-route {
  background-color: rgb(13, 13, 13);
}
</style>
