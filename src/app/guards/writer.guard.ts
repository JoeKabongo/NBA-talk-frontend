import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class WriterGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

   // guard certain url based on if the user is logged in or not
   canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isUserWriter()) {
        return true;
    }

    this.router.navigate(['/']);
    // you can save redirect url so after authing we can move them back to the page they requested
    return false;
  }

}
