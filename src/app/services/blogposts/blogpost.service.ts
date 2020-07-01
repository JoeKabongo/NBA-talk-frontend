import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { BlogArticle } from '../../models/blogArticle';
import { Comment } from '../../models/comment';
import { ApiEntry } from '../api-url';


@Injectable({
  providedIn: 'root'
})


export class BlogpostService {
  apiRoot = `${ApiEntry}/blogPost/`;

  commentsEmitter = new Subject<any> ();
  createdCommentEmitter = new Subject<any> ();
  constructor(private http: HttpClient, private authService: AuthService) { }

  handleError(error: HttpErrorResponse) {
    return throwError(error.error.message || 'Something went wrong!');
  }

  emitComments(comments) {
    this.commentsEmitter.next(comments);
  }

  emitCreatedComment(comment) {
    this.createdCommentEmitter.next(comment);
  }



  /* writer just created a new article*/
  createBlogPost(article: BlogArticle, image: File) {
    if (this.authService.isLoggedIn()) {
      const headers = new HttpHeaders({
         Authorization : 'Token ' + this.authService.getToken(),
      });
      const options = {
        headers
      };

      const formData: FormData = new FormData();
      formData.append('body', article.body);
      formData.append('title', article.title);

      if (article.isPublished) {
        formData.append('isPublished', 'true');
      } else {
        formData.append('isPublished', 'false');
      }
      formData.append('blurb', article.blurb);

      formData.append('coverImage', image, image.name);


      return this.http.post<any>(this.apiRoot + 'create', formData, options).catch(this.handleError);
    }
  }

  // save an article
  saveArticle(article: BlogArticle, image: File) {
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    const formData: FormData = new FormData();
    formData.append('id', article.id.toString());
    formData.append('body', article.body);
    formData.append('title', article.title);

    if (article.isPublished) {
      formData.append('isPublished', 'true');
    } else {
      formData.append('isPublished', 'false');
    }

    formData.append('blurb', article.blurb);

    if (image !== null && image !== undefined) {
      formData.append('coverImage', image, image.name);
    }

    return this.http.put<BlogArticle>(this.apiRoot + 'save', formData, options).catch(this.handleError);
  }

  /* get all blog articles*/
  getBlogArticles() {
    return this.http.get<BlogArticle[]>(this.apiRoot + 'all').catch(this.handleError);
  }

  /*
    get the last count articles
  */
  getRecentsPosts(count: number) {
    return this.http.get<BlogArticle[]>(this.apiRoot + 'recents/' + count).catch(this.handleError);
  }

  /*
    get a specific article by id
  */
  getBlogArticle(articleId) {
    if (this.authService.isLoggedIn()) {
      return this.http.get<any>(this.apiRoot + articleId + '/' + this.authService.getUsername())
            .catch(this.handleError);

    } else {
      return this.http.get<any>(this.apiRoot + articleId)
            .catch(this.handleError);
    }
  }

  /*
    Return all the blog article written by this author
  */
  getUserBlogs() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.get<BlogArticle[]>(this.apiRoot + 'dashboard/' + this.authService.getUsername(), options)
           .catch(this.handleError);
  }

  /*
    Publish an article
  */
  publishArticle(articleId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + 'publish/' + articleId, {}, options).catch(this.handleError);
  }

  /*
    unpublish an article
  */
  unpublishArticle(articleId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + 'unpublish/' + articleId, {}, options).catch(this.handleError);
  }



  deleteArticle(articleId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
       Authorization : 'Token ' + this.authService.getToken(),
    });

    const options = {
      headers
    };
    return this.http.delete<any>(this.apiRoot + 'delete/' + articleId, options).catch(this.handleError);
  }

  // save  comment
  saveComment(content: string, blogArticleId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    console.log(blogArticleId);
    return this.http.post<Comment>(this.apiRoot + 'save_comment', {content, blogArticleId}, options)
          .catch(this.handleError);
  }

  // edit a comment
  editComment(commentId: number, content: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<Comment>(this.apiRoot + 'edit_comment', {content, commentId}, options)
            .catch(this.handleError);
  }

  // delete a comment
  deleteComment(commentId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };

    return this.http.delete<any>(this.apiRoot + `delete_comment/${commentId}`, options)
              .catch(this.handleError);
  }

  saveLike(articleId, commentId, replyId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + 'save_like', {articleId, commentId, replyId}, options)
          .catch(this.handleError);
  }


  saveDislike(articleId, commentId, replyId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.put<any>(this.apiRoot + 'save_dislike', {articleId, commentId, replyId}, options)
          .catch(this.handleError);
  }

  deleteReaction(reactionId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
        Authorization : 'Token ' + this.authService.getToken(),
    });
    const options = {
      headers
    };
    return this.http.delete<any>(this.apiRoot + `delete_reaction/ ${reactionId}`, options)
          .catch(this.handleError);

  }
}
