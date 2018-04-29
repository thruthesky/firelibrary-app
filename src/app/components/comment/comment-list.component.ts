/**
 * There are good examples.
 * @see README##Examples
 */
import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FireService, POST, COMMENT } from '../../modules/firelibrary/core';



@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html'
})
export class CommentListComponent implements OnInit, OnDestroy {

    @Input() post: POST = {};
    comment: COMMENT;
    loader = {
        creating: false,
        commentList: false
    };
    constructor(
        public ngZone: NgZone,
        public fire: FireService
    ) {
        this.initComment();
    }

    initComment() {
        this.comment = { id: this.fire.comment.getId(), data: [] };
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
        this.loader.commentList = true;
        this.fire.comment.load(this.post.id).then(comments => {
            // console.log(`comments: `, comments);
            this.loader.commentList = false;
            setTimeout(() => this.ngZone.run(() => {}), 2000);
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
        this.loader.creating = true;
        this.fire.comment.create(this.comment).then(re => {
            this.initComment();
            this.loader.creating = false;
        }).catch(e => {
            this.loader.creating = false;
            alert(e.message);
        });
        return false;
    }

}
