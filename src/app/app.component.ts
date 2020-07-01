import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { PostService } from './services/posts/post.service';
import { Post } from './models/post';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  countCharacters: number;
  MAXIMUM_POST_LENGTH: number;
  count: number;
  counterColor: string;


  creating: boolean; // check if we are creating or deleting a post

  createdPostId: number;
  postToEdit: Post;
  newPostContent: string;


  constructor(private postService: PostService, private route: Router) {
    document.addEventListener('click', (event) => this.onClick(event));
  }

  // remove all the current drop
  onClick(event: MouseEvent ) {

    const target = event.target as HTMLElement;
    // if (!target.classList.contains('fa-ellipsis-h')) {
    //   const m = document.querySelectorAll('.visible-drop-down');
    //   m.forEach(element => {
    //       const html = element as HTMLElement;
    //       html.style.display = 'none';
    //   });
    // }

    // hide the drop-down navbar when the user click anywhere
    if (target.id !== 'drop-down-button-nav') {
      const navbar = document.querySelector('#drop-down-navbar') as HTMLElement;
      navbar.style.display = 'none';
    }
  }

  ngOnInit() {
    this.newPostContent = '';

    this.MAXIMUM_POST_LENGTH = 1000;

    // show window where user can write a post
    this.postService.showCreatePostWindown.subscribe(
      data => {
        this.showCreatePostWindow();
        this.creating = true;
      }
    );

        // const createdPostElement = document.querySelector('#message-post-created') as HTMLElement;
        // createdPostElement.style.display = 'inline-block';
        // setTimeout(() => {
        //   createdPostElement.style.display = 'none';
        // }, 3000);


    // show window where the user can edit their post
    this.postService.showEditPostWindown.subscribe(
      data => {
        this.postToEdit = data;
        this.newPostContent = data.content;
        this.creating = false;
        this.showCreatePostWindow();
        this.countCharacters = this.MAXIMUM_POST_LENGTH - this.newPostContent.trim().length;

      }
      );

    this.countCharacters = this.MAXIMUM_POST_LENGTH;

  }

  ngOnDestroy() {
    try {
      this.postService.postCreatedMessage.unsubscribe();
    } catch {}

  }

  showCreatePostWindow() {
    const cover = document.querySelector('#cover') as HTMLElement;
    const postWindow = document.querySelector('#create-post-window') as HTMLElement;
    cover.style.display = 'block';
    postWindow.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  hideCreatePostWindow() {
    const cover = document.querySelector('#cover') as HTMLElement;
    const postWindow = document.querySelector('#create-post-window') as HTMLElement;
    cover.style.display = 'none';
    postWindow.style.display = 'none';
    this.newPostContent = '';
    this.countCharacters = this.MAXIMUM_POST_LENGTH;
    document.body.style.overflow = 'scroll';

  }

  createPost() {
    this.postService.createPost(this.newPostContent)
      .subscribe(data => {
          this.createdPostId = data.id;
          const createdPostElement = document.querySelector('#message-post-created') as HTMLElement;
          createdPostElement.style.display = 'inline-block';
          setTimeout(() => {
            createdPostElement.style.display = 'none';
          }, 3000);
      });
    this.hideCreatePostWindow();
    this.newPostContent = '';
  }

  editPost() {
    this.postService.editPost(this.postToEdit.id, this.newPostContent).subscribe(
      data => {
          this.postService.emitEditedPost(data);
      }, error => {
          this.postService.emitErrorMessage(error);
      }
    );

    this.hideCreatePostWindow();

    this.newPostContent = '';
  }

  showMessageCreatedPost() {

  }


  // count number of characters in post field  and update when user type
  updateCount() {
    this.countCharacters = this.MAXIMUM_POST_LENGTH - this.newPostContent.trim().length;
    if (this.countCharacters >= 0) {
      this.counterColor = '#00ff00';
    } else {
      this.counterColor = '#ff0000';
    }
  }


}
