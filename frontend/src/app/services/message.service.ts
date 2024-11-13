import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message.model';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = environment.serverUrl;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient, private socketService: SocketService) {
    // Listen to new messages from Socket.IO
    this.socketService.newMessage$.subscribe((newMessage) => {
      if (newMessage) {
        this.addOrUpdateMessage(newMessage);
      }
    });
    // Subscribe to message status updates
    this.socketService.messageStatus$.subscribe((statusUpdate) => {
      if (statusUpdate) {
        this.updateMessageStatus(statusUpdate.id, statusUpdate.status as Message['status']);
      }
    });
  }

  // Fetch messages from the backend
  getAllMessages(): void {
    this.http.get<{messages: Message[]}>(`${this.apiUrl}/messages`).subscribe(
      (data) => {
        const messages = data.messages;
        // Initialize the message list
        messages.forEach((message) => this.addOrUpdateMessage(message));
        this.messagesSubject.next(messages);
      },
      (error) => {
        console.error('Failed to fetch messages:', error);
      }
    );
  }

  private addOrUpdateMessage(message: Message): void {
    const messages = this.messagesSubject.value;
    const index = messages.findIndex((msg) => msg.id === message.id);

    if (index !== -1) {
      // Update existing message
      messages[index] = { ...messages[index], ...message };
    } else {
      // Add new message
      messages.push(message);
    }
    this.messagesSubject.next([...messages]);
  }


  private updateMessageStatus(id: string, status: Message['status']): void {
    const messages = this.messagesSubject.value;
    const index = messages.findIndex((msg) => msg.id === id);

    if (index !== -1) {
      messages[index].status = status;
      this.messagesSubject.next([...messages]);
    }
  }
}
