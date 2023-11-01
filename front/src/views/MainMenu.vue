<template>
    <AppHeaderNoMenu />
    <div>
        <section class="main-content">
            <h2>Menu</h2>
            <div class="button-group">
                <button @click="navigateTo('UserInfo')">
                    <i class="fas fa-info-circle icon"></i> Infos
                </button>
                <button @click="navigateTo('Game')">
                    <i class="fas fa-gamepad icon"></i> Game
                </button>
                <button @click="navigateTo('ScoreBoard')">
                    <i class="fas fa-trophy icon"></i> ScoreBoard
                </button>
                <button @click="navigateTo('Chat')">
                    <i class="fas fa-comments icon"></i> Chat
                </button>
                <button @click="navigateTo('gamePage')">
                    <i class="fas fa-play-circle icon"></i> gamePage
                </button>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppHeaderNoMenu from '../components/AppHeaderNoMenu.vue';

export default defineComponent({
    name: 'Menu',
    components: {
    AppHeaderNoMenu
},
    setup() {
        const router = useRouter();
        const store = useStore();

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
            navigateTo
        };
    }
});
</script>


<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

.main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 120px);
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
    max-height: calc(100vh - 120px);
    overflow: auto;
}

.button-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.icon {
    margin: 0 10px;
}

h2 {
    font-size: 60px;
    font-family: 'Georgia', serif;
    color: white;
    margin-bottom: 90px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 5px 5px 5px #3300ff;
    border-bottom: none;
}

button {
    font-family: 'Georgia', serif;
    margin: 10px auto; 
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    padding: 15px;
    border-radius: 30px;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: rgba(51, 0, 255, 0.2);
}
</style>