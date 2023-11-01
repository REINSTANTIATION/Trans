//socket.service.ts
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private server: Server;
  private sockets: Map<string, Socket> = new Map(); // Pour gérer les sockets par ID

  setServer(server: Server) {
    this.server = server;
  }

  registerSocket(socket: Socket) {
    this.sockets.set(socket.id, socket);
  }

  getSocketById(id: string) {
    return this.sockets.get(id);
  }

  getAllSockets() {
    return this.sockets;
  }

  removeSocket(socket: Socket) {
    this.sockets.delete(socket.id);
  }

  // Vous pouvez ajouter d'autres méthodes ici selon vos besoins
}
