// local-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    // Cette méthode est appelée après que la stratégie Passport ait terminé son exécution.
    // Vous avez la possibilité de gérer la requête avant qu'elle ne soit renvoyée au client.
    handleRequest(err: any, user: any, info: any, context: any) {
        // "err" serait une erreur générée dans la stratégie Passport.
        // "user" serait l'objet utilisateur si l'authentification a réussi.
        // "info" pourrait contenir des informations supplémentaires renvoyées par la stratégie Passport.
        // "context" est le contexte d'exécution de la requête.

        // Si une erreur s'est produite ou si aucun utilisateur n'est renvoyé (c'est-à-dire que l'authentification a échoué),
        // vous pouvez choisir de lancer une exception.
        if (err || !user) {
            throw err || new UnauthorizedException();
        }

        // Si tout est en ordre, renvoyez l'utilisateur pour qu'il soit disponible dans la requête.
        return user;
    }
}

