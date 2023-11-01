// message.module.ts
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { UserChatModule } from './userChat.module'; // Importez UserChatModule ici
import { Channel } from './channel.entity';


@Module({
  imports: [
    UserChatModule, // Ajoutez UserChatModule ici
    TypeOrmModule.forFeature([Message, Channel]),
  ],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
