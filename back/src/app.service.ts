//app.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChannelService } from './chat/channel.service'; // importez votre ChannelService

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private channelService: ChannelService) {}

  async onModuleInit() {
    // Vérifier si le canal "general" existe déjà
    const existingChannel = await this.channelService.findByName('general');

    // Si le canal "general" n'existe pas, créez-le
    if (!existingChannel) {
      this.channelService.create({
        name: 'general',
        type: 'public',
        username: 'system'
      }); 
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}

