import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from 'src/app/models/post';
import { Reply } from 'src/app/models/reply';
import { Reaction } from 'src/app/models/reaction';

import { PostService } from 'src/app/services/posts/post.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommentService } from 'src/app/services/comments/comment.service';


@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
   constructor(private postService: PostService, private commentService: CommentService, private route: ActivatedRoute,
               private timeService: TimeConversionService, private router: Router, private authService: AuthService) { }

    currentPost: Post;
    postContent: string;  // content of post

    comments: any[]; // list containting all the comments
    commentReplies; // maps commentId  to their containing replies

    userReactionId: number; // remember the id of the user reaction to the post, in order to delete it in the backend
    repliesReaction: Map<number, Reaction>; // maps comment id and with user reaction

    newComment: string;

    countCommentLenght: number; // count the lenght of a comment, when creating comment
    countCommentLenghtOnEdit: Map<number, number>; // count lenght of each comment when editing;
    MAX_LENGHT_COMMENT: number; // maximum lenght of a comment

    isLoggedIn: boolean; // check if user is logged in
    currentUserName: string; // currently logged in user, if there is any
    errorMessage: string;  // error message
    errorBoxTitle: string; // title of the error box

    parentElementId: number;
    selectedElementType: string;  // distinguish between deleteing a post, comment or reply
    selectedElementDiv: HTMLElement; // know the place of the instance to delete in the DOM(for reply and )
    selectedElementId: number; // know the id of the instance we are deleting


    ngOnInit() {

      // this is when the user created this post in a part of the app where you cannot see posts
      // then the click on the pop up window to see their post, hide that small window
      const createdPostElement = document.querySelector('#message-post-created') as HTMLElement;
      createdPostElement.style.display = 'none';

      this.MAX_LENGHT_COMMENT = 1000;
      this.countCommentLenght = 1000;
      this.commentReplies = {}; // maps commentId to array containing replies
      this.isLoggedIn = this.authService.isLoggedIn();
      this.repliesReaction = new Map();
      this.currentUserName = this.authService.getUsername();
      this.newComment = ''; // for adding new comment


      // listen to when the user is going to a different post, updat our contain
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.getPostDetail(this.route.snapshot.paramMap.get('postId'));
      });

      // when new post is created,redirect to that post page
      this.postService.createdPost.subscribe(data => {
        this.router.navigate([ 'post', data.id]);
        this.getPostDetail(data.id.toString());
      });

      // when post is edited, update its info
      this.postService.editedPost.subscribe(post => {
        this.currentPost = post;
        this.currentPost.time = this.formatTime(this.currentPost.time);
      });
    }

    /*
      Get data about our post from the backend
      Response frm the backend come into the form [post, user_reaction]
      If there is an error, just redirect the user to the home page
    */
    getPostDetail(postId: string) {
        // tslint:disable-next-line: radix
        this.postService.getPostDetail(parseInt(postId)).subscribe(
          response => {
            this.currentPost = response[0];

            this.userReactionId = response[1];
            this.postContent = this.currentPost.content;
            document.title = this.currentPost.username + ' | Post ';
            this.currentPost.time = this.timeService.format_time(new Date(this.currentPost.time));

            this.commentService.getPostComments(this.currentPost.id);
          },
          error => {
            this.router.navigate(['/']);
          }
        );
    }

    /*
      The author of the post decide to delete the post
    */
    deletePost() {
      this.postService.deletePost(this.currentPost.id).subscribe(
        data => {
            this.router.navigate(['/']);
        },
        error => {
          alert('something went wrong');
        }
      );
    }

    /*
      The currently logged in user like the post,
      save their reaction and update the likes/dislikes count and the reaction status
    */
    likePost() {
      if (this.authService.isLoggedIn()) {
        this.postService.likePost(this.currentPost.id).subscribe(
          data => {
            this.userReactionId = data.id;
            this.currentPost.isLiked = true;
            this.currentPost.likes ++;
            if (this.currentPost.isDisliked) {
              this.currentPost.dislikes --;
            }
            this.currentPost.isDisliked = false;
          },
          error => {
            console.log(error);
          }
        );
      } else {
        alert('you must login first');
      }
    }

    /*
      The currently logged in user dislike the post,
      save their reaction and update the likes/dislikes count and the reaction status
    */
    dislikePost() {
      if (this.authService.isLoggedIn()) {
        this.postService.dislikePost(this.currentPost.id).subscribe(
          data => {
            this.userReactionId = data.id;
            this.currentPost.isDisliked = true;
            this.currentPost.dislikes ++;

            if (this.currentPost.isLiked) {
              this.currentPost.likes --;
            }
            this.currentPost.isLiked = false;
          },
          error => {
            console.log(error);
          }
        );
      } else {
        alert('must login first');
      }
    }

    /*
      When the user undo their like or their dislikes,update the status of the reaction and the likes/dislikes count
    */
    removeReaction() {
      this.postService.removeReaction(this.userReactionId).subscribe(
        data => {
            if (this.currentPost.isDisliked) {
                this.currentPost.dislikes --;
            } else {
                this.currentPost.likes --;
            }

            this.currentPost.isDisliked = false;
            this.currentPost.isLiked = false;
        },
        error => {
          console.log(error);
        }
      );
    }

    /*
      Save the comment typed by the user inside the user field if and only if the comment is valid
      valid comment: the content of the comment is not empty and it does not exceed the comment lenght limit
    */
    saveComment() {

      // make sure the user have type something and that the lenght does not exceed the limit
      if (this.countCommentLenght >= 0 && this.countCommentLenght < this.MAX_LENGHT_COMMENT) {

        // save comment to the serser
        this.commentService.saveComment(this.newComment, null, this.currentPost.id)
          .subscribe((data: any) => {
             this.commentService.emitSavedComment(data);
             this.countCommentLenght = this.MAX_LENGHT_COMMENT;
             this.newComment = '';
             this.hideCommentLenght();
             this.clearCommentInput();
          });
      }

    }

    /*
      show the lenght of the comment content when the user is typing a comment
    */
    showCommentLenght() {
      const l = document.querySelector('#comment-length') as HTMLElement;
      l.style.display = 'inline-block';
    }


    /*
      update the lenght of comment display when user is typing
    */
    updateCommentLenght(event) {

      // prevent enter key pressed
      if (event.keyCode === 13) {
        event.preventDefault();
      }
      const lengthDisplay = document.querySelector('#comment-length') as HTMLElement;
      const length = this.newComment.trim().length;
      this.countCommentLenght = this.MAX_LENGHT_COMMENT - length;

      // if the user still have som characters left display text in green, else in red
      if (this.countCommentLenght >= 0) {
        lengthDisplay.style.color = '#00ff00';
      } else {
        lengthDisplay.style.color = '#ff0000';
      }
    }

    /*
      hide the lenght of the comment field
    */
    hideCommentLenght() {
      const l = document.querySelector('#comment-length') as HTMLElement;
      l.style.display = 'none';
    }

    /*
      clear the comment field when user is done typing or submit comment
    */
    clearCommentInput() {
      const comment = document.querySelector('#add-comment-field') as HTMLElement;
      comment.innerHTML = '';
    }



    updateCommentLenghtOnEdit(event) {
       // prevent enter key pressed
       if (event.keyCode === 13) {
        event.preventDefault();
      }

    }

    /*
       format the time into something like Nov 23rd at 11:30am
    */
    formatTime(time: string) {
      return this.timeService.format_time(new Date(time));
    }


    /*
      do not allow reply text field to go to a new line(disable enter key)
    */
    preventEnterKey(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
        }
    }

    /*
      Redirect to the home page
    */
    redirectHome() {
      this.router.navigate(['/']);
    }

    /*
      shows option for edit, delete, or report (the most)depending on the user logged in info and
      rapport to the instance type
    */
    showMoreOptionPost() {
      const moreOptionWindow = document.querySelector('#more-post-option-post')  as HTMLElement;
      const blackBackground = document.querySelector('#cover') as HTMLElement;

      moreOptionWindow.style.display = 'block';
      blackBackground.style.display = 'block';
      document.body.style.overflow = 'hidden';

    }

    /*
      Close the more option window
    */
    closeMoreOptionPost() {
      const editWindow = document.querySelector('#more-post-option-post')  as HTMLElement;
      const blackBackground = document.querySelector('#cover') as HTMLElement;
      const middle = document.querySelector('.middle') as HTMLElement;
      editWindow.style.display = 'none';
      blackBackground.style.display = 'none';
      middle.style.overflow = 'scroll';
    }

    /*
      show the alert box to confirm deletion of the post
    */
    confirmDeletion() {
      this.closeMoreOptionPost();
      const alertBox =  document.querySelector('.alert-box') as HTMLElement;
      alertBox.style.display = 'block';
      const cover = document.querySelector('#cover') as HTMLElement;
      cover.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    /*
      close the alert box  for deletion of the post
    */
    closeDeleteConfirmation() {
      const alertBox =  document.querySelector('.alert-box') as HTMLElement;
      alertBox.style.display = 'none';
      const cover = document.querySelector('#cover') as HTMLElement;
      cover.style.display = 'none';
      document.body.style.overflow = 'scroll';
    }


    /*
      Show dislay the error box
    */
    showErrorBox(title: string, content: string) {
      this.errorBoxTitle = 'Error';
      this.errorMessage = content;
      const messageBox = document.querySelector('.alert-message') as HTMLElement;
      const cover = document.querySelector('#cover') as HTMLElement;
      cover.style.display = 'block';
      messageBox.style.display = 'block';
    }

    /*
      Close the error box
    */
    closeErrorBox() {
      const messageBox = document.querySelector('.alert-message') as HTMLElement;
      const cover = document.querySelector('#cover') as HTMLElement;
      cover.style.display = 'none';
      messageBox.style.display = 'none';
    }


    /*
      Show window where user can edit the post
    */
    showEditWindow() {
      this.closeMoreOptionPost();
      this.postService.showEditWindow(this.currentPost);
    }

    /*
      make sure the black background is hidden when this component is closed and that the body is scrollable
    */
    ngOnDestroy() {
      document.body.style.overflow = 'scroll';
      const b = document.querySelector('#cover') as HTMLElement;
      b.style.display = 'none';
    }

}
