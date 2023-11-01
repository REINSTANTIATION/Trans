<!-- CustomPongGame.vue -->
<template>
    <div class="custom-pong-game" ref="containerRef">
        <h1>Custom Pong Game</h1>
        <div v-if="winner">
            <h2>Player {{ winner }} wins!</h2>
            <!-- <button @click="restartGame">Restart</button> -->
        </div>
        <div v-else-if="currentGame">
            <div class="scores">
                <div>{{ currentGame.player1Username }}: {{ player1Score }}</div>
                <div>{{ currentGame.player2Username }}: {{ player2Score }}</div>
            </div>
            <canvas ref="canvasRef" width="800" height="400"></canvas>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, computed, ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import router from '../routeur';
import usePongGameLogic from '../TSFiles/game';

export default defineComponent({
    name: 'PongGame',
    setup() {
        const store = useStore();
        const currentGame = computed(() => store.getters.currentGame);

        const ctx = ref<CanvasRenderingContext2D | null>(null);
        const canvasRef = ref<HTMLCanvasElement | null>(null);

        const {
            player1Score,
            player2Score,
            draw,
            update,
            handleKeydown,
            initializeCanvas,
            socket,
            paddle1,
            paddle2,
            // playerNumber,
            // increaseScore,
            winner,
            ball
        } = usePongGameLogic(canvasRef, ctx);


        onMounted(() => {

            console.log("onMounted");
            console.log("Socket connected status:", socket.connected);
            console.log("Socket in PongGame:", socket);
            console.log("Socket ID in PongGame:", socket.id);

            // Écoutez l'événement paddlesPosition du serveur
            socket.on('paddlesPosition', (paddles: { paddle1: { y: number; }; paddle2: { y: number; }; }) => {
                paddle1.value.y = paddles.paddle1.y;
                paddle2.value.y = paddles.paddle2.y;
            });

            socket.on('ballPosition', (newBall: { x: number; y: number; dx: number; dy: number }) => {
                ball.value.x = newBall.x;
                ball.value.y = newBall.y;
                console.log("socket ballposition")
            });

            document.addEventListener('keydown', handleKeydown);
            initializeCanvas();
            socket.on('gameEnded', (data: { winner: string, player1Score: number, player2Score: number }) => {
                console.log("Received gameEnded event with data:", data);
                if (data.winner === store.state.currentGame.player1Username) {
                    winner.value = 1;
                } else if (data.winner === store.state.currentGame.player2Username) {
                    winner.value = 2;
                }
                player1Score.value = data.player1Score;
                player2Score.value = data.player2Score;
                router.push("/menu");
            });
        });

        onUnmounted(() => {
            socket.off('gameEnded');
            socket.off('opponentPaddleMove');
            document.removeEventListener('keydown', handleKeydown);
        });

        return {
            currentGame,
            player1Score,
            player2Score,
            canvasRef,
            draw,
            update,
            winner
        };
    }
});
</script>

<style scoped>
h1 {
    background-color: #240090;
    margin: 20px auto;
    padding: 10px 20px;
}

.custom-pong-game {
    min-height: calc(100vh - 90px);
    color: white;
    text-align: center;
    background-color: rgb(13, 13, 13);
    padding-top: 70px;
}

.scores {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 30px;
    padding: 50px 20px;
}

canvas {
    background-color: #240090;
    margin: auto;
    border-radius: 20px;
    box-shadow:
        2px 2px 4px #000,
        4px 4px 8px #000,
        8px 8px 16px #000,
        inset 1px 1px 2px rgba(255, 255, 255, 0.1),
        inset -1px -1px 2px rgba(0, 0, 0, 0.5);
}
</style>