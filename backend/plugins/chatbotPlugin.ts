import {Plugin} from '../types/plugin';
import {Server, Socket} from 'socket.io';
import { generateUniqueId } from '../utils/generateMessageId';

export class ChatbotDemoPlugin implements Plugin {
    initialize(app: Express.Application, io: Server): void {
        io.on('connection', (socket: Socket)=>{
            socket.on('sendMessage', (message)=>{
                if(message?.text?.startsWith('/bot')){
                    let botMessage = `Hello ${message.user}`;
                    const echoMsg = message.text.replace(/\/bot/, '').trim();
                    if(echoMsg){
                        botMessage += `, \n you mentioned: ${echoMsg}`;
                    } else{
                        botMessage += `, How can i help you?`;
                    }
                    io.emit('message', { id: generateUniqueId(), text: botMessage, user: 'Chatbot', status: 'sent', timestamp: new Date().toISOString() });
                }
            })
        })
    }
}