//game.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from './game.entity';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private gameRepository: Repository<GameEntity>,
    ) { }

    async create(gameData: Partial<GameEntity>): Promise<GameEntity> {
        console.log("fonction create");
        const game = this.gameRepository.create(gameData);
        return await this.gameRepository.save(game);
    }

    async updateGame(gameData: { gameId: number, player2Username: string, status: 'in-progress' }): Promise<void> {
        const { gameId, player2Username, status } = gameData;
        await this.gameRepository.update(gameId, { player2Username, status });
    }

    async findWaitingGame(): Promise<GameEntity | undefined> {
        return this.gameRepository.findOne({ where: { status: 'waiting' } });
    }

    async joinGame(username: string): Promise<string> {
        const waitingGame = await this.findWaitingGame();

        if (waitingGame) {
            if (waitingGame.player1Username === username) {
                return 'User already in waiting game.';
            }

            // Update the waiting game with player 2 only if it's not the same as player 1
            if (waitingGame.player1Username !== username) {
                await this.updateGame({
                    gameId: waitingGame.id,
                    player2Username: username,
                    status: 'in-progress'
                });
                return 'Game started!';
            }
        } else {
            // Check if the user already has a waiting game
            const existingGame = await this.gameRepository.findOne({ where: { player1Username: username, status: 'waiting' } });
            if (!existingGame) {
                console.log("[joinGame] Tentative de création d'un jeu en attente pour", username);
                await this.create({ player1Username: username, status: 'waiting' });
                return 'User added to waiting queue.';
            } else {
                return 'User already in waiting game.';
            }
        }
    }

    async findGameById(gameId: number): Promise<GameEntity | undefined> {
        return await this.gameRepository.findOne({where: {id: gameId}});
    }

    async completeGame(gameId: number, winner: string, player1Score: number, player2Score: number): Promise<void> {
        await this.gameRepository.update(gameId, {
            winner: winner,
            player1Score: player1Score,
            player2Score: player2Score,
            status: 'completed'
        });
    }


    // ... Autres méthodes utiles pour récupérer, mettre à jour ou supprimer des parties ...
}

