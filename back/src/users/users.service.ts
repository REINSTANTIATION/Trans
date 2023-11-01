// src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';
// 2fa auth
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) { }

  async createUser(userData: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async updateUserStats(username: string, won: boolean) {
    const user = await this.usersRepository.findOne({ where: { username } });
    // if (!user) {
    //   throw new NotFoundException(`User ${username} not found`);
    // }

    user.gamesPlayed += 1;
    if (won) {
      user.victories += 1;
    }

    await this.usersRepository.save(user);
    return user;
  }

  async getScoreBoard(): Promise<User[]> {
    return this.usersRepository.find({
      order: {
        victories: 'DESC', // trier par nombre de victoires en ordre décroissant
      },
    });
  }

  async updateUserAvatar(username: string, avatarUrl: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }

    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }

  async getUserAvatar(username: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return user.avatarUrl;
  }

  async generateTwoFactorSecret(): Promise<{ secret: string, otpauth_url: string }> {
    const { base32, otpauth_url } = speakeasy.generateSecret({ length: 20, name: 'newBaby' });
    return { secret: base32, otpauth_url };
  }


  async generateQRCode(otpauth_url: string): Promise<string> {
    return QRCode.toDataURL(otpauth_url);
  }

  async save(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }

}