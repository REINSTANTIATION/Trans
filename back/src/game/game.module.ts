import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from '../sockets/game/game.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { SocketsModule } from '../sockets/socket.module'; // Assurez-vous de mettre à jour ce chemin
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([GameEntity]),
        SocketsModule,
        AuthModule // Ajoutez ceci
    ],
    controllers: [GameController],
    providers: [GameService, GameGateway],
    exports: [GameService], // export GameService si vous en avez besoin dans d'autres modules
})
export class GameModule { }
