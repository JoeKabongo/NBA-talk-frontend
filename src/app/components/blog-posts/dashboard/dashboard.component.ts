import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BlogpostService } from 'src/app/services/blogposts/blogpost.service';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import { BlogArticle } from 'src/app/models/blogArticle';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  constructor(private blogService: BlogpostService, private router: Router,
              private timeService: TimeConversionService, private authService: AuthService ) { }
  allArticles: BlogArticle[];
  publishedArticles: BlogArticle[];
  drafts: BlogArticle[];
  currentlyShowed: BlogArticle[];

  allButton: HTMLElement;
  draftButton: HTMLElement;
  publishedButton: HTMLElement;

  currentView: string;
  DRAFT_VIEW = 'DRAFTS';
  PUBLISHED_VIEW = 'PUBLISHED';
  ALL_VIEW = 'ALL_VIEW';

  publishedArticleId: number;
  isPublishing: boolean; /* Keeps track of either the writer was publishing an article or unpublishing*/

  /* keeps trackof the article the writer is about to delete */
  articleToDeleteId: number;
  articleToDeleteIndex: number;


  ngOnInit() {
    this.publishedArticles = [];
    this.drafts = [];
    this.allArticles = [];
    this.currentlyShowed = [];

    this.getUserArticles();
    this.allButton = document.querySelector('#all-button');
    this.draftButton = document.querySelector('#draft-button');
    this.publishedButton = document.querySelector('#published-button');
    this.currentView = this.ALL_VIEW;

  }

  getUserArticles() {
    if (this.authService.isUserWriter()) {
      this.blogService.getUserBlogs().subscribe(
        data => {
          data.reverse().forEach(element => {
              const article = element;
              article.lastEdited = this.timeService.format_time(new Date(element.lastEdited));
              this.currentlyShowed.push(article);
              this.allArticles.push(article);

              if (article.isPublished) {
                this.publishedArticles.push(article);
              } else {
                this.drafts.push(article);
              }

          });
        }
      );
    }
  }

  isWriter() {
    return this.authService.isUserWriter();
  }

  viewAll() {
      if (this.currentView !==  this.ALL_VIEW) {
         this.currentlyShowed = [];
         this.allArticles.forEach(article => this.currentlyShowed.push(article));

         this.currentView = this.ALL_VIEW;
         this.allButton.classList.add('current');

         this.draftButton.classList.remove('current');
         this.publishedButton.classList.remove('current');
      }
  }

  viewDrafts() {
    if (this.currentView !== this.DRAFT_VIEW) {
      this.currentlyShowed = [];
      this.drafts.forEach(article => this.currentlyShowed.push(article));

      this.currentView = this.DRAFT_VIEW;
      this.draftButton.classList.add('current');
      this.allButton.classList.remove('current');
      this.publishedButton.classList.remove('current');
    }
  }

  viewPublished() {

    if (this.currentView !== this.PUBLISHED_VIEW) {

      this.currentlyShowed = [];
      this.publishedArticles.forEach(article => this.currentlyShowed.push(article));

      this.currentView = this.PUBLISHED_VIEW;
      this.publishedButton.classList.add('current');

      this.allButton.classList.remove('current');
      this.draftButton.classList.remove('current');
    }

  }

  /* publish an article*/
  publishArticle(articleId: number, index: number) {
    this.isPublishing = true;
    this.blogService.publishArticle(articleId).subscribe(
      data => {
        const n = this.drafts.length;

        /* find the article in the draft array and remove id, add it to the publish array*/
        for (let i = 0; i < n; i++) {
          if (this.drafts[i].id === articleId) {
            const article = this.drafts[i];
            article.isPublished = true;

            this.publishedArticles.push(article);
            this.drafts.splice(i, 1);
            break;
          }
        }

        /* Depending on the view we either remove the article from the view or just set published to true*/
        if (this.currentView === 'DRAFT') {
        this.currentlyShowed.splice(index, 1);
        } else {
          this.currentlyShowed[index].isPublished = true;
        }
        this.publishedArticleId = articleId;

        /* Display a confirmation message */
        // const confirmation = document.querySelector('#confirm-publish') as HTMLElement;
        // const cover = document.querySelector('#cover') as HTMLElement;
        // confirmation.style.display = 'block';
        // cover.style.display = 'block';

      },
      error => {
        console.log(error);
      }
    );

  }

  /* unpublish an article*/
  unpublishArticle(articleId: number, index: number) {
    this.isPublishing = false;
    this.blogService.unpublishArticle(articleId).subscribe(
      data => {
        const n = this.publishedArticles.length;

        /* find the article in the draft array and remove id, add it to the publish array*/
        for (let i = 0; i < n; i++) {
          if (this.publishedArticles[i].id === articleId) {
            const article = this.publishedArticles[i];
            article.isPublished = false;

            this.drafts.push(article);
            this.publishedArticles.splice(i, 1);
            break;
          }
        }

        /* Depending on the view we either remove the article from the view or just set published to true*/
        if (this.currentView === 'PUBLISHED') {
        this.currentlyShowed.splice(index, 1);
        } else {
          this.currentlyShowed[index].isPublished = false;
        }

        /* Depending on the view we either remove the article from the view or just set published to true*/
        // const confirmation = document.querySelector('#confirm-publish') as HTMLElement;
        // const cover = document.querySelector('#cover') as HTMLElement;
        // confirmation.style.display = 'block';
        // cover.style.display = 'block';

      },
      error => {
        console.log(error);
      }
    );

  }

  editArticle(articleId: number) {
    this.router.navigate(['blog/edit', articleId]);
  }

  deleteArticle(articleId: number, index: number) {
    this.closeDeletionWindow();
    this.blogService.deleteArticle(articleId).subscribe(
        data => {
          this.currentlyShowed.splice(index, 1);
          this.allArticles = this.allArticles.filter(article => article.id !== articleId);
          this.drafts = this.drafts.filter(article => article.id !== articleId);
          this.publishedArticles = this.publishedArticles.filter(article => article.id !== articleId);

          console.log(data);
        },
        error => {
          console.log(error);
        }
    );
  }

  viewArticlePage(articleId: number, articleTitle: string) {
    const title = articleTitle.replace(' ', '-');
    this.router.navigate(['blog', articleId, title]);
  }

  confirmDeletionWindow(articleId: number, index: number) {

    this.articleToDeleteId = articleId;
    this.articleToDeleteIndex = index;

    const confirmation = document.querySelector('#confirm-deletion') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;

    confirmation.style.display = 'block';
    cover.style.display = 'block';


  }

  closeDeletionWindow() {
    const confirmation = document.querySelector('#confirm-deletion') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;

    confirmation.style.display = 'none';
    cover.style.display = 'none';
  }

  closePublishedConfirmation() {
        const confirmation = document.querySelector('#confirm-publish') as HTMLElement;
        const cover = document.querySelector('#cover') as HTMLElement;

        confirmation.style.display = 'none';
        cover.style.display = 'none';
  }

  goToPublishedArticle() {
    this.router.navigate(['/blog', this.publishedArticleId]);
  }

  ngOnDestroy() {
    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'none';

  }

}
