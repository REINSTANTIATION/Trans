//socket.module.ts
import { Module } from '@nestjs/common';
// import { GameModule } from 'src/game/game.module';
import { SocketService } from './socket.service'; // Assurez-vous que le chemin est correct

@Module({
  imports: [],
  providers: [SocketService],
  exports: [SocketService]  // Exportez-le si vous voulez qu'il soit utilisé dans d'autres modules
})
export class SocketsModule {}

