//chatEvents.service.ts

import { Injectable } from '@nestjs/common';
import { Channel } from './channel.entity';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class ChatEventsService {
  private readonly channelCreated = new Subject<Channel>();

  /**
   * Notify when a channel is created.
   * @param channelName - The name of the created channel.
   */
  notifyChannelCreated(channel: Channel): void {
    this.channelCreated.next(channel);
  }

  /**
   * Get an observable to listen to channel creation events.
   * @returns Observable<string> - An observable emitting channel names.
   */
  getChannelCreatedObservable(): Observable<Channel> {
    return this.channelCreated.asObservable();
  }

}

