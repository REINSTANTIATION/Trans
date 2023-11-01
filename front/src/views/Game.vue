<template>
    <AppHeader />
    <div class="container">
        <div class="joine-queue">
            <h2><i class="fas fa-gamepad"></i> Join a game</h2>

            <!-- Standard Game Join Button -->
            <div class="button-container">
                <button @click="rejoindre" :disabled="store.state.isInQueue">
                    <i class="fas fa-play-circle"></i> Rejoindre la queue pour le Pong standard
                </button>
                <!-- Standard Game Waiting UI -->
                <div class="waiting" v-if="store.state.isInQueue">
                    <p><i class="fas fa-check"></i> Vous avez rejoint la queue avec succes!</p>
                    <div class="loading-animation"></div>
                </div>
            </div>

            <!-- Custom Game Join Button -->
            <div class="button-container">
                <button @click="rejoindreCustomPong" :disabled="store.state.isInCustomQueue">
                    <i class="fas fa-cogs"></i> Rejoindre la queue pour le Pong custom
                </button>
                <!-- Custom Game Waiting UI -->
                <div class="waiting-custom" v-if="store.state.isInCustomQueue">
                    <p><i class="fas fa-check"></i> Vous avez rejoint la custom queue avec succes!</p>
                    <div class="loading-animation"></div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { onUnmounted, watch, computed, ref } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
    name: 'Game',
    components: {
        AppHeader
    },
    setup() {
        const router = useRouter();
        const store = useStore();

        const isSocketConnected = ref(false);
        const socketId = ref(null);
        // Utilisez computed pour réagir aux changements du socket
        const socket = computed(() => store.getters.socket);

        watch(socket, (newSocket) => {
            if (newSocket) {
                isSocketConnected.value = newSocket.connected;
                socketId.value = newSocket.id;
                console.log("Socket connecté dans Game.vue avec l'ID:", newSocket.id);

                // Écouteurs d'événements pour le socket
                newSocket.on('startGame', (data: { roomName: any; gameId: any; player1Username: any; player2Username: any; }) => {
                    console.log(`Commencez le jeu dans la salle ${data.roomName}`);

                    // Mise à jour du store avec les détails du jeu
                    store.commit('START_GAME', {
                        gameId: data.gameId,
                        player1Username: data.player1Username,
                        player2Username: data.player2Username
                    });
                    store.commit('SET_ROOM', data.roomName);

                    router.push('/ponggame');
                });

                newSocket.on('startCustomGame', (data: { roomName: any; gameId: any; player1Username: any; player2Username: any; }) => {
                    console.log(`Commencez le custom jeu dans la salle ${data.roomName}`);

                    // Update the store with the game details
                    store.commit('START_CUSTOM_GAME', {
                        gameId: data.gameId,
                        player1Username: data.player1Username,
                        player2Username: data.player2Username
                    });
                    store.commit('SET_ROOM', data.roomName);

                    router.push('/customponggame');
                });

                newSocket.on('opponentLeft', () => {
                    console.log("L'adversaire a quitté le jeu.");
                    alert("Votre adversaire a quitté la partie.");
                    router.push('/mainmenu');
                });

                newSocket.on('assignPlayer', (data: { playerNumber: any; }) => {
                    console.log("Received assignPlayer event with data:", data);
                    store.commit('ASSIGN_PLAYER', data.playerNumber);
                });

                newSocket.on('opponentLeftCustom', () => {
                    console.log("L'adversaire custom a quitté le jeu.");
                    alert("Votre adversaire custom a quitté la partie.");
                    router.push('/mainmenu');
                });

                newSocket.on('assignPlayerCustom', (data: { playerNumber: any; }) => {
                    console.log("Received assignPlayerCustom event with data:", data);
                    store.commit('ASSIGN_PLAYER_CUSTOM', data.playerNumber);
                });
            } else {
                console.log("Socket non initialisé dans Game.vue");
            }


        }, { immediate: true });

        const rejoindre = async () => {
            if (!store.state.isInQueue && socket.value) {
                try {
                    console.log("Emitting joinQueue for", store.getters.username);
                    socket.value.emit('joinQueue', { username: store.getters.username });
                    store.commit('JOIN_QUEUE'); // Utilisez le store pour mettre à jour l'état
                } catch (error) {
                    console.error('Erreur lors de la tentative de rejoindre une partie:', error);
                }
            }
        };

        const rejoindreCustomPong = async () => {
            if (!store.state.isInCustomQueue && socket.value) {
                try {
                    console.log("Emitting joinCustomPongQueue for", store.getters.username);
                    socket.value.emit('joinCustomQueue', { username: store.getters.username });
                    store.commit('JOIN_CUSTOM_QUEUE'); // Use the store to update the state
                } catch (error) {
                    console.error('Error while trying to join a custom pong game:', error);
                }
            }
        };

        onUnmounted(() => {
            // Supprimez les écouteurs d'événements lors de la désinstallation du composant
            if (socket.value) {
                socket.value.off('startGame');
                socket.value.off('opponentLeft');
            }
            if (socket.value) {
                socket.value.off('startCustomGame');
                socket.value.off('opponentLeftCustom');
            }
        });

        return { rejoindre, rejoindreCustomPong, store }; // Incluez le store dans le return pour y accéder dans le template
    }
}
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

.container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 170px);
    /* max-height: calc(100vh - 170px); */
    /* min-width: 100%; */
    /* min-height: 100%; */
    /* min-height: 100vh; */
    background: radial-gradient(circle at 50% 50%, rgb(13, 13, 13) 0%, rgb(13, 13, 13) 60%, #0C0032 90%);
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

.waiting {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
}

.waiting-custom {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
}

.joine-queue button {
    font-family: 'Georgia', serif;
    display: block;
    margin: 10px auto;
    border: 2px solid #3300ff;
    background-color: rgba(51, 0, 255, 0.1);
    color: white;
    padding: 15px;
    border-radius: 30px;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.joine-queue button:hover {
    background-color: rgba(51, 0, 255, 0.2);
}

.loading-animation {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 5px solid transparent;
    border-top-color: #3300ff;
    margin-top: 20px;
    animation: spin 3s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>