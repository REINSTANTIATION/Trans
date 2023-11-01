// message.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { UserChat } from './userChat.entity'; // importez UserChat
import { Channel } from './channel.entity'; // importez Channel
import { UserChatService } from './userChat.service';


@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(UserChat) // injectez le Repository pour UserChat
        private userChatRepository: Repository<UserChat>, // ajoutez cette ligne
        @InjectRepository(Channel) // injectez le Repository pour Channel
        private channelRepository: Repository<Channel>, // ajoutez cette ligne
        private userChatService: UserChatService
    ) { }

    // une fonction pour sauvegarder un message dans la base de données
    async saveMessage(message: Message) {
        console.log('Saving message:', message); // ajoutez un log ici pour vérifier que le message est reçu par le service

        const savedMessage = await this.messageRepository.save(message);

        console.log('Saved message:', savedMessage); // ajoutez un log ici pour vérifier que le message est sauvegardé

        return savedMessage;
    }

    async createMessage(details: { senderUsername: string, channelName: string, content: string }) {
        const message = new Message();
        message.content = details.content;
        
        const sender = await this.userChatService.findUserByUsername(details.senderUsername);
        const channel = await this.channelRepository.findOne({ where: { name: details.channelName } });
    
        if (!sender || !channel) {
            throw new Error('Sender or Channel not found');
        }
    
        message.sender = Promise.resolve(sender);
        message.channel = Promise.resolve(channel);
        message.senderUsername = details.senderUsername; // mise à jour du champ supplémentaire
        message.channelName = details.channelName; // mise à jour du champ supplémentaire
    
        return this.saveMessage(message);
    }

    async getLastMessages(channelName: string, limit: number = 10) {
        return this.messageRepository.find({
            where: { channelName: channelName },
            order: { timestamp: 'DESC' },
            take: limit,
            relations: ['sender']
        });
    }
    
    // d'autres fonctions selon vos besoins ...
}
