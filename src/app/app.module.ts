import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BlogsFeedComponent } from './components/blog-posts/blogs-feed/blogs-feed.component';
import { HomeComponent } from './components/home/home.component';
import { BlogArticleComponent } from './components/blog-posts/blog-article/blog-article.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { MessagesComponent } from './components/messages/messages.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { DashboardComponent } from './components/blog-posts/dashboard/dashboard.component';
import { WriteBlogComponent } from './components/blog-posts/write-blog/write-blog.component';
import { JoinTeamComponent } from './components/join-team/join-team.component';
import { CommentsComponent } from './components/comments/comments.component';
import { CurrentStatsComponent } from './components/stats/current-stats/current-stats.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    BlogsFeedComponent,
    HomeComponent,
    BlogArticleComponent,
    SignupComponent,
    LoginComponent,
    UserProfileComponent,
    SearchResultComponent,
    MessagesComponent,
    PostDetailComponent,
    DashboardComponent,
    WriteBlogComponent,
    JoinTeamComponent,
    CommentsComponent,
    CurrentStatsComponent,
    NotificationsComponent,
    ForgotPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CKEditorModule

  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
