import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Post } from 'src/app/models/post';
import { PostService } from 'src/app/services/posts/post.service';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import { Reaction } from 'src/app/models/reaction';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  // store user informations
  loggedInUsername: string;
  username: string;
  profileImage: string;
  userId: number;
  bio: string;
  email: string;
  dateJoined: string;
  friends: number;
  isProfileWriter: boolean;


  // current logged in user if any
  myProfile: boolean;
  isLoggedIn: boolean;
  posts: Post[];


  // this is for the editing when editing the profile, the info is kepts in these variable
  updateUsername: string;
  updateEmail: string;
  updateBio: string;
  updateProfileImage: File;
  profileImagePreview: any;

  // alert boxes for error and other html element
  editWindow: HTMLElement;
  cover: HTMLElement;
  alertBox: HTMLElement;
  alertTitle: string;
  alertContent: string [];
  userNotFound: boolean;

  // when editing a post
  editPostContent: string;

  // keeps track of the selected post by the user(the element, index, and content)
  postSelectedElement: HTMLElement;
  postSelectedIndex: number;
  postSelectedContent: string;

  // keeps track of the post and reaction id, allowing to remove a reaction faster just using the reaction id
  postReactions: Map<number, number>;



  editPostSubscription: Subscription; // when a post is edited
  errorEmittorSubcription: Subscription; // when there is error




  constructor(private route: ActivatedRoute, private  profileService: UserProfileService,
              private authService: AuthService, private router: Router, private timeService: TimeConversionService,
              private postService: PostService) { }

  ngOnInit() {
    this.editWindow = document.querySelector('#editWindow') as HTMLElement;
    this.cover = document.querySelector('#cover') as HTMLElement;
    this.alertBox = document.querySelector('.alert-box') as HTMLElement;

    this.postSelectedIndex = -1;
    this.loggedInUsername = this.authService.getUsername();

    this.postReactions = new Map();


    // When the profile link is switch to another user
    // eg: profile/jonathan => profile/tshimpaka
    this.route.paramMap.subscribe((params: ParamMap) => {
      const username = params.get('username');
      this.getProfile(username);
      this.isLoggedIn = this.authService.isLoggedIn();

      if (this.authService.getUsername() !== username) {
        this.postService.showPostButton(false);
      } else {
        this.postService.showPostButton(true);
      }
    });





    this.editPostSubscription = this.postService.editedPost.subscribe(
      data => {
        const formatedTime = this.posts[this.postSelectedIndex].time;
        this.posts[this.postSelectedIndex].content = data.content;
        this.posts[this.postSelectedIndex].time = formatedTime;
      }
    );

    this.errorEmittorSubcription = this.postService.errorEmittor.subscribe(
      message => {
        this.alertContent = [];
        this.alertContent.push(message);
        this.showErrorWindow();
      }
    );

  }


  /*
    get profile of the user and update the page
  */
  getProfile(username: string) {
    this.profileService.getProfile(username).subscribe(
      data => {

        const userInfo = data[0];
        this.username = userInfo.username;
        this.friends = userInfo.friends;
        this.profileImage = userInfo.profileImage;
        this.myProfile = userInfo.myProfile;
        this.email = userInfo.email;
        this.isProfileWriter = userInfo.isWriter;
        this.userId = userInfo.id;
        this.bio = userInfo.bio;
        this.dateJoined = new Date(userInfo.date_joined).toDateString();


        // if this is the profile of the current logged in user
        if (this.username === this.authService.getUsername()) {
          this.myProfile = true;
        }

        // user reactions to posts
        const reactions = data[1];
        const reactionMap = new Map();
        reactions.forEach(reaction => reactionMap.set(reaction.post, reaction));

        this.posts =  [];

        // go through each posts and see if the user liked or disliked it
        // put the red color on liked or dislikes post
        userInfo.posts.forEach( (post) => {
          const currentPost = post;
          currentPost.time = this.timeService.format_time(new Date(currentPost.time));

          // user liked or dislike this post
          if (reactionMap.get(currentPost.id)) {
            currentPost.isLiked = reactionMap.get(currentPost.id).like;
            currentPost.isDisliked = reactionMap.get(currentPost.id).dislike;

            // keeps track of the reaction for this post
            this.postReactions.set(currentPost.id, reactionMap.get(currentPost.id).id);
          }
          this.posts.push(currentPost);
        });
        this.posts.reverse();

        // reset the values for updating user information later
        this.resetUpdateValues();
    }, error => {
      this.alertContent = [];
      this.alertContent.push(error);
      this.alertTitle = 'Error';
      this.userNotFound = true;
      const profile = document.querySelector('#user-profile' ) as HTMLElement;
      const rightSection = document.querySelector('#right-section' ) as HTMLElement;

      profile.style.display = 'none';
      rightSection.style.display = 'none';

      this.showAlertWindow();
    }
    );
  }


  /*
    Check if a user is a writer
  */
  isWriter() {
    return this.authService.isUserWriter();
  }

  /*
    Update the user information
  */
  updateUserData() {
    // remove leading and trailing space
    this.updateBio = this.myTrim(this.updateBio);
    this.updateEmail = this.myTrim(this.updateEmail);
    this.updateUsername = this.myTrim(this.updateUsername);

    // only run this function is user actually change their informations
    if (this.wasChanged()) {
      let img = null;
      if (this.profileImagePreview != null) {
        img = this.updateProfileImage;
      }
      this.profileService.updateProfile(this.updateUsername, this.updateEmail, this.updateBio, img)
      .subscribe(data => {
          // update instance
          this.authService.saveUsername(this.updateUsername);
          this.username = data.username;
          this.email = data.email;
          this.bio = data.bio;
          this.profileImage = data.profileImage;

          if (this.profileImagePreview != null) {
            this.updatePostPictures();
          }

          this.resetUpdateValues();

          // show a success message
          this.closeEditWindow();
          this.alertBox.style.display = 'block';
          this.cover.style.display = 'block';
          this.alertTitle = 'Profile update';
          this.alertContent = [];
          this.alertContent.push ('Your profile has been updated');

          // update the navigation bar with new username, for link /profile/username
          this.authService.usernameEmitter.next(this.username);

          this.posts.forEach(post => {
            post.username = this.username;
          });



      }, error => {
        this.closeEditWindow();
        this.alertContent = [];
        this.alertContent.push('Something went wrong! Try again');
        this.alertTitle = 'Update Fail';
        this.alertBox.style.display = 'block';
        this.cover.style.display = 'block';
      });

    }
  }

  /*

  */
  updatePostPictures() {
    this.posts.forEach(post => {
        if (post.username === this.loggedInUsername) {
          post.profileImage = this.profileImage;
        }
    });
  }

  myTrim(str: string) {
    return str.replace(/^\s+|\s+$/gm, '');
  }

  wasChanged() {
    return this.updateBio.localeCompare(this.bio) !== 0 ||
    this.updateEmail.localeCompare(this.email) !== 0 || this.updateUsername.localeCompare(this.username) !== 0
    || this.profileImagePreview !== null;
  }

  /*
    show window where user can edit their profile
  */
  showEditWindow() {

    this.editWindow = document.querySelector('#editWindow') as HTMLElement;
    this.cover = document.querySelector('#cover') as HTMLElement;

    // make sure the user is updating only their profile
    if (this.authService.isLoggedIn() && this.authService.getUsername() === this.username) {
      this.editWindow.style.display = 'inline-block';
      this.cover.style.display = 'block';
    }

  }
  /*
    close the edit profile window
  */
  closeEditWindow() {
    this.editWindow.style.display = 'none';
    this.cover.style.display = 'none';
    this.resetUpdateValues();
  }

  /*
    For changing profile image
  */
  onFileChanged(event) {
    this.updateProfileImage = event.target.files[0];

    const mimeType = this.updateProfileImage.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.updateProfileImage);
    reader.onload = (_event) => {
      this.profileImagePreview = reader.result;
    };
  }

  /*
    Show alert window
    This window shows error message or success message
  */
  showAlertWindow() {
    this.alertBox.style.display = 'block';
    this.cover.style.display = 'block';
    this.showEditWindow();
  }

  /*
    Close alert window
  */
  closeAlertWindow() {
    this.alertBox.style.display = 'none';
    this.cover.style.display = 'none';
    if (this.userNotFound) {
      this.router.navigate(['/']);
    }
  }


  /*
    resets all the update variable once the user updated the profile or cancel the update
  */
  resetUpdateValues() {
    this.updateUsername = this.username;
    this.updateEmail = this.email;
    this.updateBio = this.bio;
    this.profileImagePreview = null;
  }

  /*
    Redirect to writting article
  */
  writeArticle() {
    this.router.navigate(['blog/new']);
  }




  // show drop down menu when user user click on the more option for the post
  showDropDown(event: Event) {
    const button = event.target as HTMLElement;
    const option = button.nextElementSibling as HTMLElement;
    if (option.style.display === 'none' ) {

      // add all current dropdown
      const currentDropDown = document.querySelectorAll('.visible-drop-down');
      currentDropDown.forEach(element => {
          const html = element as HTMLElement;
          html.style.display = 'none';
      });

      // show this dropdown
      option.style.display = 'block';
      option.classList.add('visible-drop-down');

    } else {
      option.style.display = 'none';
      option.classList.remove('visible-drop-down');
    }
  }


  // show windown where use can create a new post
  showCreatePostWindow() {
    this.postService.showPostWindow();
  }

  // prompt user to write a post
  showEditPostWindow() {
    const c = document.querySelector('#more-post-option') as HTMLElement;
    c.style.display = 'none';
    this.postService.showEditWindow(this.posts[this.postSelectedIndex]);
  }
  addPost(post: Post) {
    post.time = this.timeService.format_time(new Date(post.time));
    this.posts.unshift(post);
  }

  editPost() {
    this.postService.editPost(this.posts[this.postSelectedIndex].id, this.editPostContent)
      .subscribe(data => {
          this.posts[this.postSelectedIndex].content = this.editPostContent;
          alert('here');
      }, error => {
        this.alertContent = [];
        this.alertContent.push(error);
        this.alertTitle = 'Error';
        this.showErrorWindow();
      });
  }

  // pop window for user to choose between editing, deleting or reporting a post
  showPostMoreOption(index: number, event: Event) {

    // keep track of the selected post and its dom element, in case the user decide to delete it


    const target = event.target as HTMLElement;
    console.log(target);
    this.postSelectedElement = target.parentElement;
    this.postSelectedIndex = index;

    this.postSelectedContent = this.posts[index].content;

    console.log(this.postSelectedContent);
    console.log(this.postSelectedElement);




    // show to the user options deleting, editing, report etc.
    const optionWindow = document.querySelector('#more-post-option') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    optionWindow.style.display = 'block';
    cover.style.display = 'block';
    document.body.style.overflow = 'hidden';

  }
  closePostMoreOption() {
    const optionWindow = document.querySelector('#more-post-option') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    optionWindow.style.display = 'none';
    cover.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }


  showErrorWindow() {
    this.alertBox.style.display = 'block';
    this.cover.style.display = 'block';
  }

  // Prompt the user  to confirm they are deleting a post
  confirmDeletion() {
    const moreOptionWindow = document.querySelector('#more-post-option') as HTMLElement;
    moreOptionWindow.style.display = 'none';

    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'block';


    const alert = document.querySelector('.alert-box-deletion') as HTMLElement;
    alert.style.display = 'inline-block';
    document.body.style.overflow = 'hidden';

  }

  closeDeletionAlert() {

    const cover = document.querySelector('#cover') as HTMLElement;
    cover.style.display = 'none';
    const alert = document.querySelector('.alert-box-deletion') as HTMLElement;
    alert.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }

  // user decide to delete the post
  deletePost() {
    this.postService.deletePost(this.posts[this.postSelectedIndex].id).subscribe(response => {
          this.closeDeletionAlert();
          this.postSelectedElement.classList.add('deleted-talk');
          // wait for the deletion animation to complete and then remove the element from the dom
          setTimeout(() => {
            this.postSelectedElement.remove();
            this.posts.splice(this.postSelectedIndex, 1);
          }, 1500);



    }, error => {
        this.alertContent = [];
        this.alertContent.push(error);
        this.alertTitle = 'Error';
        this.showErrorWindow();
    }) ;
  }


  saveLike(index: number) {
    const post = this.posts[index];
    if (this.authService.isLoggedIn()) {

        this.postService.likePost(post.id)
          .subscribe(data => {



              // update the number of count for likes and dislikes
              post.likes += 1;
              if (post.isDisliked) {
                post.dislikes -= 1;
              }

              post.isLiked = true;
              post.isDisliked = false;

              this.postReactions.set(post.id, data.id);

        });
    } else {
        alert('you must logging bro');
    }
  }

  saveDislike(index: number) {
    const post = this.posts[index];
    if (this.authService.isLoggedIn()) {

        this.postService.dislikePost(post.id)
          .subscribe(data => {

            if (post.isLiked) {
              post.likes --;
            }
            post.dislikes ++;
            post.isDisliked = true;
            post.isLiked = false;

            this.postReactions.set(post.id, data.id);

          });
    } else { alert('go logging firsr yo') ; }
  }

  removeReaction(index: number) {
    const post = this.posts[index];
    this.postService.removeReaction(this.postReactions.get(post.id))
    .subscribe(data => {

        if (post.isDisliked) {
          post.dislikes --;
        } else {
          post.likes --;
        }
        post.isDisliked = false;
        post.isLiked = false;

        // update the number of count for likes and dislikes
    });
  }

  ngOnDestroy() {
  }

}

