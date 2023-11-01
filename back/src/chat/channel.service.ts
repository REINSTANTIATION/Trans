// channel.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Channel } from './channel.entity'; // Assurez-vous que le chemin est correct
import { CreateChannelDto } from './create-channel.dto'; // Assurez-vous que le chemin d'importation est correct
import { ChatEventsService } from './chatEvents.service';  // Mettez à jour le chemin d'importation
import { ChannelRole } from './channelRole.entity';
import { UserChatService } from './userChat.service'; // ajustez le chemin selon votre structure de projet
import { UserChat } from './userChat.entity';


@Injectable()
export class ChannelService {
  constructor(
    private readonly chatEventsService: ChatEventsService, // Injectez le ChatEventsService ici
    private readonly userChatService: UserChatService, // Injectez UserChatService ici

    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelRole)
    private readonly channelRoleRepository: Repository<ChannelRole>,
    @InjectRepository(UserChat) // L'injection pour UserChat
    private userRepository: Repository<UserChat>, // Maintenant, userRepository est un Repository pour UserChat
    // ...autres injections si nécessaire
  ) { }

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    // Vérifiez si le canal avec le nom spécifié existe déjà
    if (await this.channelExists(createChannelDto.name)) {
      throw new ConflictException('Channel with this name already exists.');
    }

    const channel = this.channelRepository.create(createChannelDto);
    channel.created_by = createChannelDto.username;
    const savedChannel = await this.channelRepository.save(channel);

    // Récupérez ou créez l'entité UserChat pour le créateur du canal
    let user = await this.userChatService.findUserByUsername(createChannelDto.username);
    if (!user) {
      user = await this.userChatService.createUser(createChannelDto.username);
    }

    const channelRole = new ChannelRole();
    channelRole.user = Promise.resolve(user); // Ici, nous associons l'entité UserChat, pas juste le nom d'utilisateur
    channelRole.channel = Promise.resolve(savedChannel);
    channelRole.role = 'Owner';
    await this.channelRoleRepository.save(channelRole);

    return savedChannel;
  }

  async channelExists(name: string): Promise<boolean> {
    const channel = await this.channelRepository.findOne({ where: { name: name.toLowerCase() } });
    return !!channel;
  }


  async findByName(name: string): Promise<Channel | undefined> {
    const channel = await this.channelRepository.findOne({ where: { name } });
    console.log("find by name, channel: ", channel);
    return channel;
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }

  async getAllChannelNames(): Promise<{ name: string, type: string }[]> {
    const channels = await this.channelRepository.find();
    return channels.map(channel => ({
      name: channel.name,
      type: channel.type
    }));
  }

  async isPrivateChannel(channelName: string): Promise<boolean> {
    const channel = await this.channelRepository.findOne({ where: { name: channelName } });
    return channel?.type === 'private';  // Supposons que vous ayez une propriété 'type' qui peut être 'public' ou 'private'
  }

  async findDirectChannel(user1: string, user2: string): Promise<Channel | undefined> {
    // Vérifier si le canal user1-user2 existe
    let channel = await this.channelRepository.findOne({
      where: { name: `${user1}-${user2}`, type: 'direct' }
    });

    // Sinon, vérifiez si le canal user2-user1 existe
    if (!channel) {
      channel = await this.channelRepository.findOne({
        where: { name: `${user2}-${user1}`, type: 'direct' }
      });
    }

    return channel;
  }

  async getChannelRoles(channelName: string): Promise<ChannelRole[]> {
    // Vous pouvez ajouter un log pour déboguer
    console.log(`getChannelRoles called for ${channelName}`);

    const roles = await this.channelRoleRepository.find({
      where: { channel: { name: channelName } },
      relations: ['user'] // Assurez-vous que cette partie est correcte
    });

    // Log des rôles trouvés
    console.log(`Found roles: `, roles);

    return roles;
  }

  async createChannelRole(channelRole: ChannelRole): Promise<ChannelRole> {
    return this.channelRoleRepository.save(channelRole);
  }


  async userHasRoleInChannel(userId: number, channelId: number, roleName: string): Promise<boolean> {
    // Rechercher un rôle spécifique pour l'utilisateur dans le canal
    const existingRole = await this.channelRoleRepository.findOne({
      where: {
        userId: userId, // utilisez l'ID de l'utilisateur, correspondant à la colonne 'userId'
        channelId: channelId, // utilisez l'ID du canal, correspondant à la colonne 'channelId'
        role: roleName as 'Owner' | 'Admin' | 'Muted' | 'Banned' | 'Member' // assertion de type pour le nom du rôle
      }
    });

    // Retourner true si un rôle est trouvé, sinon false
    return !!existingRole;
  }

  async isUserAdmin(channelName: string, username: string): Promise<boolean> {
    const channel = await this.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Récupérez l'utilisateur par son username
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRole = await this.channelRoleRepository.findOne({
      where: {
        channelId: channel.id,  // utilisez l'ID du canal, correspondant à la colonne 'channelId'
        userId: user.id,  // utilisez l'ID de l'utilisateur, correspondant à la colonne 'userId'
      },
    });

    return userRole?.role === 'Admin';  // cela suppose que vous stockez les rôles en tant que chaînes, ajustez en fonction de votre implémentation
  }


  async getOwnerRoleForChannel(channelId: number): Promise<ChannelRole | null> {
    return this.channelRoleRepository.findOne({
      where: {
        channelId: channelId,
        role: 'Owner'
      },
      relations: ['user'] // Ceci assume que vous avez une relation 'user' dans votre entité ChannelRole
    });
  }

  async getOwnerForChannel(channelId: number): Promise<UserChat> {
    const ownerRole = await this.channelRoleRepository.findOne({
      where: {
        channelId: channelId,
        role: 'Owner'
      },
      relations: ['user'], // Ceci indique à TypeORM de joindre l'utilisateur lié
    });

    if (!ownerRole) {
      throw new NotFoundException('Owner role not found for channel');
    }

    return ownerRole.user; // Ici, nous supposons que 'user' est résolu et renvoie une instance de UserChat, pas une promesse.
  }

  async promoteToAdmin(channelName: string, usernameToPromote: string): Promise<void> {
    const channel = await this.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Récupérez l'utilisateur par son username
    const user = await this.userRepository.findOne({ where: { username: usernameToPromote } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRole = await this.channelRoleRepository.findOne({
      where: {
        channelId: channel.id,  // utilisez l'ID du canal, correspondant à la colonne 'channelId'
        userId: user.id,  // utilisez l'ID de l'utilisateur, correspondant à la colonne 'userId'
      },
    });

    if (!userRole) {
      throw new NotFoundException('User not found in channel');
    }

    if (userRole.role === 'Admin') {
      throw new BadRequestException('User is already an admin');
    }

    userRole.role = 'Admin';  // ajustez en fonction de la façon dont vous gérez les rôles
    await this.channelRoleRepository.save(userRole);
  }

  async downgradeToMember(channelName: string, usernameToDowngrade: string): Promise<void> {
    const channel = await this.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Récupérez l'utilisateur par son username
    const user = await this.userRepository.findOne({ where: { username: usernameToDowngrade } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRole = await this.channelRoleRepository.findOne({
      where: {
        channelId: channel.id,  // utilisez l'ID du canal, correspondant à la colonne 'channelId'
        userId: user.id,  // utilisez l'ID de l'utilisateur, correspondant à la colonne 'userId'
      },
    });

    if (!userRole) {
      throw new NotFoundException('User not found in channel');
    }

    if (userRole.role === 'Member') {
      throw new BadRequestException('User is already a member');
    }

    userRole.role = 'Member';  // ajustez en fonction de la façon dont vous gérez les rôles
    await this.channelRoleRepository.save(userRole);
  }

  async muteUser(channelName: string, usernameToMute: string): Promise<void> {
    const channel = await this.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Récupérez l'utilisateur par son username
    const user = await this.userRepository.findOne({ where: { username: usernameToMute } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRole = await this.channelRoleRepository.findOne({
      where: {
        channelId: channel.id,  // utilisez l'ID du canal, correspondant à la colonne 'channelId'
        userId: user.id,  // utilisez l'ID de l'utilisateur, correspondant à la colonne 'userId'
      },
    });

    if (!userRole) {
      throw new NotFoundException('User not found in channel');
    }

    if (userRole.role === 'Muted') {
      throw new BadRequestException('User is already muted');
    }

    userRole.role = 'Muted';
    // Définir une durée de sourdine fixe de 10 secondes
    userRole.mutedUntil = new Date(new Date().getTime() + 10 * 1000); // 10 secondes sont ajoutées à l'heure actuelle
    await this.channelRoleRepository.save(userRole);
  }


  async unmuteUsers(): Promise<void> {
    const mutedUsers = await this.channelRoleRepository.find({
      where: {
        role: 'Muted',
        mutedUntil: LessThan(new Date()), // utilisez LessThan pour obtenir les utilisateurs dont le temps de mute est passé
      },
    });

    for (const user of mutedUsers) {
      user.role = 'Member'; // ou un autre rôle par défaut
      user.mutedUntil = null; // réinitialisez le champ
      await this.channelRoleRepository.save(user);
    }
  }



  async isUserMuted(channelName: string, username: string): Promise<boolean> {
    const channel = await this.findByName(channelName);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Récupérez l'utilisateur par son username
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRole = await this.channelRoleRepository.findOne({
      where: {
        channelId: channel.id,  // utilisez l'ID du canal, correspondant à la colonne 'channelId'
        userId: user.id,  // utilisez l'ID de l'utilisateur, correspondant à la colonne 'userId'
      },
    });

    return userRole?.role === 'Muted';  // cela suppose que vous stockez les rôles en tant que chaînes, ajustez en fonction de votre implémentation
  }

  // ... autres méthodes
}
