// userChat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChat } from './userChat.entity';
import { UserChatService } from './userChat.service'; // n'oubliez pas d'importer le service

@Module({
  imports: [TypeOrmModule.forFeature([UserChat])],
  providers: [UserChatService], // ajoutez le service en tant que fournisseur
  exports: [UserChatService, TypeOrmModule], // exportez le service pour l'utiliser dans d'autres modules
})
export class UserChatModule {}

