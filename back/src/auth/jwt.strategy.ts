// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // définit comment le JWT doit être extrait de la requête
      ignoreExpiration: false, // assurez-vous que les JWT expirés ne sont pas acceptés
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // la clé secrète utilisée pour vérifier la signature du JWT
    });
  }

  // Cette méthode est appelée après qu'un JWT valide a été trouvé dans la requête,
  // et elle est utilisée pour construire un objet qui sera injecté dans les requêtes
  // comme l'objet "user" (accessible via `@Request() req` dans les méthodes de contrôleur).
  async validate(payload: any) {
    // Vous pourriez également charger des informations supplémentaires sur l'utilisateur si nécessaire
    return { userId: payload.sub, username: payload.username };
  }
}
