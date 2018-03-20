import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FireService, POST, COMMENT } from '../../../../public_api';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy {


  @Input() post: POST = {};
  comment: COMMENT = {};
  loader = {
    creating: false
  };
  constructor(
    public fire: FireService
  ) {
  }

  comments(id): COMMENT {
    return this.fire.comment.getComment(id);
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
    this.fire.comment.destory(this.post);
  }

  /**
   * Creates or Updates a comment.
   * This is being invoked when user submits the comment form.
   *
   *
   * @param parentnId is the parent id. if it is not set, it would be undefined.
   */
  onSubmit(event: Event, parentId: string) {
    console.log(`parentId: ${parentId}`);
    event.preventDefault();
    this.comment.postId = this.post.id;
    this.comment.parentId = parentId;
    if (this.comment.id) {
      this.fire.comment.edit(this.comment).then(re => this.comment = {}).catch(e => alert(e.message));
    } else {
      this.fire.comment.create(this.comment).then(re => this.comment = {}).catch(e => alert(e.message));
    }
    return false;
  }

  /**
   * Returns parent id of a comment.
   * If the comment is a reply right under a post, then empty string will be returned.
   */
  // parentCommentId(commentId) {
  //   if (commentId) {
  //     const comment = this.comments(commentId);
  //     if (comment.parentId) {
  //       return comment.parentId;
  //     } else {
  //       return '';
  //     }
  //   }
  //   return '';
  // }



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
