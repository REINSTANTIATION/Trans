// message.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.entity'; // importez votre entité Message
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // assurez-vous que le chemin d'importation est correct

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // une route pour sauvegarder un message
  @Post()
  async saveMessage(@Body() message: Message) {
    return this.messageService.saveMessage(message);
  }

  @Get('last/:channelName')
  async getLastMessages(@Param('channelName') channelName: string) {
      return this.messageService.getLastMessages(channelName);
  }

  // d'autres routes selon vos besoins ...
}

