//game.ts
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export default function usePongGameLogic(canvasRef: any, ctx: any) {
    const store = useStore();
    const socket = store.getters.socket;

    const playerNumber = computed(() => store.state.playerNumber);
    const player1Score = ref(0);
    const player2Score = ref(0);
    const winner = ref<number | null>(null);

    interface Ball {
        x: number;
        y: number;
        size: number;
        speed: number;
        dx: number;
        dy: number;
    }

    interface Paddle {
        x: number;
        y: number;
        width: number;
        height: number;
        dy: number;
    }

    const ball = ref<Ball>({
        x: 0,
        y: 0,
        size: 10,
        speed: 4,
        dx: 4,
        dy: 0,
    });

    const paddle1 = ref<Paddle>({
        x: 10,  // près du bord gauche
        y: (400 - 80) / 2,  // centré verticalement, 400 est la hauteur du canvas, 80 est la hauteur du paddle
        width: 10,
        height: 80,
        dy: 4,
    });

    const paddle2 = ref<Paddle>({
        x: 800 - 20,  // près du bord droit, 800 est la largeur du canvas
        y: (400 - 80) / 2,  // centré verticalement
        width: 10,
        height: 80,
        dy: 4,
    });

    const initializeCanvas = () => {
        if (canvasRef.value) {
            console.log("canvasRef ok");
            ctx.value = canvasRef.value.getContext("2d");

            ball.value = {
                x: canvasRef.value.width / 2,
                y: canvasRef.value.height / 2,
                size: 10,
                speed: 4,
                dx: 4,
                dy: 0,
            };

            // Ajoutez un écouteur d'événement pour ballHitWall
            socket.on('ballHitWall', handleBallHitWall);

            update(); // Start the game loop
        } else {
            console.log("canvasRef pas ok");
        }
    };


    function drawBall(x: number, y: number) {
        // Utilisez `x` et `y` pour dessiner la balle à la nouvelle position
        // Par exemple:
        ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height); // Effacez le canvas
        ctx.value.beginPath();
        ctx.value.arc(x, y, 10, 0, Math.PI * 2); // Dessinez la balle à la nouvelle position
        ctx.value.fill();
    }

    function drawPaddles() {
        ctx!.value!.fillStyle = '#000';
        ctx!.value!.fillRect(paddle1.value.x, paddle1.value.y, paddle1.value.width, paddle1.value.height);
        ctx!.value!.fillRect(paddle2.value.x, paddle2.value.y, paddle2.value.width, paddle2.value.height);
    };

    const draw = () => {
        if (!ctx.value) {
            console.error("ctx.value is not defined");
            return;
        }
        ctx.value.clearRect(0, 0, 800, 400); // Clear canvas
        drawBall(ball.value.x, ball.value.y);
        drawPaddles();
    };

    function resetBall() {
        ball.value.x = canvasRef!.value!.width / 2;
        ball.value.y = canvasRef!.value!.height / 2;
        ball.value.dx *= -1;
        ball.value.dy = 0;
    };

    const update = () => {
        console.log("update ok")

        draw();
        requestAnimationFrame(update);
    };

    // Ajoutez cette fonction pour gérer l'événement ballHitWall
    function handleBallHitWall(event: any) {
        // Si la balle a touché le mur de droite, augmentez le score du joueur 1
        if (event.x + ball.value.size > 800) {
            increaseScore(1);
        }
        // Si la balle a touché le mur de gauche, augmentez le score du joueur 2
        else if (event.x - ball.value.size < 0) {
            increaseScore(2);
        }
    }

    const handleKeydown = (event: KeyboardEvent) => {
        console.log("handleKeydown");
        console.log("player no: ", playerNumber);
        if (playerNumber.value === 1) {
            console.log("player 1")
            if (event.key === 'w' && paddle1.value.y > 0) {
                paddle1.value.y -= paddle1.value.dy;
                socket.emit('movePaddle', {
                    direction: 'up',
                    playerNumber: 1,
                    roomName: store.state.currentRoom
                });
            } else if (event.key === 's' && paddle1.value.y < canvasRef!.value!.height - paddle1.value.height) {
                paddle1.value.y += paddle1.value.dy;
                socket.emit('movePaddle', {
                    direction: 'down',
                    playerNumber: 1,
                    roomName: store.state.currentRoom
                });
            }
        } else if (playerNumber.value === 2) {
            console.log("player 2")
            if (event.key === 'w' && paddle2.value.y > 0) {
                paddle2.value.y -= paddle2.value.dy;
                socket.emit('movePaddle', {
                    direction: 'up',
                    playerNumber: 2,
                    roomName: store.state.currentRoom
                });
            } else if (event.key === 's' && paddle2.value.y < canvasRef!.value!.height - paddle2.value.height) {
                paddle2.value.y += paddle2.value.dy;
                socket.emit('movePaddle', {
                    direction: 'down',
                    playerNumber: 2,
                    roomName: store.state.currentRoom
                });
            }
        }
    };

    function increaseScore(player: number) {
        console.log("Increasing score for player: ", player);
        if (player === 1) {
            player1Score.value += 1;
            if (player1Score.value === 3) {
                console.log("Current game details before ending the game:", store.state.currentGame.gameId);
                endGame(1, store.state.currentGame.gameId);
            }
        } else if (player === 2) {
            player2Score.value += 1;
            if (player2Score.value === 3) {
                console.log("Current game details before ending the game:", store.state.currentGame.gameId);
                endGame(2, store.state.currentGame.gameId);
            }
        }
    }

    function endGame(winningPlayer: number, gameId: number) {
        console.log(`Player ${winningPlayer} wins!`);
        winner.value = winningPlayer;
        const winningUsername = winningPlayer === 1 ? store.state.currentGame.player1Username : store.state.currentGame.player2Username;

        // Envoyer un événement WebSocket pour informer le serveur que le jeu est terminé
        socket.emit('endGame', {
            gameId: gameId,
            winner: winningUsername,
            player1Score: player1Score.value,
            player2Score: player2Score.value
        });

        resetBall();
    }

    return {
        player1Score,
        player2Score,
        draw,
        update,
        handleKeydown,
        initializeCanvas,
        socket,
        paddle1,
        paddle2,
        playerNumber,
        increaseScore,
        winner,
        ball
    };
}
