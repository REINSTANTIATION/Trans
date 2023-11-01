// message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { UserChat } from './userChat.entity';
import { Channel } from './channel.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(type => UserChat, user => user.messages)
  sender: Promise<UserChat>;

  @ManyToOne(type => Channel, channel => channel.messages)
  channel: Promise<Channel>;

  @Column()
  senderUsername: string; // champ supplémentaire pour stocker le nom d'utilisateur

  @Column()
  channelName: string; // champ supplémentaire pour stocker le nom de la chaîne
}

  
  