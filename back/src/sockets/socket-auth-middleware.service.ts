// socket-auth-middleware.service.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';
import { NextFunction } from 'express';

@Injectable()
export class SocketAuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(socket: Socket, next: NextFunction): Promise<void> {
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
        next(new Error('Erreur d\'authentification'));
      }
    } else {
      next(new Error('Token non fourni ou invalide'));
    }
  }
}


