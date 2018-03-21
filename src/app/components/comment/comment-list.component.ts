import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FireService, POST, COMMENT } from '../../../../public_api';


@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html'
})
export class CommentListComponent implements OnInit, OnDestroy {

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
     * Creates a comment.
     * This is being invoked when user submits the comment form.
     *
     *
     */
    onSubmit(event: Event) {
        event.preventDefault();
        this.comment.postId = this.post.id;
        this.comment.parentId = '';
        this.fire.comment.create(this.comment).then(re => this.comment = {}).catch(e => alert(e.message));
        return false;
    }


    //   onClickLike(id: string) {
    //     this.fire.comment.like(id).then(re => {
    //       // console.log(`comment like. re: `, re);
    //     }).catch(e => alert(e.message));
    //   }
    //   onClickDislike(id: string) {
    //     this.fire.comment.dislike(id).then(re => {
    //       // console.log(`comment dislike. re: `, re);
    //     })
    //       .catch(e => alert(e.message));
    //   }

}
