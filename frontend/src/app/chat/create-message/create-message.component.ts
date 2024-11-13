import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-create-message',
  templateUrl: './create-message.component.html',
  styleUrls: ['./create-message.component.css'],
})
export class CreateMessageComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userDataSubscription!: Subscription;
  messageText: string = '';

  private typingTimeout!: any;

  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.userDataSubscription = this.authService.user$.subscribe((userData) => {
      this.user = userData;
    });
  }

  sendMessage() {
    if (this.messageText.trim()) {
      this.socketService.sendMessage(
        this.messageText,
        this.user?.username || 'Unknown'
      );
      this.messageText = '';
      this.socketService.stopTyping();
    }
  }

  onTextChange() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    } else {
      this.socketService.startTyping();
    }

    this.typingTimeout = setTimeout(() => {
      this.socketService.stopTyping();
      this.typingTimeout = null;
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }
}
