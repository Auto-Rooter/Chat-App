import {Injectable} from '@angular/core';
import {HttpClient, HttpBackend} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import { jwtDecode } from "jwt-decode";
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthService {
  private apiUrl = `${environment.serverUrl}/auth`;
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public token$ = this.tokenSubject.asObservable();
  private userSubject = new BehaviorSubject<any | null>(null);

  isLoggedIn$: Observable<boolean> = this.tokenSubject.asObservable().pipe(map(token => !!token));
  user$ = this.userSubject.asObservable();
  private http: HttpClient;

  constructor(private httpBackend: HttpBackend){
    this.http = new HttpClient(httpBackend);
    const token = localStorage.getItem('token');
    if(token !== null && token !== 'undefined'){
      this.decodeAndStoreUser(token);
    }
  }

  login(username: string, password: string): Observable<{accessToken: string}>{
    return this.http.post<{accessToken: string}>(`${this.apiUrl}/login`, {username, password},{ withCredentials: true }).pipe(
      tap(response =>{
        localStorage.setItem('token', response.accessToken);
        this.tokenSubject.next(response.accessToken);
        this.decodeAndStoreUser(response.accessToken);
      })
    );
  }

  refreshToken(): Observable<{accessToken: string}> {
    return this.http.post<{accessToken: string}>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => {
        localStorage.setItem('token', response.accessToken);
        this.tokenSubject.next(response.accessToken);
        this.decodeAndStoreUser(response.accessToken);
      })
    );
  }

  logout(): void{
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe(()=>{
      localStorage.removeItem('token');
      this.tokenSubject.next(null);
      this.userSubject.next(null);
    });
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private decodeAndStoreUser(token: string): void {
    try {
      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        this.logout();
      } else {
        const user: any = { username: decoded.username, role: decoded.role };
        this.userSubject.next(user);
      }
    } catch (error) {
      console.error('Failed to decode token', error);
    }
  }
}
