import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Message } from '../models/message.model';
import { AuthService } from '../auth/auth.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket!: Socket;

  // Subjects to emit messages and typing statuses
  private newMessageSubject = new BehaviorSubject<Message | null>(null);
  public newMessage$ = this.newMessageSubject.asObservable();

  private messageStatusSubject = new BehaviorSubject<{ id: string; status: string } | null>(null);
  public messageStatus$ = this.messageStatusSubject.asObservable();

  private typingUsersSubject = new BehaviorSubject<string[]>([]);
  public typingUsers$ = this.typingUsersSubject.asObservable();

  // Subscriptions to manage observables
  private authSubscription!: Subscription;
  private tokenSubscription!: Subscription;

  private messages: Message[] = [];

  constructor(private authService: AuthService) {
    // Subscribe to authentication status changes
    this.authSubscription = this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.connectSocket();
      } else {
        this.disconnectSocket();
      }
    });

    // Subscribe to token changes to handle token refreshes
    this.tokenSubscription = this.authService.token$.subscribe((token) => {
      if (this.socket && this.socket.connected) {
        // Update the auth token and reconnect
        (this.socket.auth as any).token = token;
        this.socket.disconnect().connect();
      }
    });
  }

  /**
   * Establishes a Socket.IO connection using the current access token.
   */
  private connectSocket(): void {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Cannot connect to Socket.IO: No access token found.');
      return;
    }

    // Initialize Socket.IO connection
    this.socket = io(environment.serverUrl, {
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        token,
      },
    });

    // Connection established
    this.socket.on('connect', () => {
      console.log('Connected to the server via Socket.IO');
    });

    // Handle connection errors
    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Listen for new messages from the server
    this.socket.on('message', (message: Message) => {
      console.log("[Socket.IO] Received new message:", JSON.stringify(message));
      this.addOrUpdateMessage(message);
    });

    // Listen for message status updates (e.g., 'sent', 'received')
    this.socket.on('messageStatus', (data: { id: string; status: string }) => {
      console.log("[Socket.IO] Received message status update:", JSON.stringify(data));
      this.updateMessageStatus(data.id, data.status as Message['status']);
    });

    // Handle typing indicators
    this.socket.on('userTyping', (data: { username: string }) => {
      const currentTypingUsers = this.typingUsersSubject.value;
      if (!currentTypingUsers.includes(data.username)) {
        this.typingUsersSubject.next([...currentTypingUsers, data.username]);
      }
    });
    this.socket.on('userStopTyping', (data: { username: string }) => {
      const updatedTypingUsers = this.typingUsersSubject.value.filter(
        (user) => user !== data.username
      );
      this.typingUsersSubject.next(updatedTypingUsers);
    });
  }

  /**
   * Sends a message to the server via Socket.IO.
   * @param messageText The text content of the message.
   * @param user The username of the sender.
   */
  sendMessage(messageText: string, user: string): void {
    const messageId = this.generateUniqueId();
    const message: Message = {
      id: messageId,
      text: messageText,
      user: user,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    // Emit the message to the server
    this.socket.emit('sendMessage', message);

    // Optimistically add the message to the local list
    this.addOrUpdateMessage(message);
  }

  /**
   * Update message status in the current messages list.
   * @param id The id of the message.
   * @param status The status of the message.
   */
  private updateMessageStatus(id: string, status: Message['status']): void {
    const index = this.messages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      this.messages[index].status = status;
      this.newMessageSubject.next(this.messages[index]);
    }
  }

    /**
   * Update or add a message.
   * @param id The id of the message.
   * @param status The status of the message.
   */
  private addOrUpdateMessage(message: Message): void {
    const index = this.messages.findIndex((msg) => msg.id === message.id);
    if (index !== -1) {
      // Update existing message
      this.messages[index] = message;
    } else {
      // Add new message
      this.messages.push(message);
      if(message.status === 'received'){
        this.socket.emit('messageReceived', message);
      }
    }

    // Emit the updated message
    this.newMessageSubject.next(message);
  }

  /**
   * Generates a unique alphanumeric ID for messages.
   * @param length The length of the ID string.
   * @returns A unique alphanumeric string.
   */
  private generateUniqueId(length: number = 16): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % charsLength];
    }
    return result;
  }

  /**
   * Emits typing indicators to the server.
   */
  startTyping(): void {
    this.socket.emit('typing');
  }

  /**
   * Emits stop typing indicators to the server.
   */
  stopTyping(): void {
    this.socket.emit('stopTyping');
  }

  /**
   * Disconnects the Socket.IO connection.
   */
  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Disconnected from the server via Socket.IO');
    }
  }

  /**
   * Cleans up subscriptions and disconnects the socket when the service is destroyed.
   */
  ngOnDestroy(): void {
    this.disconnectSocket();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
  }
}
