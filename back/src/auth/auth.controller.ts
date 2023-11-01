//auth.controller.ts
import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto } from '../users/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private readonly usersService: UsersService, // Injectez UsersService
  ) { }

  @Post('setup-2fa')
  async setupTwoFactorAuthentication(@Body() body: { username: string }) {
    const { username } = body;
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }

    const { secret, otpauth_url } = await this.usersService.generateTwoFactorSecret();
    const qrCode = await this.usersService.generateQRCode(otpauth_url);

    return { qrCode, secret };
  }

  @Post('verify-2fa')
  async verifyTwoFactorAuthentication(@Body() body: { username: string, token: string, secret: string }) {
    const { username, token, secret } = body;
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'ascii',
      token
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    const user = await this.usersService.findOneByUsername(username);
    user.twoFactorSecret = secret;
    user.isTwoFactorEnabled = true;
    await this.usersService.save(user);

    return { message: '2FA setup successful' };
  }


  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('auth/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}