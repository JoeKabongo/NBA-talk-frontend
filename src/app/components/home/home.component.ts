import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { PostService } from 'src/app/services/posts/post.service';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import { Post } from 'src/app/models/post';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BlogArticle } from 'src/app/models/blogArticle';
import { BlogpostService } from 'src/app/services/blogposts/blogpost.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
  ]
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService, private postService: PostService,
              private router: Router, private timeService: TimeConversionService,
              private blogService: BlogpostService) { }

  posts = [];
  loggedInUsername: string;
  recentArticles: BlogArticle [];



  // know the reactionId related to a post, so we can easily delete it
  postIdToReaction: Map<number, number>;

  // keeps selected post by the user
  postSelectedElement: HTMLElement;
  postSelectedIndex: number;

  // alert message
  alertMessageTitle: string;
  alertMessageContent: string;

  // subscription that emit when a post is created or edited
  editPostSubscription: Subscription;




  ngOnInit() {

    this.postIdToReaction = new Map();
    this.loggedInUsername = this.authService.getUsername();

    // get all posts to display in the home page
    this.getPosts();

    // get all recents articles
    this.getRecentsArticles();

    // update the title of the page
    document.title = 'NBA TALK | Home';

    // when a post is edited and emited by the post service, update its content
    this.editPostSubscription = this.postService.editedPost.subscribe(response => {
        const formatedTime = this.posts[this.postSelectedIndex].time;
        this.posts[this.postSelectedIndex].content = response.content;
        this.posts[this.postSelectedIndex].time = formatedTime;
    });

  }

  /*
    get all the post to display on the home page
    response from the backend consist of an array -> [posts, currentUserReactions]
  */
  getPosts() {
    this.postService.getPosts().subscribe(
      data => {

        this.posts = [];
        const allPosts = data[0];
        const currentUserReactions = data[1];

        // tslint:disable-next-line: no-shadowed-variable
        allPosts.forEach(post => {
            post.time = this.timeService.format_time(new Date(post.time));
            this.posts.push(post);
        });
        this.posts.reverse();

        // get all the current user reactions and update the the like or dislike of display of a post(make it red)
        // eg. when the user like a post, the like thumb will become red
        currentUserReactions.forEach(reaction => {
            this.posts.forEach(post => {
              if (post.id === reaction.post) {
                  post.isLiked = reaction.like;
                  post.isDisliked = reaction.dislike;
                  this.postIdToReaction.set(post.id, reaction.id);
              }
            });
        });


      },
      error => {
        console.log(error);
      }
    );
  }

  /*
    get the most recents articles
    this is for the view on the right side of the website
  */
  getRecentsArticles() {
    this.blogService.getRecentsPosts(3).subscribe(
      data => {
          this.recentArticles = [];
          data.forEach(element => {
            const blog = element;
            blog.datePublished = this.timeService.format_date(new Date(blog.datePublished));
            this.recentArticles.push(blog);
          });
      }, error => {
          console.log(error);
      }
    );
  }

  /*
    add new post to the post list
  */
  addPost(post: Post) {
    post.time = this.timeService.format_time(new Date(post.time));
    this.posts.unshift(post);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }


  /*
    user decide to delete the post, delte it with a little animation
    close the delete promp widow first
    wait for the deletion animation to complete and then remove the element from the DOM
  */
  deletePost() {
    this.postService.deletePost(this.posts[this.postSelectedIndex].id).subscribe(response => {
          this.cancelDelete();

          this.postSelectedElement.classList.add('deleting');
          setTimeout(() => {
            this.postSelectedElement.remove();
          }, 1500);

    });
  }

   /*
      Prompt the user to see if they are going to confirm that they are deleting this post
   */
   confirmDeletion(postId: number, event: Event) {
    this.closePostMoreOption();
    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'block';
    const alert = document.querySelector('.alert-box') as HTMLElement;
    alert.style.display = 'inline-block';
    document.body.style.overflow = 'hidden';
  }

  /*
     close the delete confirmation window
  */
  cancelDelete() {
    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'none';
    const alert = document.querySelector('.alert-box') as HTMLElement;
    alert.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }

  /*
    open the small window for user to create new post
    this will be handled by the app component
  */
  showCreatePostWindow() {
    this.postService.showPostWindow();
  }


  /*
    open the small window for user to edit selected post post
    this will be handled by the app component
  */
  showEdit() {
    const c = document.querySelector('#more-post-option') as HTMLElement;
    c.style.display = 'none';
    this.postService.showEditWindow(this.posts[this.postSelectedIndex]);

  }

  /*
    check if the user is a writer, if they are, they get the option of also publishing articles
  */
  isWriter() {
    return this.authService.isUserWriter();
  }

  /*
    check if someone is logged in right now, if they are, they will be able to write post
  */
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  /*
    This is when a post is liked by the logged in user.
    The index params represent the index'th post in our array.
    Update the number of like and dislikes that are associated with this particular post.
    if the user is not logged in, redirect him to the login page
  */
  saveLike(index: number) {
    if (this.authService.isLoggedIn()) {
        const post = this.posts[index];
        this.postService.likePost(post.id).subscribe(
          data => {

              // update the number of count for likes and dislikes
              post.likes += 1;
              if (post.isDisliked) {
                post.dislikes -= 1;
              }
              post.isLiked = true;
              post.isDisliked = false;

              // remember this reaction id, make it easy to delete
              this.postIdToReaction.set(post.id, data.id);
        },
          error => {
            console.log(error);
          }
        );
    } else {
        this.router.navigate(['/login']);
    }
  }

   /*
    This is when a post is disliked by the logged in user.
    The index params represent the index'th post in our array.
    Update the number of like and dislikes that are associated with this particular post
    if the user is not logged in, redirect him to the login page
  */
  saveDislike(index: number) {
    if (this.authService.isLoggedIn()) {
        const post = this.posts[index];
        this.postService.dislikePost(post.id)
          .subscribe(data => {

            // update the number of count for likes and dislikes
            post.dislikes += 1;
            if (post.isLiked) {
              post.likes -= 1;
            }

            post.isDisliked = true;
            post.isLiked = false;

            // remember this reaction id, make it easy to delete
            this.postIdToReaction.set(post.id, data.id);

          });
    } else {
      this.router.navigate(['/login']);
    }
  }

  /*
    When a user unlike or undislike a post.
    update the number of likes and dislikes and the color of the thumbs(up or down) too
  */
  removeReaction(index: number) {
    this.postService.removeReaction(this.postIdToReaction.get(this.posts[index].id))
    .subscribe(data => {
        const post = this.posts[index];
        if (post.isDisliked) {
          post.dislikes --;
        } else {
          post.likes --;
        }

        post.isLiked = false;
        post.isDisliked = false;
    });
  }



  /*
    Show error message window
  */
  showAlertMessage(title: string, content: string) {

    this.alertMessageTitle = title;
    this.alertMessageContent = content;
    const alertElement = document.querySelector('.alert-message') as HTMLElement;
    alertElement.style.display = 'inline-block';

    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'block';
  }

  /*
    close error message window
  */
  closeAlertMessage() {
    const alertElement = document.querySelector('.alert-message') as HTMLElement;
    alertElement.style.display = 'none';

    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'none';
  }

  /*
    This is when the user click the little button of the right top corner of a post
    Prompt options(edit, delete, report) depending on the user status
  */
  showPostMoreOption(index: number, event: Event) {

    // keep track of the selected post and its dom element, in case the user decide to delete it
    const target = event.target as HTMLElement;
    this.postSelectedElement = target.parentElement;
    this.postSelectedIndex = index;

    // show to the user options deleting, editing, report etc.
    const optionWindow = document.querySelector('#more-post-option') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    optionWindow.style.display = 'block';
    cover.style.display = 'block';
    document.body.style.overflow = 'hidden';

  }

  /*
    close that window
  */
  closePostMoreOption() {
    const optionWindow = document.querySelector('#more-post-option') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    optionWindow.style.display = 'none';
    cover.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }

  /*
    For when the want to write a new article, redirect to writing article
  */
  writeArticle() {
    this.router.navigate(['blog/new']);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    try {
      this.editPostSubscription.unsubscribe();
    } catch {}
  }

}


