import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CanActivate, Router } from '@angular/router';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [AuthService]
})
export class SignupComponent implements OnInit, OnDestroy {

  submitted = false;
  username = '';
  emailaddress: '';
  password: '' ;
  confirmPassword: '';
  bio: '';
  errorMessages = [];

  alertTitle: string;
  alertContent: string [];

  navbar: HTMLElement;
  darkBackGround: HTMLElement;
  constructor(private authservice: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authservice.isLoggedIn()) {
        this.router.navigate(['/profile/' + this.authservice.getUsername()]);
    }
    document.title = 'TheNBATalk | Signup';
    this.darkBackGround = document.querySelector('#cover') as HTMLElement;

    this.darkBackGround.style.display = 'block';


  }
  createUser() {
    this.authservice.createUser(this.username, this.emailaddress, this.password, this.bio)
        .subscribe(data => {
          if (data.success) {
            this.authservice.saveUserDetails(data.username, data.token, 'false');
            this.router.navigate(['/profile/' + data.username]);
          } else {
            // iterate over all the error message and display them
            const keys = Object.keys(data);
            this.alertContent = [];
            this.alertTitle = 'Failed Signing up';
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
            this.alertTitle = 'Something went wrong';
            this.alertContent = [];
            this.alertContent.push(error.error.error);

          }
        );
    }


  /* hide error message when user closes it*/
  removeErrorMessage() {
    this.alertContent = [];
  }

  goHomePage() {
    this.router.navigate(['/']);
  }



  ngOnDestroy() {
    this.darkBackGround.style.display = 'none';

  }


}
