// userChat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserChat } from './userChat.entity';

@Injectable()
export class UserChatService {
  constructor(
    @InjectRepository(UserChat)
    private userChatRepository: Repository<UserChat>,
  ) { }

  async createUser(username: string): Promise<UserChat> {
    const user = new UserChat();
    user.username = username;
    return await this.userChatRepository.save(user);
  }

  async findUserByUsername(username: string): Promise<UserChat | undefined> {
    return await this.userChatRepository.findOne({ where: { username } });
  }

  async setUserStatus(username: string, status: 'online' | 'offline'): Promise<void> {
    const user = await this.findUserByUsername(username);
    if (user) {
      user.status = status;
      await this.userChatRepository.save(user);
    }
  }

  async getOnlineUsers(): Promise<string[]> {
    const users = await this.userChatRepository.find({ where: { status: 'online' } });
    const usernames: string[] = [];
    for (let user of users) {
      usernames.push(user.username);
    }
    return usernames;
  }

  async joinChannel(username: string, channelName: string): Promise<void> {
    const user = await this.findUserByUsername(username);
    if (user) {
      user.channelName = channelName;
      await this.userChatRepository.save(user);
    }
  }

  async leaveChannel(username: string): Promise<void> {
    const user = await this.findUserByUsername(username);
    if (user) {
      user.channelName = null;
      await this.userChatRepository.save(user);
    }
  }

  async getUsersInChannel(channelName: string): Promise<string[]> {
    const users = await this.userChatRepository.find({ where: { channelName } });
    const usernames: string[] = [];
    for (let user of users) {
      usernames.push(user.username);
    }
    return usernames;
  }
}

