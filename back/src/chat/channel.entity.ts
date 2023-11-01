// channel.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { UserChat } from './userChat.entity';
import { Message } from './message.entity';
import { ChannelRole } from './channelRole.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['public', 'private', 'direct'], default: 'public' })
  type: 'public' | 'private' | 'direct';

  @Column({ nullable: true })
  user1Name: string;

  @Column({ nullable: true })
  user2Name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: '' })
  created_by: string;

  @Column({ nullable: true })
  password?: string;

  @OneToMany(type => ChannelRole, channelRole => channelRole.channel)
  channelRoles: ChannelRole[];

  @ManyToMany(() => UserChat)
  users: UserChat[];

  @OneToMany(type => Message, message => message.channel)
  messages: Promise<Message[]>;  // Notez le type Promise<Message[]>
}

