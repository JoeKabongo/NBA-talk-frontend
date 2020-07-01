import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';


import { AuthService } from '../../services/auth/auth.service';
import { Comment } from '../../models/comment';
import { DataType } from 'src/app/models/data-type';
import { Reply } from 'src/app/models/reply';
import { ApiEntry } from '../api-url';



@Injectable({
  providedIn: 'root'
})
export class CommentService {

  apiRoot = `${ApiEntry}/comment/`;

  savedCommentEmitter = new Subject<Comment> ();

  instanceCommentEmitter = new Subject<any []>();
  instanceTypeEmitter = new Subject <string>();
  instanceIdEmitter = new Subject <number>();

  constructor(private http: HttpClient, private authService: AuthService) { }

  emitInstanceId(dataId: number) {
    this.instanceIdEmitter.next(dataId);
  }
  emitInstanceType(type: string) {
    this.instanceTypeEmitter.next(type);
  }

  handleError(error: HttpErrorResponse) {
    console.log(error);
    return throwError(error.error.message || 'Something went wrong!');
  }

  /*
    Comments of a post
  */
  getPostComments(postId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    if (this.authService.isLoggedIn()) {
      this.http.get<Comment []>(this.apiRoot + `post_comments/${postId}/user_reactions`, options).subscribe(data => {
        this.instanceCommentEmitter.next(data);
        this.instanceIdEmitter.next(postId);
        this.instanceTypeEmitter.next(DataType.POST);

      });
    } else {
      this.http.get<Comment []>(this.apiRoot + `post_comments/${postId}`).subscribe(data => {
        this.instanceCommentEmitter.next(data);
        this.instanceIdEmitter.next(postId);
        this.instanceTypeEmitter.next(DataType.POST);

      });
    }

  }
  /*
    Comments of an article
  */
  getArticleComments(articleId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    if (this.authService.isLoggedIn()) {
      this.http.get<Comment []>(this.apiRoot + `article_comments/${articleId}/user_reactions`, options).subscribe(data => {
        this.instanceCommentEmitter.next(data);
        this.instanceIdEmitter.next(articleId);
        this.instanceTypeEmitter.next(DataType.ARTICLE);

      });
    } else {
      this.http.get<Comment []>(this.apiRoot + `article_comments/${articleId}`).subscribe(data => {
        this.instanceCommentEmitter.next(data);
        this.instanceIdEmitter.next(articleId);
        this.instanceTypeEmitter.next(DataType.ARTICLE);

      });
    }

  }

  /*
    Save an article
  */
  saveComment(content: string, articleId: number, postId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    const data = {
      content,
      articleId,
      postId
    };

    return this.http.post<Comment>(this.apiRoot + 'save_comment', data, options);
  }

  emitSavedComment(comment: Comment) {
    this.savedCommentEmitter.next(comment);
  }

  deleteComment(commentId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    return this.http.delete<any>(this.apiRoot + `delete_comment/${commentId}`, options);
  }

  editComment(commentId: number, content: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    return this.http.put<any>(this.apiRoot + `edit_comment/${commentId}`,  {content}, options);
  }

  likeComment(articleId: number, postId: number, commentId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + `like_comment/${articleId}/${postId}/${commentId}`, {}, options)
              .catch(this.handleError);
  }

  dislikeComment(articleId: number, postId: number, commentId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + `dislike_comment/${articleId}/${postId}/${commentId}`, {}, options);
  }


  saveReply(articleId: number, postId: number, commentId: number, content: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.post<Reply>(this.apiRoot + `save_reply/${articleId}/${postId}/${commentId}`, {content}, options);

  }

  editReply(replyId: number, commentId, content: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<Reply>(this.apiRoot + `edit_reply/${replyId}`, {content, commentId}, options);

  }

  deleteReply(replyId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.delete<any>(this.apiRoot + `delete_reply/${replyId}`, options);
  }

  /*
    Get replies associated with a comment
  */
  getCommentReplies(commentId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    if (this.authService.isLoggedIn()) {
        return this.http.get<any[]>(this.apiRoot + `replies/${commentId}/user_reactions`, options);
    } else {
      return this.http.get<any[]>(this.apiRoot + `replies/${commentId}`);
    }
  }

  likeReply(commentId: number, replyId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + `like_reply/${commentId}/${replyId}`, {}, options);

  }

  dislikeReply(commentId: number, replyId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + `dislike_reply/${commentId}/${replyId}`, {}, options);

  }

  deleteReaction(reactionId: number) {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.delete<any>(this.apiRoot + `delete_reaction/${reactionId}`,  options);
  }

}
