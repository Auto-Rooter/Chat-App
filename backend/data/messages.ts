import { Message } from '../models/message.model';

export const messages: Message[] = [
    {
        id: '121213123421',
        text: "Hello!",
        user: "Alice",
        timestamp: new Date().toISOString(),
        status: 'sent'
      },
      {
        id: '121213123423',
        text: "Hi there!",
        user: "Bob",
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
];