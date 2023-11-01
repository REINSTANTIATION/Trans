//chat.gateway.ts
import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../../chat/message.service';
import { UserChatService } from '../../chat/userChat.service';
import { ChatEventsService } from '../../chat/chatEvents.service';
import { ChannelService } from '../../chat/channel.service';
import * as bcrypt from 'bcrypt';
import { ChannelRole } from '../../chat/channelRole.entity';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})

export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(
    private messageService: MessageService,
    private userChatService: UserChatService,
    private chatEventsService: ChatEventsService,
    private channelService: ChannelService,
  ) {
    this.chatEventsService.getChannelCreatedObservable().subscribe(channelName => {
      this.server.emit('newChannel', channelName);
    });
  }

  afterInit(server: Server) {
    console.log('Initialized Chat Gateway');
  }

  async sendUsersInChannelToAll(channelName: string) {
    const usersInChannel = await this.userChatService.getUsersInChannel(channelName);
    console.log('Sending users in channel:', usersInChannel);
    this.server.to(channelName).emit('usersInChannel', usersInChannel);
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(client: Socket, payload: { channelName: string, password?: string }) {
    const { channelName, password } = payload;
    const channel = await this.channelService.findByName(channelName);
    console.log("Channel type:", channel.type);

    if (channel.type === 'private') {
      console.log("channel private.....");
      if (!password) {
        console.log('Password is required for private channels.');
        return { success: false };
      }
      const isPasswordValid = await bcrypt.compare(password, channel.password);
      if (!isPasswordValid) {
        console.log('invalid password!!!!!');
        return { success: false };
      }
    }

    client.join(channelName);
    const lastMessages = await this.messageService.getLastMessages(channelName);
    client.emit('lastMessages', lastMessages);

    // Mettre à jour le canal de l'utilisateur dans la base de données après qu'il ait rejoint
    const username = client.data?.username;
    if (username) {
      await this.userChatService.joinChannel(username, channelName);

      // Si l'utilisateur rejoint un canal autre que 'general', lui attribuer le rôle de membre
      if (channelName.toLowerCase() !== 'general') {
        // Récupérer l'utilisateur depuis la base de données
        const user = await this.userChatService.findUserByUsername(username);

        // Vérifier si l'utilisateur existe
        if (!user) {
          console.error('User does not exist:', username);
          return; // Vous pouvez également gérer cette situation différemment
        }

        // Vérifier si l'utilisateur est déjà membre du canal
        const userIsAlreadyMember = await this.channelService.userHasRoleInChannel(user.id, channel.id, 'Member');
        if (!userIsAlreadyMember) {
          try {
            const channelRole = new ChannelRole();
            channelRole.channel = Promise.resolve(channel);
            channelRole.user = Promise.resolve(user);
            channelRole.role = 'Member';

            await this.channelService.createChannelRole(channelRole);
          } catch (error) {
            console.error('Error creating channel role:', error);
          }
        }
      }

      const usersInChannel = await this.userChatService.getUsersInChannel(channelName);
      this.server.to(channelName).emit('usersInChannel', usersInChannel);
      // this.server.to(channelName).emit('channelDetails', { channel, roles: channelRole });
    }
  }


  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(client: Socket) {
    const onlineUsers = await this.userChatService.getOnlineUsers();
    client.emit('onlineUsers', onlineUsers);
  }

  @SubscribeMessage('getUsersInChannel')
  async handleGetUsersInChannel(client: Socket, payload: { channelName: string }) {
    const { channelName } = payload;
    const usersInChannel = await this.userChatService.getUsersInChannel(channelName);
    client.emit('usersInChannel', usersInChannel);
  }


  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(client: Socket, payload: { channelName: string }) {
    const { channelName } = payload;
    client.leave(channelName);

    // Mettre à jour le canal de l'utilisateur dans la base de données après qu'il ait quitté
    const username = client.data?.username;
    if (username) {
      await this.userChatService.leaveChannel(username);
      const usersInChannel = await this.userChatService.getUsersInChannel(channelName);
      this.server.to(channelName).emit('usersInChannel', usersInChannel);
    }
  }

  @SubscribeMessage('set_user_online')
  async handleSetUserOnline(client: Socket, payload: { username: string }) {
    const { username } = payload;
    await this.userChatService.setUserStatus(username, 'online');
    this.sendOnlineUsersToAll();
  }

  @SubscribeMessage('set_user_offline')
  handleSetUserOffline(client: Socket, payload: { username: string }) {
    const { username } = payload;
    this.userChatService.setUserStatus(username, 'offline');
  }

  async sendOnlineUsersToAll() {
    const onlineUsers = await this.userChatService.getOnlineUsers();
    console.log('Sending online users:', onlineUsers); // Ajoutez ce log
    this.server.emit('onlineUsers', onlineUsers);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { channel: string; message: string; senderUsername: string }
  ) {
    const { channel, message, senderUsername } = payload;
    console.log("Payload sendMessage: ", payload);
  
    // Vous devez récupérer l'entité ChannelRole pour le canal et l'utilisateur spécifiques.
    const isMuted = await this.channelService.isUserMuted(channel, senderUsername);
  
    // Vérifiez si l'utilisateur est actuellement mis en sourdine.
    // Assurez-vous que 'mutedUntil' est une Date et comparez-la correctement.
    if (isMuted) {
      // Si l'utilisateur est mis en sourdine, informez le client qu'il ne peut pas envoyer de message.
      client.emit('error', 'You are muted in this channel.');
      console.log("muted.............................")
    } else {
      // Si l'utilisateur n'est pas mis en sourdine, continuez à traiter le message comme d'habitude.
      const createdMessage = await this.messageService.createMessage({
        senderUsername,
        channelName: channel,
        content: message,
      });
      this.server.to(channel).emit('newMessage', { ...createdMessage, sender: senderUsername });
    }
  }
  

  @SubscribeMessage('check_or_create_user')
  async handleCheckOrCreateUser(
    client: Socket,
    payload: { username: string }
  ) {
    const { username } = payload;
    let user = await this.userChatService.findUserByUsername(username);
    if (!user) {
      user = await this.userChatService.createUser(username);
    }
    client.data = { username };
    return user;
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket) {
    const username = client.data?.username;
    if (username) {
      const user = await this.userChatService.findUserByUsername(username);
      const previousChannel = user?.channelName;

      await this.userChatService.setUserStatus(username, 'offline');
      await this.userChatService.leaveChannel(username);
      this.sendOnlineUsersToAll();

      if (previousChannel) {
        const usersInChannel = await this.userChatService.getUsersInChannel(previousChannel);
        this.server.to(previousChannel).emit('usersInChannel', usersInChannel);
      }
    }
  }

  @SubscribeMessage('getChannelNames')
  async handleGetChannelNames(client: Socket) {
    const channelNames = await this.channelService.getAllChannelNames(); // Assurez-vous d'avoir une méthode pour obtenir tous les noms de chaînes
    console.log("channels names back: ", channelNames);
    client.emit('channelNames', channelNames);
  }

  @SubscribeMessage('isChannelPrivate')
  async handleIsChannelPrivate(client: Socket, payload: { channelName: string }): Promise<{ isPrivate: boolean }> {
    const { channelName } = payload;
    const isPrivate = await this.channelService.isPrivateChannel(channelName);
    return { isPrivate };
  }

  @SubscribeMessage('getChannelDetails')
  async onGetChannelDetails(client: Socket, payload: { channelName: string }) {
    const { channelName } = payload;

    const channel = await this.channelService.findByName(channelName);
    if (!channel) {
      return client.emit('error', 'Channel not found');
    }
    console.log(`..............Fetching channel details for: ${channelName}`);
    const channelRoles = await this.channelService.getChannelRoles(channelName);
    console.log('Channel Roles..............:', channelRoles);
    client.emit('channelDetails', { channel, roles: channelRoles });
  }
}


