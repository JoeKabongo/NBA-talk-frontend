import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { PostService } from 'src/app/services/posts/post.service';
import { Observable, Subject } from 'rxjs';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService, private userProfile: UserProfileService,
              private router: Router, private postService: PostService) { }

  username: string;
  showPostButton: boolean;
  goHomeEmitter = new Subject<string>();

  ngOnInit() {
    this.username = this.authService.getUsername();

    // keep tracks of logged in username for the link in the url
    this.authService.usernameEmitter.subscribe((data) => {
      this.username = data;
    });

    this.postService.showPostbtn.subscribe(data => this.showPostButton = data);

  }

  goHome() {
    this.goHomeEmitter.next('whatever');
  }
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  userWriter() {
    return this.authService.isUserWriter();
  }

  logout() {
    this.authService.logout();
  }
  showPostWindow() {
    this.postService.showPostWindow();
  }
  showOrHideDropDown() {
    const element = document.querySelector('#drop-down-navbar') as HTMLElement;
    if (element.style.display === 'inline-block') {
      element.style.display = 'none';
    } else {
      element.style.display = 'inline-block';
    }
  }
  goToWriteArticle() {
    this.router.navigate(['blog/new']);
  }

}
