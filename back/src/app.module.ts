//app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SocketsModule } from './sockets/socket.module';
import { GameModule } from './game/game.module';
import { ChannelModule } from './chat/channel.module'; // importez ChannelModule
import { ScheduleProvider } from './chat/schedule.provider';
import { SocketAuthMiddleware } from './sockets/socket-auth-middleware.service'; // ajustez le chemin d'accès en fonction de l'emplacement du fichier


@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    AuthModule,
    SocketsModule,
    GameModule,
    ChannelModule
  ],
  controllers: [AppController],
  providers: [AppService, ScheduleProvider, SocketAuthMiddleware],
})
export class AppModule { }



