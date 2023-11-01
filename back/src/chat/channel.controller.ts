//channel.controller.ts

import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './create-channel.dto';
import { Channel } from './channel.entity';
import * as bcrypt from 'bcrypt';

import { ChatGateway } from '../sockets/chat/chat.gateway'; // Adaptez le chemin d'accès
import { ChannelRole } from './channelRole.entity';  // Assurez-vous d'importer ChannelRole
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // assurez-vous que le chemin d'importation est correct
import { UserChat } from './userChat.entity';
import { User } from 'src/users/user.entity';

interface RequestWithUser extends Request {
  user: User; // ou toute autre structure que vous avez pour un utilisateur
}

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService, private readonly chatGateway: ChatGateway) { }

  @Post()
  async create(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    const creatorUsername = createChannelDto.username;  // Récupérez le username depuis le DTO

    // Validation simple pour s'assurer que le username est fourni
    if (!creatorUsername) {
      throw new BadRequestException('Username is required');
    }

    if (createChannelDto.type === 'direct') {
      const users = createChannelDto.name.split('-');
      const existingChannel = await this.channelService.findDirectChannel(users[0], users[1]);
      if (existingChannel) {
        // Si un canal direct existe déjà, retournez-le
        return existingChannel;
      }
    }

    // Chiffrez le mot de passe avant de le stocker, seulement s'il s'agit d'un canal privé avec un mot de passe
    if (createChannelDto.type === 'private' && createChannelDto.password) {
      const saltRounds = 10;
      createChannelDto.password = await bcrypt.hash(createChannelDto.password, saltRounds);
    } else if (createChannelDto.type === 'direct') {
      // Si c'est un canal direct, assurez-vous que le mot de passe est null ou non défini
      createChannelDto.password = null;
    }
    const newChannel = await this.channelService.create(createChannelDto);
    this.chatGateway.server.emit('newChannel', newChannel);

    return newChannel
  }

  @Get('/channelsName')
  async findAllChannels(): Promise<Channel[]> {
    return this.channelService.findAll();
  }

  // channel.controller.ts

  @Get(':channelName/details')
  async getChannelDetails(@Param('channelName') channelName: string) {
    const channel = await this.channelService.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const roles = await this.channelService.getChannelRoles(channelName);

    // Résoudre les promesses d'utilisateur pour chaque rôle
    const rolesWithUsers = await Promise.all(roles.map(async (role) => {
      const user = await role.user; // Résoudre la promesse ici
      return { username: user.username, role: role.role };
    }));

    return {
      channel,
      roles: rolesWithUsers, // Utilisez les rôles avec les utilisateurs résolus
    };
  }

  @Post(':channelName/promoteToAdmin')
  // @UseGuards(AuthGuard())  // Ceci est commenté pour le moment, en raison des problèmes d'authentification
  async promoteToAdmin(
    @Body() promoteData: { username: string },  // Recevoir les deux usernames dans le corps
    @Param('channelName') channelName: string,
    // @Req() req: RequestWithUser // Utilisation de 'RequestWithUser' ici
  ) {
    const { username: usernameToPromote } = promoteData; // si 'username' est celui à promouvoir
    // const currentUser = req.user; // Voici comment vous accédez aux informations de l'utilisateur actuel

    console.log("promoteData: ...................", promoteData);
    console.log("usernameToPromote:..............", usernameToPromote)
    // console.log("User making the request: ", currentUser);

    const channel = await this.channelService.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Obtenez le propriétaire du canal depuis les rôles
    // const owner = await this.channelService.getOwnerForChannel(channel.id);

    // if (!owner || owner.username !== currentUsername) { // Comparez les noms d'utilisateur
    //   throw new BadRequestException('You are not allowed to promote users in this channel');
    // }

    // Vérifiez si l'utilisateur est déjà un administrateur
    // const isAdmin = await this.channelService.isUserAdmin(channelName, usernameToPromote);
    // if (isAdmin) {
    //   throw new BadRequestException('User is already an admin');
    // }

    // Si tout est en ordre, appelez une méthode dans votre service de canal pour effectuer la promotion.
    await this.channelService.promoteToAdmin(channelName, usernameToPromote);

    // Après la promotion, vous pouvez choisir d'émettre un événement de socket pour informer tous les clients dans le canal de la promotion.
    this.chatGateway.server.to(channelName).emit('userPromoted', { channel: channelName, username: usernameToPromote });

    return { message: 'User has been promoted to admin' };
  }

  @Post(':channelName/downgradeToMember')
  // @UseGuards(AuthGuard())
  async downgradeToMember(
    @Body() downgradeData: { username: string },
    @Param('channelName') channelName: string,
    // @Req() req: RequestWithUser // Utilisation de 'RequestWithUser' ici
  ) {
    const { username: usernameToDowngrade } = downgradeData;
    // const currentUser = req.user; // L'utilisateur qui effectue la requête

    // Vous pouvez ajouter une vérification ici pour vous assurer que currentUser est le propriétaire du canal.

    await this.channelService.downgradeToMember(channelName, usernameToDowngrade);

    // Après la rétrogradation, vous pouvez choisir d'émettre un événement de socket pour informer tous les clients dans le canal de la rétrogradation.
    this.chatGateway.server.to(channelName).emit('userDowngraded', { channel: channelName, username: usernameToDowngrade });

    return { message: 'User has been downgraded to member' };
  }

  @Post(':channelName/muteUser')
  // @UseGuards(AuthGuard())
  async muteUser(
    @Body() muteData: { username: string, duration: number }, // inclure la durée en secondes
    @Param('channelName') channelName: string,
    // @Req() req: Request // Vous pouvez utiliser `RequestWithUser` si vous avez étendu la requête avec des informations utilisateur
  ) {
    const { username: usernameToMute, duration } = muteData;
    // const currentUser = req.user; // L'utilisateur qui effectue la requête

    // Vous pouvez ajouter une vérification ici pour vous assurer que currentUser est autorisé à mettre en sourdine les utilisateurs.

    // Appel à la méthode du service pour mettre l'utilisateur en sourdine
    await this.channelService.muteUser(channelName, usernameToMute);

    // Après avoir mis l'utilisateur en sourdine, vous pouvez choisir d'émettre un événement de socket pour informer tous les clients dans le canal de l'action.
    this.chatGateway.server.to(channelName).emit('userMuted', { channel: channelName, username: usernameToMute, duration });

    return { message: `User has been muted for ${duration} seconds` };
  }

}