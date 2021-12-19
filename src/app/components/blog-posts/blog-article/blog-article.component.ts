import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import { BlogpostService } from 'src/app/services/blogposts/blogpost.service';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import { BlogArticle } from 'src/app/models/blogArticle';
import { Comment } from 'src/app/models/comment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Reply } from 'src/app/models/reply';
import { DataType } from 'src/app/models/data-type';
import { Instance } from 'src/app/models/instance';
import { CommentService } from 'src/app/services/comments/comment.service';


@Component({
  selector: 'app-blog-article',
  templateUrl: './blog-article.component.html',
  styleUrls: ['./blog-article.component.css']
})
export class BlogArticleComponent implements OnInit, AfterViewInit, OnDestroy {
  blogArticle: BlogArticle; //
  instance: Instance;

  newComment: string; // text for new comment

  countLenght: number; // count the lenght of new Comment
  MAXIMUM_COMMENT_LENGTH: number; // max lenght of a comment

  errorMessage: string;

  currentUsername: string;

  COMMENT: string;
  REPLY: string;
  currentType: string;

  selectedElementDiv: HTMLElement;
  selectedElementEditDiv: HTMLElement;
  selectedElementId: number;
  selectedComment: Comment;
  selectedReply: Reply;

  comments: any [];
  constructor(private route: ActivatedRoute, private blogService: BlogpostService,
              private commentService: CommentService, private timeService: TimeConversionService,
              private authService: AuthService) { }

  ngOnInit() {
      this.MAXIMUM_COMMENT_LENGTH = 1000; // max lenght of a comment
      this.countLenght = 1000; // count the lenght of new Comment


      this.COMMENT = 'Comment';
      this.REPLY = 'Reply';
      this.currentUsername = this.authService.getUsername();
      this.newComment = '';
      this.route.paramMap.subscribe((params: ParamMap) => {
          const articleId = params.get('articleId');
          this.getBlogArticle(articleId);

      });
  }

  ngOnDestroy() {
    const blackBackground = document.querySelector('#cover') as HTMLElement;
    blackBackground.style.display = 'none';
  }

  ngAfterViewInit() {

      // style on all the images inside the rich text field inside the article
      const images = document.querySelectorAll('figure img');
      images.forEach(element => {
        const img = element as HTMLElement;
        img.style.marginLeft = '5%';
        img.style.maxWidth = '90%';
        img.style.height = 'auto';
        img.style.textAlign = 'center';

      });
  }


  getBlogArticle(articleId: string) {
    this.blogService.getBlogArticle(articleId).subscribe(
        article => {
          this.blogArticle = article;
          this.blogArticle.datePublished = this.timeService.format_date(new Date(article.datePublished));

          this.commentService.getArticleComments(this.blogArticle.id);
        }
    );
  }

  submitComment() {
    // submit a new comment and add to the list of comments
    this.commentService.saveComment(this.newComment, this.blogArticle.id, null).subscribe(
        response => {
          this.commentService.emitSavedComment(response);
          this.newComment = '';
      }, error => {
        alert(error);
      }
    );
  }

  deleteInstance() {
    this.closeDeleteConfirmation();
    if (this.currentType === this.COMMENT) {
      this.blogService.deleteComment(this.selectedComment.id).subscribe(
          data => {
            this.selectedElementDiv.classList.add('deleting');
            // wait for the deletion animation to complete and then remove the element from the dom
            setTimeout(() => {
              this.selectedElementDiv.remove();
            }, 1500);

          }, error => {
            console.log(error);
            this.errorMessage = error;
            this.showErrorBox();
          }
      );
    }
  }

  showErrorBox() {
    const messageBox = document.querySelector('.alert-message') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'block';
    messageBox.style.display = 'block';
  }

  closeErrorBox() {
    const messageBox = document.querySelector('.alert-message') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'none';
    messageBox.style.display = 'none';
  }



  editInstance() {
    this.closeMoreOption();
    const readOnly = this.selectedElementDiv.previousElementSibling as HTMLElement;
    console.log(readOnly);
    readOnly.style.display = 'none';
    this.selectedElementEditDiv.style.display = 'block';
  }

  // show the confirmation delete window to ask user if they want to delete the comment/replg
  confirmDeletion() {
    // close the more option window
    this.closeMoreOption();

    // show the alert box asking the user to choose an option
    const alertBox =  document.querySelector('.alert-box') as HTMLElement;
    console.log(alertBox);
    const cover = document.querySelector('#cover') as HTMLElement;
    alertBox.style.display = 'block';
    cover.style.display = 'block';

    // make the page not move
    document.body.style.overflow = 'hidden';
  }

  // close the confirmation delete window
  closeDeleteConfirmation() {
    // hide the box
    const alertBox =  document.querySelector('.alert-box') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    alertBox.style.display = 'none';
    cover.style.display = 'none';

    // make the page scrollable again
    document.body.style.overflow = 'scroll';
  }

  showMoreOption(dataType: string, index: number, event) {
      this.currentType = dataType;

      const moreOptionWindow = document.querySelector('#more-post-option')  as HTMLElement;
      const blackBackground = document.querySelector('#cover') as HTMLElement;

      moreOptionWindow.style.display = 'block';
      blackBackground.style.display = 'block';
      document.body.style.overflow = 'hidden';

      const target = event.target as HTMLElement;


      this.selectedElementDiv = target.parentElement.parentElement.parentElement;
      this.selectedComment = this.comments[index];
      this.selectedElementEditDiv = target.parentElement.nextElementSibling as HTMLElement;

  }

  closeMoreOption() {
    const moreOptionWindow = document.querySelector('#more-post-option')  as HTMLElement;
    const blackBackground = document.querySelector('#cover') as HTMLElement;

    moreOptionWindow.style.display = 'none';
    blackBackground.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }

  cancelEditing(event) {

  }

  // format the time into something like Nov 23rd at 11:30am
  formatTime(time: string) {
    return this.timeService.format_time(new Date(time));
  }

  updateCharacterLeftView() {
    this.countLenght = this.MAXIMUM_COMMENT_LENGTH - this.newComment.trim().length;
    const div = document.querySelector('#remaining-length') as HTMLElement;
    if (this.countLenght < 0 ) {
      div.style.color = '#ff0000';
    } else {
      div.style.color = '#00ff00';
    }
  }


}
