import { Component, Input, OnInit } from '@angular/core';
import { FireService, POST, COMMENT } from '../../../../public_api';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {


  @Input() post: POST = {};
  @Input() parent: COMMENT = {};
  comment: COMMENT = {};
  loader = {
    creating: false
  };
  constructor(
    public fire: FireService
  ) {
  }

  comments(id): COMMENT {
    if ( this.fire.comment.comments[id] === void 0 ) {
      return <any>[];
    }
    // console.log(this.fire.comment.comments[id]);
    return this.fire.comment.comments[id];
  }
  get commentIds(): Array<string> {
    return this.fire.comment.commentIds[this.post.id];
  }

  ngOnInit() {
    if ( ! this.post.id ) {
      console.error('Post ID is empty. Something is wrong.');
      return;
    }
    this.fire.comment.load(this.post.id).then(comments => {
      console.log(`comments: `, comments);
    }).catch(e => alert(e.message));
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.comment.postId = this.post.id;
    this.comment.parentCommentId = this.parent.parentCommentId;
    console.log('create: ', this.comment);
    this.fire.comment.create(this.comment).then(re => {
      console.log('re: ', re);
    })
      .catch(e => alert(e.message));
    return false;
  }

}
