import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  usernameOrEmail = '';
  password = '';
  errorMessages = [];

  alertTitle: string;
  alertContent: string[];

  navbar: HTMLElement;
  darkBackGround: HTMLElement;
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

    document.title = 'TheNBATalk | Login';
    this.darkBackGround = document.querySelector('#cover') as HTMLElement;
    this.darkBackGround.style.display = 'block';
  }

  loginUser() {
    this.authService.loginUser(this.usernameOrEmail, this.password)
      .subscribe(data => {
        if (data.success) {
          this.authService.saveUserDetails(data.username, data.token, String(data.isWriter));
          this.router.navigate(['/profile/' + data.username]);
        } else {
          // iterate over all the error message and display them
          const keys = Object.keys(data);
          this.alertContent = [];
          this.alertTitle = 'Login Fail';
          keys.forEach(element => {
            const keyErrorMessage = data[element];
            keyErrorMessage.forEach(response => {
               this.alertContent.push(response.charAt(0).toUpperCase() + response.slice(1));
            });
          });
        }
      },
        error => {
          // display error message wrong backend
          this.alertTitle = 'Login Fail';
          this.alertContent = [];
          this.alertContent.push(error.error.error);

        }
      );
  }

  goHomePage() {
    this.router.navigate(['/']);
  }

  removeErrorMessages() {
    this.alertContent = [];
  }

  ngOnDestroy() {
    this.darkBackGround.style.display = 'none';

  }


}
