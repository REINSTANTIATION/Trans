// schedule.provider.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ChannelService } from './channel.service'; // importez votre service
import * as schedule from 'node-schedule';

@Injectable()
export class ScheduleProvider implements OnModuleInit, OnModuleDestroy {
  private job: schedule.Job;

  constructor(private readonly channelRoleService: ChannelService) {}

  onModuleInit() {
    this.job = schedule.scheduleJob('*/1 * * * *', async () => { // s'exécute toutes les minutes, ajustez selon vos besoins
      console.log('Running the job...');
      await this.channelRoleService.unmuteUsers(); // appelez une méthode dans votre service qui vérifie et démute les utilisateurs
    });
  }

  onModuleDestroy() {
    this.job.cancel();
  }
}
