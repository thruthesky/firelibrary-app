import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FireService, POST, COMMENT } from '../../../../public_api';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy {


  @Input() post: POST = {};
  @Input() comment: COMMENT = {};
  form: COMMENT = {};
  loader = {
    progress: false
  };
  constructor(
    public fire: FireService
  ) {
  }

  // comments(id): COMMENT {
  //   return this.fire.comment.getComment(id);
  // }
  // get commentIds(): Array<string> {
  //   return this.fire.comment.commentIds[this.post.id];
  // }

  ngOnInit() {
    if (!this.post.id) {
      console.error('Post ID is empty. Something is wrong.');
      return;
    }
    this.comment.date = (new Date(this.comment.created)).toLocaleTimeString();
    // this.fire.comment.load(this.post.id).then(comments => {
    //   console.log(`comments: `, comments);
    // }).catch(e => alert(e.message));
  }
  ngOnDestroy() {
    // this.fire.comment.destory(this.post);
  }

  /**
   * Creates or Updates a comment.
   * This is being invoked when user submits the comment form.
   *
   *
   * @param parentnId is the parent id. if it is not set, it would be undefined.
   */
  onSubmit(event: Event) {
    console.log(`parentId: ${this.comment.parentId}`, 'form: ', this.form, 'comment:', this.comment);
    event.preventDefault();
    this.form.postId = this.post.id;
    this.form.parentId = this.comment.id;
    this.loader.progress = true;
    if (this.form.id) {
      this.fire.comment.edit(this.form).then(re => this.onSubmitThen(re)).catch(e => this.onSubmitCatch(e));
    } else {
      this.fire.comment.create(this.form).then(re => this.onSubmitThen(re)).catch(e => this.onSubmitCatch(e));
    }
    return false;
  }
  onSubmitThen(re) {
    this.form = {};
    this.loader.progress = false;
  }
  onSubmitCatch(e) {
    this.loader.progress = false;
    alert(e.message);
  }


  /**
   * Sets the form to edit.
   */
  onClickEdit() {
    this.form = this.comment;
    this.form.id = this.comment.id;
  }
  /**
   * Hide edit form and show comment.
   */
  onClickEditCancel() {
    this.form = {};
  }

  onClickLike() {
    this.comment['likeInProgress'] = true;
    this.fire.comment.like(this.comment.id).then(re => {
      this.comment['likeInProgress'] = false;
    }).catch(e => alert(e.message));
  }
  onClickDislike() {
    this.comment['dislikeInProgress'] = true;
    this.fire.comment.dislike(this.comment.id).then(re => {
      this.comment['dislikeInProgress'] = false;
    })
      .catch(e => alert(e.message));
  }

}
