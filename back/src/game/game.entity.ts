//game.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class GameEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '' })
    player1Username: string;

    @Column({ default: '' })
    player2Username: string;

    @Column({ default: 0 })
    player1Score: number;

    @Column({ default: 0 })
    player2Score: number;

    @Column({ default: '' })
    winner: string;

    @Column({ default: 'waiting' }) 
    status: 'waiting' | 'in-progress' | 'completed';

    @Column({ default: false })
    isPaused: boolean;  // nouveau champ pour suivre si le jeu est en pause
    
    // ... autres colonnes pertinentes ...
}
