export interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'received';
}
