//game.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from 'src/auth/auth.service';
import { GameService } from 'src/game/game.service';
import { SocketService } from '../socket.service';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})

export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private gameService: GameService,
    private socketService: SocketService,
    private authService: AuthService // Injection du SocketService
  ) {     // Déplacez la balle toutes les 16ms (60 FPS)
    // setInterval(this.moveBall.bind(this), 16);
  }

onModuleInit() {
  this.server.use(async (socket, next) => {
    // Votre logique de middleware ici, par exemple, vérifier un token JWT
    let token = socket.handshake.query.token;

    // Si le token est un tableau, prenez simplement le premier élément
    if (Array.isArray(token)) {
      token = token[0];
    }

    if (typeof token === 'string') { // Assurez-vous que le token est une chaîne
      const isValid = await this.authService.isTokenValid(token); // suppose une méthode qui vérifie la validité du token
      if (isValid) {
        next();
      } else {
        next(new Error('Authentification échouée'));
      }
    } else {
      next(new Error('Token non fourni ou invalide'));
    }
  });
}


  private waitingPlayer: { client: Socket, username: string } | null = null;
  private rooms = new Map<string, { clients: Array<Socket>, ball: any, paddles: any, ballMovementInterval?: any }>();

  private ballMovementInterval: any;
  private gameStarted: boolean = false;

  startGame(roomName: string) {
    const roomData = this.rooms.get(roomName);
    console.log("startGame ok")
    if (!roomData) return;

    this.gameStarted = true; // Assurez-vous que cette ligne est présente

    this.resetPaddles(roomName); // Réinitialisez la position des palettes
    console.log("start game in room: ", roomName)
    roomData.ballMovementInterval = setInterval(() => this.moveBall(roomName), 1000 / 60);
  }

  startCustomGame(roomName: string) {
    const roomData = this.rooms.get(roomName);
    console.log("startCustomGame ok")
    if (!roomData) return;

    this.gameStarted = true; // Assurez-vous que cette ligne est présente

    this.resetPaddles(roomName); // Réinitialisez la position des palettes
    console.log("start game in room: ", roomName)
    roomData.ballMovementInterval = setInterval(() => this.moveBall(roomName), 1000 / 60);
  }

  endGame(roomName: string) {
    const roomData = this.rooms.get(roomName);
    if (!roomData || !roomData.ballMovementInterval) return;

    clearInterval(roomData.ballMovementInterval);
  }

  resetPaddles(roomName: string) {
    const roomData = this.rooms.get(roomName);
    if (roomData) {
      roomData.paddles.paddle1 = {
        x: 10,
        y: 160,
        width: 10,
        height: 80,
        dy: 4,
      };
      roomData.paddles.paddle2 = {
        x: 780,
        y: 160,
        width: 10,
        height: 80,
        dy: 4,
      };
      this.server.to(roomName).emit('paddlesPosition', roomData.paddles);
    }
  }

  private ball = {
    x: 400,
    y: 200,
    dx: 4,
    dy: 0,
    size: 10,
  };

  private paddles = {
    paddle1: {
      x: 10,
      y: 160,
      width: 10,
      height: 80,
      dy: 4,
    },
    paddle2: {
      x: 780,
      y: 160,
      width: 10,
      height: 80,
      dy: 4,
    },
  };

  moveBall(roomName: string) {
    console.log("moveBall called for room:", roomName);
    const roomData = this.rooms.get(roomName);
    console.log("roomData: ", roomData);
    if (!roomData || !this.gameStarted) return;

    const ball = roomData.ball;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Gérer les collisions avec les murs
    if (ball.y + ball.size > 400 || ball.y - ball.size < 0) {
      ball.dy *= -1;
    }

    if (ball.x + ball.size > 800 || ball.x - ball.size < 0) {
      // Au lieu de simplement inverser la direction de la balle,
      // émettez un événement pour informer les clients que la balle a touché un mur
      this.server.to(roomName).emit('ballHitWall', { x: ball.x });
      // Réinitialisez la position de la balle au centre
      ball.x = 400;
      ball.y = 200;
      ball.dx *= -1;
      ball.dy = 0;
      this.resetPaddles(roomName);
    }

    // Gérer les collisions avec les palettes
    this.detectPaddleCollision(roomData.paddles.paddle1, ball);
    this.detectPaddleCollision(roomData.paddles.paddle2, ball);

    // Mettez à jour this.ball avec les valeurs de ball spécifiques à la salle
    this.ball = ball;

    // Émettre la position de la balle aux clients de la salle spécifiée
    this.server.to(roomName).emit('ballPosition', this.ball);
    console.log("moveBall: ", this.ball);
  }

  detectPaddleCollision(paddle: { x: any; y: any; width: any; height: any; dy?: number; }, ball: any) {
    const sectionHeight = paddle.height / 3;

    if (
      ball.y + ball.size > paddle.y &&
      ball.y - ball.size < paddle.y + paddle.height &&
      ball.x + ball.size > paddle.x &&
      ball.x - ball.size < paddle.x + paddle.width
    ) {
      if (ball.y < paddle.y + sectionHeight) {
        ball.dy = (ball.dy < 0 ? ball.dy : -ball.dy) - 2;
      } else if (
        ball.y >= paddle.y + sectionHeight &&
        ball.y < paddle.y + 2 * sectionHeight
      ) {
        ball.dy = 0;
      } else {
        ball.dy = (ball.dy > 0 ? ball.dy : -ball.dy) + 2;
      }
      ball.dx *= -1;
    }
  }

  handleConnection(client: Socket) {
    // Lorsqu'un nouveau client se connecte, enregistrez le socket
    this.socketService.registerSocket(client);
  }

  @SubscribeMessage('joinQueue')
  async handleJoinQueue(client: Socket, payload: any): Promise<void> {
    console.log(`[handleJoinQueue] Un utilisateur tente de rejoindre la queue`, payload);
    console.log(`[handleJoinQueue] Reçu à ${new Date().toISOString()} de ${client.id}`, payload);

    if (this.waitingPlayer) {
      if (this.waitingPlayer.username === payload.username) {
        console.log(`[handleJoinQueue] Le joueur ${payload.username} est déjà en attente. Ignorer.`);
        return;
      }

      console.log(`[handleJoinQueue] Mise à jour du jeu en attente avec le deuxième joueur`, payload.username);

      const waitingGame = await this.gameService.findWaitingGame();
      if (!waitingGame) {
        console.error(`[handleJoinQueue] Aucun jeu en attente trouvé malgré un joueur en attente.`);
        return;
      }

      await this.gameService.updateGame({
        gameId: waitingGame.id,
        player2Username: payload.username,
        status: 'in-progress'
      });

      const roomName = `game-${this.waitingPlayer.username}-${payload.username}`;
      this.waitingPlayer.client.join(roomName);
      client.join(roomName);

      this.rooms.set(roomName, {
        clients: [this.waitingPlayer.client, client],
        ball: {
          x: 400,
          y: 200,
          dx: 4,
          dy: 0,
          size: 10,
        },
        paddles: {
          paddle1: {
            x: 10,
            y: 160,
            width: 10,
            height: 80,
            dy: 4,
          },
          paddle2: {
            x: 780,
            y: 160,
            width: 10,
            height: 80,
            dy: 4,
          },
        },
      });

      this.startGame(roomName);

      console.log("Emitting assignPlayer to player 1");
      this.waitingPlayer.client.emit('assignPlayer', { playerNumber: 1 });

      console.log("Emitting assignPlayer to player 2");
      client.emit('assignPlayer', { playerNumber: 2 });

      const gameDetails = {
        roomName,
        gameId: waitingGame.id,
        player1Username: this.waitingPlayer.username,
        player2Username: payload.username
      };

      this.waitingPlayer.client.emit('startGame', gameDetails);
      client.emit('startGame', gameDetails);

      this.waitingPlayer = null;
    } else {
      console.log("[handleJoinQueue] Tentative de création d'un jeu en attente pour", payload.username);
      await this.gameService.create({ player1Username: payload.username, status: 'waiting' });
      this.waitingPlayer = { client, username: payload.username };
      console.log(`[handleJoinQueue] Joueur ${payload.username} est en attente.`);
    }
  }

  @SubscribeMessage('joinCustomQueue')
  async handleJoinCustomQueue(client: Socket, payload: any): Promise<void> {
    console.log(`[handleJoinQueue] Un utilisateur tente de rejoindre la queue`, payload);
    console.log(`[handleJoinQueue] Reçu à ${new Date().toISOString()} de ${client.id}`, payload);

    if (this.waitingPlayer) {
      if (this.waitingPlayer.username === payload.username) {
        console.log(`[handleJoinQueue] Le joueur ${payload.username} est déjà en attente. Ignorer.`);
        return;
      }

      console.log(`[handleJoinQueue] Mise à jour du jeu en attente avec le deuxième joueur`, payload.username);

      const waitingGame = await this.gameService.findWaitingGame();
      if (!waitingGame) {
        console.error(`[handleJoinQueue] Aucun jeu en attente trouvé malgré un joueur en attente.`);
        return;
      }

      await this.gameService.updateGame({
        gameId: waitingGame.id,
        player2Username: payload.username,
        status: 'in-progress'
      });

      const roomName = `game-${this.waitingPlayer.username}-${payload.username}`;
      this.waitingPlayer.client.join(roomName);
      client.join(roomName);

      this.rooms.set(roomName, {
        clients: [this.waitingPlayer.client, client],
        ball: {
          x: 400,
          y: 200,
          dx: 4,
          dy: 0,
          size: 10,
        },
        paddles: {
          paddle1: {
            x: 10,
            y: 160,
            width: 10,
            height: 80,
            dy: 4,
          },
          paddle2: {
            x: 780,
            y: 160,
            width: 10,
            height: 80,
            dy: 4,
          },
        },
      });

      this.startCustomGame(roomName);

      console.log("Emitting assignPlayer to player 1");
      this.waitingPlayer.client.emit('assignPlayer', { playerNumber: 1 });

      console.log("Emitting assignPlayer to player 2");
      client.emit('assignPlayer', { playerNumber: 2 });

      const gameDetails = {
        roomName,
        gameId: waitingGame.id,
        player1Username: this.waitingPlayer.username,
        player2Username: payload.username
      };

      this.waitingPlayer.client.emit('startCustomGame', gameDetails);
      client.emit('startCustomGame', gameDetails);

      this.waitingPlayer = null;
    } else {
      console.log("[handleJoinQueue] Tentative de création d'un jeu en attente pour", payload.username);
      await this.gameService.create({ player1Username: payload.username, status: 'waiting' });
      this.waitingPlayer = { client, username: payload.username };
      console.log(`[handleJoinQueue] Joueur ${payload.username} est en attente.`);
    }
  }

  @SubscribeMessage('movePaddle')
  handleMovePaddle(client: Socket, payload: { direction: string, playerNumber: number, roomName: string }) {
    console.log("Received movePaddle event from client", client.id, "with payload", payload);

    const roomName = payload.roomName;
    const room = this.rooms.get(roomName);
    if (!room) return; // Si la salle n'existe pas, retourner.

    // Mise à jour de la position des palettes sur le serveur
    const paddle = payload.playerNumber === 1 ? room.paddles.paddle1 : room.paddles.paddle2;
    if (payload.direction === 'up' && paddle.y > 0) {
      paddle.y -= paddle.dy;
    } else if (payload.direction === 'down' && paddle.y < 400 - paddle.height) { // 400 est la hauteur du canvas
      paddle.y += paddle.dy;
    }

    // Vérification de la collision de la balle avec les palettes
    // this.detectPaddleCollision(room.paddles.paddle1, room.ball);
    // this.detectPaddleCollision(room.paddles.paddle2, room.ball);

    // Émission de la nouvelle position des palettes aux clients
    this.server.to(roomName).emit('paddlesPosition', room.paddles);

    console.log("Room name:", roomName);

    const clientsInRoom = this.server.sockets.adapter.rooms.get(roomName);
    console.log("Clients in room", roomName, ":", clientsInRoom);

    const opponentId = Array.from(clientsInRoom).find(id => id !== client.id);
    console.log("Opponent ID:", opponentId);

    if (opponentId) {
      console.log("Emitting opponentPaddleMove to opponent", opponentId);
      this.server.to(opponentId).emit('opponentPaddleMove', payload);
    }
  }

  private getRoomNameForClient(client: Socket): string | null {
    for (const [roomName, roomData] of this.rooms.entries()) {
      const players = roomData.clients;
      if (players.includes(client)) {
        return roomName;
      }
    }
    return null;
  }

  @SubscribeMessage('endGame')
  async handleEndGame(client: Socket, payload: any): Promise<void> {
    console.log(`[handleEndGame] Fin du jeu reçue`, payload);
    // Obtenez le nom de la salle pour le client
    const roomName = this.getRoomNameForClient(client);
    if (!roomName) return;

    this.endGame(roomName);

    // Assurez-vous que le payload contient toutes les informations nécessaires
    if (!payload.gameId || !payload.winner || payload.player1Score === undefined || payload.player2Score === undefined) {
      console.error(`[handleEndGame] Payload incomplet:`, payload);
      return;
    }

    // Vérifiez l'état de la partie dans la base de données
    const gameState = await this.gameService.findGameById(payload.gameId); // Assurez-vous d'avoir une méthode getGameById dans votre gameService
    if (gameState.status === 'completed') {
      // La partie est déjà terminée, ignorez l'événement
      console.log(`Game ${payload.gameId} is already completed. Ignoring endGame event.`);
      return;
    }

    try {
      // Mettre à jour le jeu dans la base de données pour marquer la fin
      await this.gameService.completeGame(
        payload.gameId,
        payload.winner,
        payload.player1Score,
        payload.player2Score
      );

      // Informer les deux joueurs que le jeu est terminé
      const roomName = this.getRoomNameForClient(client);
      if (roomName) {
        this.server.to(roomName).emit('gameEnded', {
          winner: payload.winner,
          player1Score: payload.player1Score,
          player2Score: payload.player2Score
        });
      }
    } catch (error) {
      console.error(`[handleEndGame] Erreur lors de la mise à jour du jeu:`, error);
    }
  }

  // Gérer la déconnexion d'un joueur
  handleDisconnect(client: Socket): void {
    this.socketService.removeSocket(client);
    if (this.waitingPlayer && this.waitingPlayer.client === client) {
      this.waitingPlayer = null;
    }

    // Si le joueur est dans une room, informer l'autre joueur et supprimer la room
    for (const [roomName, roomData] of this.rooms.entries()) {
      const players = roomData.clients; // Obtenez le tableau des clients
      if (players.includes(client)) {
        const otherPlayer = players.find(player => player !== client);
        if (otherPlayer) {
          otherPlayer.emit('opponentLeft');
          otherPlayer.emit('opponentLeftCustom');
          otherPlayer.leave(roomName);
        }
        this.rooms.delete(roomName);
        break;
      }
    }
  }
}