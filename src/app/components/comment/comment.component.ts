import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FireService, POST, COMMENT } from '../../../../public_api';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy {


  @Input() post: POST = {};
  @Input() parent: COMMENT = {};
  comment: COMMENT = {};
  edit: COMMENT = {};
  loader = {
    creating: false
  };
  constructor(
    public fire: FireService
  ) {
  }

  comments(id): COMMENT {
    if (this.fire.comment.comments[id] === void 0) {
      return <any>[];
    }
    // console.log(this.fire.comment.comments[id]);
    return this.fire.comment.comments[id];
  }
  get commentIds(): Array<string> {
    return this.fire.comment.commentIds[this.post.id];
  }

  ngOnInit() {
    if (!this.post.id) {
      console.error('Post ID is empty. Something is wrong.');
      return;
    }
    this.fire.comment.load(this.post.id).then(comments => {
      console.log(`comments: `, comments);
    }).catch(e => alert(e.message));
  }
  ngOnDestroy() {
    this.fire.comment.destory( this.post );
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.comment.postId = this.post.id;
    this.comment.parentCommentId = this.parent.parentCommentId;
    console.log('create: ', this.comment);
    this.fire.comment.create(this.comment).then(re => {
      // console.log('re: ', re);
    })
      .catch(e => alert(e.message));
    return false;
  }
  onSubmitEdit(event: Event, commentId: string) {
    event.preventDefault();
    this.edit.id = commentId;
    this.fire.comment.edit(this.edit).then(re => {
      // console.log('comment edit: ', re);
      this.edit = {};
    })
      .catch(e => alert(e.message));
    return false;
  }


  onClickLike(id: string) {
    this.fire.comment.like(id).then(re => {
      // console.log(`comment like. re: `, re);
    }).catch(e => alert(e.message));
  }
  onClickDislike(id: string) {
    this.fire.comment.dislike(id).then(re => {
      // console.log(`comment dislike. re: `, re);
    })
      .catch(e => alert(e.message));
  }

}
