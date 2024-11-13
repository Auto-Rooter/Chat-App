import { Server } from 'socket.io';

export interface Plugin {
    initialize(app: Express.Application, io: Server): void; 
}