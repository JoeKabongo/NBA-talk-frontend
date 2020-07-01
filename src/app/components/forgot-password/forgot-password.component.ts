import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  email: string;
  passCode: string;

  newPassword: string;
  newPasswordConfirmation: string;

  errorMessage: string;
  showError: boolean;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

    // if the user is currently logged in, they should not be here, so redirect them to the homepage
    if (this.authService.isLoggedIn()) {
        this.router.navigate(['/']);
    }
    this.showError = false;

    document.title = 'TheNBATalk | Recover account';
    const darkBackGround = document.querySelector('#cover') as HTMLElement;
    darkBackGround.style.display = 'block';

    this.email = '';
    this.passCode = '';
    this.newPassword = '';
    this.newPasswordConfirmation = '';
  }
  ngOnDestroy() {
    const darkBackGround = document.querySelector('#cover') as HTMLElement;
    darkBackGround.style.display = 'none';
  }

  /*
    when user enter their email to recover their password
    if their no email matched an account, let them know,
    else prompt them to type code they received in their emails
  */
  findUserAccount() {
    this.authService.recoverUserPassword(this.email).subscribe(
      data => {
       const enterEmail = document.querySelector('#enter-email') as HTMLElement;
       enterEmail.style.display = 'none';

       const enterPasscode = document.querySelector('#enter-code') as HTMLElement;
       enterPasscode.style.display = 'block';

    }, error => {
        this.errorMessage = error;
        this.showErrorMessage();
    });
  }


  /*
    Check that the code the user entered matched the code send in the email
  */
  confirmCode() {
    this.authService.confirmUserCode(this.passCode, this.email).subscribe(
      data => {
        const enterEmail = document.querySelector('#enter-code') as HTMLElement;
        enterEmail.style.display = 'none';

        const enterPasscode = document.querySelector('#update-password') as HTMLElement;
        enterPasscode.style.display = 'block';
      }, error => {
          this.errorMessage = error;
          this.showErrorMessage();
      }
    );
  }

  /*
    Here the user reset their password
  */
  resetPassword() {
    this.authService.resetUserPassword(this.email, this.newPassword).subscribe(
      data => {
        this.authService.saveUserDetails(data.username, data.token, String(data.isWriter));
        this.router.navigate(['/profile', data.username]);
      }, error => {
        this.errorMessage = error;
        this.showErrorMessage();
      }
    );
  }

  showErrorMessage() {
    this.showError = true;
  }
  hideErrorMessage() {
    this.showError = false;
  }
}
