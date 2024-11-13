import {Request, Response, NextFunction} from 'express';
import {io} from '../index';
import {messages} from '../data/messages';
import {AppError} from '../utils/AppError';

export const getMessages = (req: Request, res: Response, next: NextFunction): void => {
    try{
        const currentUser = (req as any).user.username;
        if (!currentUser) {
            return next(AppError.authenticationError('User not authenticated'));
        }
        const messagesUpdated = messages.map((message)=>{
            if(message.user !== currentUser){
                message.status = 'received';
                return { ...message, status: 'received' };
            }else{
                return message;
            }
        });
        res.status(200).json({messages: messagesUpdated});
    }catch(error){
        next(error);
    }
};


export const addMessage = (req: Request, res: Response, next: NextFunction): void => {
    try{
        const {text, user, id} = req.body;
        if(!text || !user || !id){
            return next(AppError.validationError("Message text and user are required fields"));
        }
        const newMessage = {id, text, user, status: 'sent', timestamp: new Date().toISOString()};
        messages.push(newMessage);
        // emit the new message to all connected clients
        io.emit('newMessage', { ...newMessage, status: 'received' });
        res.status(200).json({message: 'Message sent successfully', messages});
    }catch(error){
        next(error);
    }
}