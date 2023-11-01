// channelRole.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, Unique } from 'typeorm';
import { Channel } from './channel.entity';
import { UserChat } from './userChat.entity';

@Entity()
@Unique(['userId', 'channelId']) // Cette ligne s'assure que la combinaison de userId et channelId est unique
export class ChannelRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserChat, user => user.channelRoles, { eager: false })
  @JoinColumn({ name: 'userId' }) // Cette ligne assure que la clé étrangère est stockée dans la colonne 'userId'
  user: Promise<UserChat>;

  @Column() // Cette colonne stockera l'ID de l'utilisateur
  userId: number;

  @ManyToOne(() => Channel, channel => channel.channelRoles, { eager: false })
  @JoinColumn({ name: 'channelId' }) // Cette ligne assure que la clé étrangère est stockée dans la colonne 'channelId'
  channel: Promise<Channel>;

  @Column() // Cette colonne stockera l'ID du canal
  channelId: number;

  @Column({ type: 'enum', enum: ['Owner', 'Admin', 'Muted', 'Banned', 'Member'] })
  role: 'Owner' | 'Admin' | 'Muted' | 'Banned' | 'Member';

  @Column({ nullable: true })
  mutedUntil: Date;

}


