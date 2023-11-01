//auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
            avatarUrl: user.avatarUrl,  // Ajoutez l'URL de l'avatar à la réponse
        };
    }

    async isTokenValid(token: string): Promise<boolean> {
        try {
            // JwtService vérifie la validité du token (c'est-à-dire s'il n'est pas expiré et si la signature est correcte)
            this.jwtService.verify(token); 
            return true;
        } catch (error) {
            // Si une erreur se produit, le token est invalide
            return false;
        }
    }
    
}
