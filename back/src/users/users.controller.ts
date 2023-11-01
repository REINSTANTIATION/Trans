import { Controller, Post, Body, Put, Get, Req, UnauthorizedException, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { join } from 'path';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @UseInterceptors(FileInterceptor('avatar', {
        storage: multer.diskStorage({
            destination: '../../../uploads/avatars',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fullPath = join(__dirname, '..', '..', '..', 'uploads', 'avatars', file.fieldname + '-' + uniqueSuffix);
                console.log('Full path:', fullPath);
                console.log('Current working directory:', process.cwd());
                cb(null, file.fieldname + '-' + uniqueSuffix);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
                cb(null, true);
            } else {
                console.error('Rejected file:', file);
                cb(new Error('Invalid file type'), false);
            }
        }
    }))
    async createUser(@Body() createUserDto: CreateUserDto, @UploadedFile() avatar?: Express.Multer.File): Promise<User> {
        const newUser = await this.usersService.createUser(createUserDto);
        
        let avatarUrl: string;
        if (avatar) {
            avatarUrl = `http://localhost:3000/uploads/avatars/${avatar.filename}`;
        } else {
            console.log("pas d avatar................")
            avatarUrl = `http://localhost:3000/uploads/avatars/default-avatar`;
        }
        await this.usersService.updateUserAvatar(newUser.username, avatarUrl);
        
        return newUser;
    }
    

    @Put('/update-stats/:username')
    async updateUserStats(@Param('username') username: string, @Body() data: { won: boolean }): Promise<User> {
        return this.usersService.updateUserStats(username, data.won);
    }

    @Get('/scoreboard')
    async getScoreBoard(): Promise<User[]> {
        return this.usersService.getScoreBoard();
    }

    @Get('search')
    async searchUser(@Query('username') username: string): Promise<User | undefined> {
        return this.usersService.findOneByUsername(username);
    }

    @Get('avatar/:username')
    async getUserAvatar(@Param('username') username: string): Promise<{ avatarUrl: string }> {
        const avatarUrl = await this.usersService.getUserAvatar(username);
        return { avatarUrl };
    }
}

