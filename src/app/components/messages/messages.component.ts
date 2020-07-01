import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { PostService } from 'src/app/services/posts/post.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService, private router: Router, private postService: PostService) { }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      alert('You must login');
      this.router.navigate(['/login']);
    }
    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'block';
    this.postService.showPostButton(false);

  }

  ngOnDestroy() {
    this.closeMessage();
  }
  closeMessage() {
    try {
      const cover = document.querySelector('#cover') as HTMLElement;
      cover.style.display = 'none';

      const msg = document.querySelector('#working-on-it') as HTMLElement;
      msg.style.display = 'none';
    } catch {}

  }

}
