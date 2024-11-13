import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Message } from '../models/message.model';
import { MessageService } from '../services/message.service';
import { SocketService } from '../services/socket.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  typingUsers: string[] = [];
  currentUser: User | null = null;

  private typingUsersSubscription!: Subscription;
  private userSubscription!: Subscription;
  private messagesSubscription!: Subscription;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.messageService.getAllMessages();
    // Subscribe to messages from MessageService
    this.messagesSubscription = this.messageService.messages$.subscribe((messages) => {
      this.messages = messages;
      this.scrollToBottom();
    });
    // Subscribe to typing users
    this.typingUsersSubscription = this.socketService.typingUsers$.subscribe(
      (users) => {
        this.typingUsers = users;
      }
    );

    // Subscribe to current user
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.typingUsersSubscription) {
      this.typingUsersSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  logout() {
    this.authService.logout();
    this.socketService.disconnectSocket();
    this.router.navigate(['/login']); // Redirect to Login page
  }
}
