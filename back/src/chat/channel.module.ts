// channel.module.ts
import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel } from './channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from '../sockets/chat/chat.gateway';
import { MessageModule } from './message.module'; // Assurez-vous que le chemin est correct
import { UserChatModule } from './userChat.module'; // ajustez le chemin d'importation
import { ChannelController } from './channel.controller';
import { ChatEventsService } from './chatEvents.service'; // importez ChatEventsService ici
import { ChannelRole } from './channelRole.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelRole]),
    MessageModule,
    UserChatModule
  ],
  providers: [ChannelService, ChatGateway, ChatEventsService],  // Ajoutez ChatEventsService aux providers
  controllers: [ChannelController],
  exports: [ChannelService, ChatEventsService],  // Exportez ChatEventsService
})
export class ChannelModule {}
