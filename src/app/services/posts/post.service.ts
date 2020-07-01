import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { Post } from '../../models/post';
import { Reply } from '../../models/reply';
import { Observable, Subject, throwError } from 'rxjs';
import { Identifiers } from '@angular/compiler';
import { ApiEntry } from '../api-url';




@Injectable({
  providedIn: 'root'
})
export class PostService {

  apiRoot = `${ApiEntry}/post/`;

  // responsible for showing post window by communicating with app component
  showCreatePostWindown = new Subject<string>();
  showEditPostWindown = new Subject<Post>();

  // emit edited or created post
  editedPost = new Subject<Post> ();
  createdPost = new Subject<Post>();
  postCreatedMessage = new Subject<number>();

  // emit erro
  errorEmittor = new Subject<string>();
  showPostbtn = new Subject<boolean>();

  constructor(private http: HttpClient, private authService: AuthService) { }

  // make sure the user is logged in before making a post
  createPost(content: string) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };
      return this.http.post<any>(this.apiRoot + 'save', {content}, options);
    }
  }

  // delete a post
  deletePost(postId: number) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };
      return this.http.delete<any>(this.apiRoot + `delete_post/${postId}`, options)
             .catch(this.handleError);
    }
  }


  handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError('The post was not found');
    }
    return throwError(error.error.message || 'Something went wrong!');
  }

  // edit a post content
  editPost(postId: number, postContent: string) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };
      return this.http.put<any>(this.apiRoot + `edit_post` , {postId, postContent}, options)
            .catch(this.handleError);
    }
  }

  getPosts() {
    if (this.authService.isLoggedIn()) {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization : 'Token ' + this.authService.getToken(),
        });
        const options = {
          headers
        };
        return this.http.get<any>(this.apiRoot + 'posts_user_reactions', options);

    } else {
      return this.http.get<any>(this.apiRoot + 'posts');
    }
  }


  // return detail for a spefic post
  getPostDetail(id: number) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };
      return this.http.get<any>(this.apiRoot + id + '/' + this.authService.getUsername(), options)
            .catch(this.handleError);
    } else {
      return this.http.get<any>(this.apiRoot  + id)
            .catch(this.handleError);
    }

  }

  // get comments for a post
  getCommentPost(postId: number) {
   return this.http.get<any>(this.apiRoot +  postId  + '/comments/');
  }

  // save likes back to the server
  likePost(postId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });

    const options = {
      headers
    };

    // check if reaction is for a post, comment or reply
    return this.http.put<any>(this.apiRoot + `like_post/${postId}`, {}, options);

  }

  // save a dislike back to the server
  dislikePost(postId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });

    const options = {
      headers
    };

    // check if reaction is for a post, comment or reply
    return this.http.put<any>(this.apiRoot + `dislike_post/${postId}`, {}, options);

  }

  // remove a like or a dislike
  removeReaction(reactionId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });

    const options = {
      headers
    };
    return this.http.delete<any>(this.apiRoot + 'remove_reaction/' + `${reactionId}`, options);
  }

  // show the windown for creating a post. Sending subject to the app component
  showPostWindow() {
    this.showCreatePostWindown.next('yess');
  }

  // emit the new created post a component that subscribed to it
  emitCreatedPost(post: Post) {
    this.createdPost.next(post);
  }

  // this is when a user write a post outside of the home page or his own profile.
  // Prompt a window to see if user wants to go to the post page
  emitMessagePostCreated(id: number) {
    this.postCreatedMessage.next(id);
  }

  // emit the edited post to a componenent that subscribed to it
  emitEditedPost(post: Post) {
    this.editedPost.next(post);
  }



  // show the edit post window
  showEditWindow(post: Post) {
    this.showEditPostWindown.next(post);
  }


  emitErrorMessage(error: string) {
    this.errorEmittor.next(error);
  }

  showPostButton(show: boolean) {
    this.showPostbtn.next(show);
  }

}
