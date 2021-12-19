import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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

import { AuthGuard } from './guards/auth-guard.service';
import { WriterGuard } from './guards/writer.guard';
import { CurrentStatsComponent } from './components/stats/current-stats/current-stats.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'login', component: LoginComponent},
  {path: 'forgotPassword', component: ForgotPasswordComponent},
  {path: 'profile/:username', component: UserProfileComponent, runGuardsAndResolvers: 'always'},
  {path: 'post/:postId', component: PostDetailComponent},
  {path: 'search', component: SearchResultComponent},

  {path: 'messages', component: MessagesComponent,  canActivate: [AuthGuard]},

  {path: 'blog', component: BlogsFeedComponent},
  {path: 'blog/dashboard', component: DashboardComponent},
  {path: 'blog/new', component: WriteBlogComponent, canActivate: [WriterGuard]},
  {path: 'blog/edit/:articleId', component: WriteBlogComponent,   canActivate: [WriterGuard]},
  {path: 'blog/:articleId/:articleTitle', component: BlogArticleComponent},

  {path: 'stats', component: CurrentStatsComponent},
  {path: 'notifications', component: NotificationsComponent},
  {path: 'jointeam', component: JoinTeamComponent},

];


@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule],
  providers: [ AuthGuard, WriterGuard ]


})
export class AppRoutingModule { }
