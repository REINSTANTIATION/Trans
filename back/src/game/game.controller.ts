//game.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { GameEntity } from './game.entity';

@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Post()
    async createGame(@Body() gameData: Partial<GameEntity>): Promise<GameEntity> {
        return await this.gameService.create(gameData);
    }

    @Get(':id')
    async getGame(@Param('id') gameId: number): Promise<GameEntity> {
        return await this.gameService.findGameById(gameId);
    }

    @Post(':id/complete')
    async completeGame(@Param('id') gameId: number, @Body() data: { winner: string, player1Score: number, player2Score: number }): Promise<any> {
        await this.gameService.completeGame(gameId, data.winner, data.player1Score, data.player2Score);
        return { message: 'Game completed successfully!' };
    }

    @Post('joinGame')
    async joinGame(@Body() data: { username: string }): Promise<any> {
        return await this.gameService.joinGame(data.username);
    }
    

    // ... Autres points de terminaison pour interagir avec les parties ...
}
