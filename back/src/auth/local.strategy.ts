// local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',  // définissez le champ dans la requête qui représente le nom d'utilisateur
      passwordField: 'password',  // définissez le champ dans la requête qui représente le mot de passe
    });  // ces valeurs sont par défaut, donc cela fonctionne même si vous ne les définissez pas explicitement
  }

  // Cette méthode est requise par Passport, et elle définit la logique de validation des utilisateurs.
  async validate(username: string, password: string): Promise<any> {
    // utilisez AuthService pour valider si les informations d'identification sont correctes
    const user = await this.authService.validateUser(username, password);

    // si les informations d'identification ne sont pas valides, lancez une exception
    if (!user) {
      throw new UnauthorizedException();
    }

    // si les informations d'identification sont valides, retournez l'utilisateur
    return user;
  }
}

