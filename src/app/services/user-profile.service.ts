import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CanActivate, Router } from '@angular/router';
import {Subject, Observable, throwError} from 'rxjs';
import { UserInfo } from '../models/user';
import { AuthService } from './auth/auth.service';
import { ApiEntry } from './api-url';
import 'rxjs/add/operator/catch';





@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  apiRoot = `${ApiEntry}/account/`;
  userProfile = new Subject<UserInfo>();
  constructor(private http: HttpClient, private authService: AuthService) { }

  getProfile(username: string) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };

      return this.http.get<any>(this.apiRoot + username + '/user_reactions', options)
            .catch(this.errorHandler);
    } else {

      return this.http.get<any>(this.apiRoot + username)
          .catch(this.errorHandler);
    }
  }
  errorHandler(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError('User with that username was not found');
    }
    return throwError(error.message || 'Something went wrong!');
  }


  getLoggedInUserProfile() {
    this.http.get<any>(this.apiRoot + this.authService.getUsername())
    .subscribe(data => {
      this.userProfile.next(data);
    });
  }

  updateProfile(username: string, email: string, bio: string, file: File) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
        // 'Content-Type': 'application/json',
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };
      const formData: FormData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('bio', bio);

      if (file != null) {
        formData.append('profileImage', file);
      }


      return this.http.put<any>(this.apiRoot + 'update', formData, options);
    }
  }
}
