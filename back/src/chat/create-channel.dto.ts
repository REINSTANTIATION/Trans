export class CreateChannelDto {
  name: string;
  type: 'public' | 'private' | 'direct';
  username: string;
  password?: string; // Facultatif, car tous les canaux n'auront pas de mot de passe
}

  