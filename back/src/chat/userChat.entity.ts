// userChat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from './message.entity';
import { Channel } from './channel.entity';
import { ChannelRole } from './channelRole.entity';

@Entity('user_chats')
export class UserChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 'offline' })
  status: 'offline' | 'online';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_online: Date;

  @Column({ nullable: true })
  channelName: string;

  @OneToMany(type => Message, message => message.sender)
  messages: Message[];

  @OneToMany(() => ChannelRole, channelRole => channelRole.user)
  channelRoles: ChannelRole[];
}
