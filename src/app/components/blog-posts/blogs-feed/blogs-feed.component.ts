import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlogArticle } from 'src/app/models/blogArticle';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { BlogpostService } from 'src/app/services/blogposts/blogpost.service';
import { PostService } from 'src/app/services/posts/post.service';

@Component({
  selector: 'app-blogs-feed',
  templateUrl: './blogs-feed.component.html',
  styleUrls: ['./blogs-feed.component.css']
})
export class BlogsFeedComponent implements OnInit, OnDestroy {

  blogArticles: BlogArticle [];


  constructor(private blogService: BlogpostService,  private timeService: TimeConversionService,
              private postService: PostService) {}

  ngOnInit() {
    // emit this so navbar do not show the option of creating a post in this view
    this.postService.showPostButton(false);
    this.getBlogArticles();

    this.postService.createdPost.subscribe(
      post => {
        this.postService.emitMessagePostCreated(post.id);
      }
    );
  }

  ngOnDestroy() {
    // try {
    //   this.postService.createdPost.unsubscribe();
    // } catch {}
  }


  getBlogArticles() {
    this.blogService.getBlogArticles()
      .subscribe(data => {
          this.blogArticles = [];
          data.forEach(element => {
            const article = element;
            article.datePublished = this.timeService.format_date(new Date(article.datePublished));
            this.blogArticles.push(article);
          });
          this.blogArticles = data;
        }, error => {
          console.log(error);
        }
      );

  }

}
