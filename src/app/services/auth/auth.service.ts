import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { CanActivate, Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { ApiEntry } from '../api-url';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiRoot = `${ApiEntry}/account/`;
  usernameEmitter = new Subject<string>();
  isWriter: boolean;
  isAdmin: boolean;

  constructor(private http: HttpClient, private router: Router) { }

  /* Save user details aka token and username for later reference */
  saveUserDetails(username: string, token: string, isWriter) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('isWriter', isWriter);

    this.usernameEmitter.next(username); /* Emit username, this is for the navbar  */
  }

  saveUsername(username: string) {
    localStorage.setItem('username', username);
  }


  isLoggedIn() {
    return localStorage.getItem('token') != null;
  }

  isUserWriter() {
    return localStorage.getItem('isWriter') === 'true';
  }

  getUsername() {
    return localStorage.getItem('username');
  }


  getToken() {
    return localStorage.getItem('token');
  }

  /* Save user info */
  createUser(username: string, email: string, password: string, bio: string): Observable<any> {
      return this.http.post<any>(this.apiRoot + 'register', {username, email, password, bio});
  }

  loginUser(usernameOrEmail: string, password: string) {
    return this.http.post<any>(this.apiRoot + 'login', {usernameOrEmail, password});
  }

  recoverUserPassword(userEmail: string) {
    return this.http.post<any>(this.apiRoot + 'request_password_update', {userEmail})
          .catch(this.errorHandler);
  }

  errorHandler(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError('User with that email was not found');
    }
    console.log(error);
    return throwError(error.error.message || 'Something went wrong!');
  }

  confirmUserCode(passcode: string, userEmail: string) {
    return this.http.post<any>(this.apiRoot + 'confirm_user_passcode', {passcode, userEmail})
          .catch(this.errorHandler);

  }
  resetUserPassword(email: string, newPassword: string) {
    return this.http.put<any>(this.apiRoot + 'reset_password', {email, newPassword})
          .catch(this.errorHandler);
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isWriter');

    this.router.navigate(['/login']);
  }


}
