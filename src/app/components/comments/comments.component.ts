import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from 'src/app/models/post';
import { Reaction } from 'src/app/models/reaction';
import { ReactionCounter } from 'src/app/models/reaction-counter';
import { Reply } from 'src/app/models/reply';
import { BlogArticle } from 'src/app/models/blogArticle';
import { DataType } from 'src/app/models/data-type';
import { Comment } from 'src/app/models/comment';
import { BlogpostService } from 'src/app/services/blogposts/blogpost.service';
import { TimeConversionService } from 'src/app/services/time-conversion.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PostService } from 'src/app/services/posts/post.service';
import { CommentService } from 'src/app/services/comments/comment.service';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, OnDestroy {

  constructor(private commentService: CommentService, private timeService: TimeConversionService,
              private authService: AuthService, private postService: PostService) { }

  currentUsername: string;
  isLoggedIn: boolean;

  allCommentSubscription: Subscription; // all comment subscription
  newCommentSubcription: Subscription; // when a comment is created
  emitIdSubcription: Subscription;
  emitTypeSubcription: Subscription;

  // keeps track if this is comment for an article or post
  instanceId: number;
  instanceType: string;

  commentReactions: Map<number, number>;
  commentToReplies: Map<number, Reply []>;
  displayRepliesStatus: Map<number, boolean>;
  repliesReactions: Map<number, number>;

  COMMENT_TYPE = 'comment';
  REPLY_TYPE = 'reply';
  currentType: string;

  selectedElementDiv: HTMLElement;
  selectedElementEditDiv: HTMLElement;
  selectedComment: Comment;

  selectedReply: Reply;
  parentComment: Comment;


  comments: any[]; // list containting all the comments

  ngOnInit() {
    this.emitIdSubcription = this.commentService.instanceIdEmitter.subscribe(
      id => {
        this.instanceId = id;
    });
    this.emitTypeSubcription = this.commentService.instanceTypeEmitter.subscribe(type => {
      this.instanceType = type;
    });


    this.comments = [];
    this.currentUsername = this.authService.getUsername();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.commentReactions = new Map();
    this.commentToReplies = new Map();
    this.displayRepliesStatus = new Map();
    this.repliesReactions = new Map();

    // subcribe to this emittor to receive comments from blogService
    this.allCommentSubscription = this.commentService.instanceCommentEmitter.subscribe(response => {
        console.log(response);

        // get user reactions to comments from this post
        const reactionsComments = new Map();
        const reactions = response[1];
        console.log(reactions);
        reactions.forEach(reaction => {
          reactionsComments.set(reaction.comment, reaction);
         });

        this.comments = response[0];

        // for each post check if user have reacted to it(like or dislike)
        this.comments.forEach(comment => {
          if (reactionsComments.get(comment.id)) {
              const reaction = reactionsComments.get(comment.id);
              comment.isLiked = reaction.like;
              comment.isDisliked = reaction.dislike;
              this.commentReactions.set(comment.id, reaction.id);

          }
        });

    });




    // receive a created comment and add it to our list of comment
    this.newCommentSubcription = this.commentService.savedCommentEmitter.subscribe(response => {
        this.comments.unshift(response);
        console.log(response);
    });

  }

  ngOnDestroy() {
    try {
      this.allCommentSubscription.unsubscribe();
    } catch {}

    try {
      this.newCommentSubcription.unsubscribe();
    } catch {}

    try {
      this.emitTypeSubcription.unsubscribe();
    } catch {}

    try {
      this.emitIdSubcription.unsubscribe();
    } catch {}


  }


  formatTime(time: string) {
    return this.timeService.format_time(new Date(time));
  }


  showMoreOption(dataType: string, index: number, event, commentIndex: number) {
    // remember the type of our data
    this.currentType = dataType;

    // show the more option window and black background
    const moreOptionWindow = document.querySelector('#more-post-option')  as HTMLElement;
    const blackBackground = document.querySelector('#cover') as HTMLElement;
    moreOptionWindow.style.display = 'block';
    blackBackground.style.display = 'block';

    // make the page unscrollable
    document.body.style.overflow = 'hidden';

    // rember the div that is selected for animation purpose if user decide to  delete it
    const target = event.target as HTMLElement;
    this.selectedElementDiv = target.parentElement.parentElement.parentElement;

    if (commentIndex === undefined) {
      this.selectedComment = this.comments[index];
    } else {
      this.parentComment = this.comments[commentIndex];
      this.selectedReply = this.commentToReplies.get(this.parentComment.id)[index];
    }
    this.selectedElementEditDiv = target.parentElement.nextElementSibling as HTMLElement;

  }

  // close the more option window
  closeMoreOption() {
    const moreOptionWindow = document.querySelector('#more-post-option')  as HTMLElement;
    const blackBackground = document.querySelector('#cover') as HTMLElement;
    moreOptionWindow.style.display = 'none';
    blackBackground.style.display = 'none';
    document.body.style.overflow = 'scroll';
  }

  // ask if user really wants to delete this post
  showDeleteConfirmationWindow() {

      // close the more option window since it must come right before this one
      this.closeMoreOption();

      // show the alert box asking the user to choose an option
      const alertBox =  document.querySelector('.alert-box-comment') as HTMLElement;
      const cover = document.querySelector('#cover') as HTMLElement;
      alertBox.style.display = 'block';
      cover.style.display = 'block';

      // make the page not move
      document.body.style.overflow = 'hidden';
  }

  closeDeleteConfirmationWindow() {

    // hide the delete confirmation window
    const alertBox =  document.querySelector('.alert-box-comment') as HTMLElement;
    const cover = document.querySelector('#cover') as HTMLElement;
    alertBox.style.display = 'none';
    cover.style.display = 'none';

    // make the page move again
    document.body.style.overflow = 'scroll';
  }

  deleteComment() {

    this.closeDeleteConfirmationWindow();
    this.commentService.deleteComment(this.selectedComment.id).subscribe(
      data => {
          // remove the div from dom with   animation
          this.selectedElementDiv.classList.add('deleting');
          setTimeout(() => {
            this.selectedElementDiv.remove();
          }, 2000);

      }, error => {
          console.log(error);
      }
    );
  }

  showEditCommentField() {

    // close the more option window
    this.closeMoreOption();

    // hide the comment (read only)
    const readOnly = this.selectedElementEditDiv.previousElementSibling as HTMLElement;
    readOnly.style.display = 'none';

    // // show the edit field to allow user to edit post
    this.selectedElementEditDiv.style.display = 'inline-block';

  }

  cancelEditing(event, commentIndex: number, replyIndex: number) {
    const element = event.target as HTMLElement;


    // show the comment
    const showComment = element.parentElement.previousElementSibling as HTMLElement;

    // hide the edit field div
    element.parentElement.style.display = 'none';

    // if we were editing a reply, get the reply content or other wise get the comment content and
    // reset the edit field with the original values
    if (replyIndex !== undefined) {
      const commentId = this.comments[commentIndex].id;
      element.parentElement.firstElementChild.innerHTML = this.commentToReplies.get(commentId)[replyIndex].content;
    } else {
      element.parentElement.firstElementChild.innerHTML = this.comments[commentIndex].content;

    }

    // show the comment/reply or read only
    showComment.style.display = 'block';

  }


  submitEditComment(event, index: number) {
    const button = event.target as HTMLElement;

    // get content and remove unassacary space and elements
    let content = button.previousElementSibling.innerHTML;
    content =  content.replace(/&nbsp;/gi, '').replace(/<br>;/gi, '').trim();
    content = content.trim();

    this.commentService.editComment(this.comments[index].id, content).subscribe(
      data => {
        this.selectedComment.content = data.content;

        // close cancel field
        this.cancelEditing(event, index, undefined);
      }, error => {
        console.log(error);
      }
    );

  }

  // unable the enter key in any editable div
  preventEnterKey(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  }

  // like a comment
  likeComment(index: number) {
    // make sure the user is logged in first
    if (!this.authService.isLoggedIn()) {
      alert('you must log in first');
    } else {

      const currentComment = this.comments[index];

      // figure out if those comments are for an article or a post
      let article = -1;
      let post = -1;

      if (this.instanceType === DataType.ARTICLE) {
         article = this.instanceId;
      } else if (this.instanceType === DataType.POST) {
          post = this.instanceId;
      }
      this.commentService.likeComment(article, post, currentComment.id).subscribe(
        data => {

          if (currentComment.isDisliked) {
            currentComment.dislikes -= 1;
          }
          currentComment.isLiked = true;
          currentComment.isDisliked = false;
          currentComment.likes += 1;

          this.commentReactions.set(currentComment.id, data.id);
        }, error => {
          console.log(error);
        }
      );
    }
  }

  dislikeComment(index: number) {
    // make sure the user is logged in first
    if (!this.authService.isLoggedIn()) {
      alert('you must log in first');
    } else {
      const currentComment = this.comments[index];

      // figure out if those comments are for an article or a post
      let article = -1;
      let post = -1;
      if (this.instanceType === DataType.ARTICLE) {
         article = this.instanceId;
      } else if (this.instanceType === DataType.POST) {
          post = this.instanceId;
      }

      this.commentService.dislikeComment(article, post, currentComment.id).subscribe(
        data => {
          if (currentComment.isLiked) {
            currentComment.likes -= 1;
          }
          currentComment.isDisliked = true;
          currentComment.isLiked = false;
          currentComment.dislikes += 1;
          this.commentReactions.set(currentComment.id, data.id);
        }, error => {
          console.log(error);
        }
      );
    }
  }

  // remove like of a comment
  unlikeComment(index: number) {
    const currentComment = this.comments[index];
    this.commentService.deleteReaction(this.commentReactions.get(currentComment.id)).subscribe(
      data => {
        currentComment.likes -= 1;
        currentComment.isLiked = false;
        console.log(data);
      }, error => {
        console.log(error);
      }
    );
  }


  // remove dislike of a comment
  undislikeComment(index: number) {
    const currentComment = this.comments[index];
    this.commentService.deleteReaction(this.commentReactions.get(currentComment.id)).subscribe(
      data => {
        currentComment.dislikes -= 1;
        currentComment.isDisliked = false;
        console.log(data);
      }, error => {
        console.log(error);
      }
    );
  }

  hideReplyCommentField(event) {
    const button = event.currentTarget as HTMLElement;
    const div = button.previousElementSibling.previousElementSibling;
    const  contentDiv = div.textContent.trim();
    div.innerHTML = '';
  }

  // save a reply
  saveReply(commentId: number, index: number, event) {
    const button = event.currentTarget as HTMLElement;
    const div = button.previousElementSibling;
    const  contentDiv = div.textContent.trim();
    div.innerHTML = '';

    let postId = -1;
    let articleId = -1;

    if (this.instanceType === DataType.ARTICLE) {
      articleId = this.instanceId;
    }

    if (this.instanceType === DataType.POST) {
      postId = this.instanceId;
    }


    if (contentDiv.length > 0) {
      this.commentService.saveReply(articleId, postId, commentId, contentDiv).subscribe(data => {
          if (!this.commentToReplies.has(commentId)) {
            this.commentToReplies.set(commentId, []);
          }
          this.commentToReplies.get(commentId).push(data);
          this.comments[index].replies += 1;

      });
    }
  }

  // edit a reply
  submitEditReply(event, replyIndex: number, commentIndex: number) {
    const content = event.target.parentElement.firstElementChild.textContent.trim();
    const comment = this.comments[commentIndex];
    const reply = this.commentToReplies.get(comment.id)[replyIndex];

    if (content.length > 0 && content !== reply.content) {
        this.commentService.editReply(reply.id, comment.id, content).subscribe(
          data => {
            this.commentToReplies.get(comment.id)[replyIndex].content = data.content;
            this.cancelEditing(event, commentIndex, replyIndex);
          },
          error => {
            console.log(error);
        });
    } else {
      alert('we arent ');
      this.cancelEditing(event, commentIndex, replyIndex);
    }

  }

  // delete a reply
  deleteReply() {
    this.closeDeleteConfirmationWindow();
    this.commentService.deleteReply(this.selectedReply.id).subscribe(
      data => {
        this.selectedElementDiv.classList.add('deleting');
        setTimeout(() => {
          this.selectedElementDiv.remove();
          const array = this.commentToReplies.get(this.parentComment.id);
          this.commentToReplies.set(this.parentComment.id, array.filter(reply => reply.id !== this.selectedReply.id));
          this.parentComment.replies -= 1;
        }, 2000);
      }, error => {
        console.log(error);
      }
    );
  }

  // view replies of a comment id
  viewReplies(commentId: number, index: number) {
    if (!this.commentToReplies.has(commentId) || this.comments[index].replies !== this.commentToReplies.get(commentId).length) {
      this.commentService.getCommentReplies(commentId).subscribe(response => {

        // save the reaction that maps reply.id to reaction.id for delete
        // save map replyId => reaction, so that we see if the reply was liked or disliked
        const reactions = response[1];
        const repliesToReactions = new Map();
        reactions.forEach(reaction => {
            this.repliesReactions.set(reaction.reply, reaction.id);
            repliesToReactions.set(reaction.reply, reaction);
        });

        // iterate over the replies and found of if any of them has been liked or disliked by our user
        const replies = response[0];
        const length = replies.length;
        for (let i = 0; i < length; i++) {
          if (repliesToReactions.has(replies[i].id)) {
            const reaction = repliesToReactions.get(replies[i].id);
            replies[i].isLiked = reaction.like;
            replies[i].isDisliked = reaction.dislike;
          }
        }

        // display our replies
        this.displayRepliesStatus.set(commentId, true);
        this.commentToReplies.set(commentId, replies);
      });
    } else {
      this.displayRepliesStatus.set(commentId, true);
    }
  }

  // hide replies of comment id
  hideReplies(commentId: number) {
    this.displayRepliesStatus.set(commentId, false);
  }

  likeReply(commentId: number, replyId: number, index: number) {
    this.commentService.likeReply(commentId, replyId).subscribe(
      data => {
        const reply = this.commentToReplies.get(commentId)[index];
        if (reply.isDisliked) {
          reply.dislikes --;
        }
        reply.likes ++;
        reply.isLiked = true;
        reply.isDisliked = false;

        this.repliesReactions.set(replyId, data.id);

      },
      error => {
        alert(error);
      }
    );
  }

  dislikeReply(commentId: number, replyId: number, index: number) {
    this.commentService.dislikeReply(commentId, replyId).subscribe(
      data => {
        const reply = this.commentToReplies.get(commentId)[index];
        if (reply.isLiked) {
          reply.likes --;
        }
        reply.dislikes ++;
        reply.isLiked = false;
        reply.isDisliked = true;

        this.repliesReactions.set(replyId, data.id);

      },
      error => {
        alert(error);
      }
    );
  }

  deleteReactionReply(commentId: number, replyId: number, index: number) {
    this.commentService.deleteReaction(this.repliesReactions.get(replyId)).subscribe(
      data => {
        const reply = this.commentToReplies.get(commentId)[index];

        // check if the reply was liked or disliked
        if (reply.isDisliked) {
          reply.dislikes--;
        }
        if (reply.isLiked) {
          reply.likes --;
        }
        reply.isLiked = false;
        reply.isDisliked = false;

      },
      error => {
        alert('something went wrong');
      }
    );
  }


}
