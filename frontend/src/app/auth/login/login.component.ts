// frontend/src/app/auth/login/login.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  @ViewChild('usernameInput') usernameInput!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.usernameInput.nativeElement.focus();
  }

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/chat']),
      error: (error: any) =>
        (this.errorMessage = error?.error?.message || 'Invalid Credentials'),
    });
  }
}
