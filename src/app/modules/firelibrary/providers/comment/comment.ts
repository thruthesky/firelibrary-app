import {
    Base, _,
    COLLECTIONS,
    POST,
    COMMENT,
    COMMENT_CREATE,
    COMMENT_EDIT
} from './../etc/base';
import { User } from '../user/user';
import * as firebase from 'firebase';
export class Comment extends Base {

    private user: User;

    comments: { [commentId: string]: COMMENT } = {};
    commentIds: { [postId: string]: Array<string> } = {};


    /**
     * Subscribes and unsubscribes comment's likes/dislike/changes by post.
     * This is because in some cases, only few posts may be destroyed from page and
     * it detaches the listeners of those posts only.
     */
    private _unsubscribeLikes: { [postId: string]: Array<any> } = {};
    private _unsubscribeComments: { [postId: string]: Array<any> } = {};
    constructor(
    ) {
        super(COLLECTIONS.COMMENTS);
        this.user = new User();
    }


    /**
     * Comment Collection under a post.
     * @param postId the post document id.
     */
    private commentCollection(postId: string) {
        return this.collectionRef(COLLECTIONS.POSTS).doc(postId).collection(COLLECTIONS.COMMENTS);
    }
    /**
     * Returns comment reference.
     */
    private comment(postId: string, commentId: string) {
        return this.commentCollection(postId).doc(commentId);
    }

    /**
     * Loads all the comments under the postId.
     */
    load(postId: string): Promise<Array<string>> {
        const ref = this.commentCollection(postId);
        // console.log(`gets at: ${ref.path}`);
        return ref.orderBy('created').get().then(s => {
            s.forEach(doc => {
                const c: COMMENT = doc.data();
                c.id = doc.id;
                this.comments[c.id] = c;
                // @todo sort comments by thread.
                const sorted = this.sortComments(postId, c);
                this.subscribeCommentChange(postId, c);
                this.subscribeLikes(c);

            });
            // console.log('sorted: ', sorted);
            // observe like/dislike

            this.subscribeCommentAdd(postId);
            return this.commentIds[postId];
        }).catch(e => this.failure(e));
    }




    /**
     * Sorts the comments.
     * @param postId Post Document ID
     */
    sortComments(postId: string, comment: COMMENT) {
        // console.log(`sortComments: `, postId, ids);
        if (this.commentIds[postId] === void 0) {
            this.commentIds[postId] = [];
        }
        const pos = this.commentIds[postId].findIndex(id => id === comment.parentId);
        if (pos === - 1) {
            this.commentIds[postId].push(comment.id);
        } else {
            this.commentIds[postId].splice(pos, 0, comment.id);
        }
        // this.commentIds[postId].push(comment.id);
        return this.commentIds[postId];
    }

    create(comment: COMMENT): Promise<COMMENT_CREATE> {
        _.sanitize(comment);
        comment.uid = this.user.uid;
        comment.created = firebase.firestore.FieldValue.serverTimestamp();
        const ref = this.commentCollection(comment.postId);
        console.log(`Going to add a comment under: ${ref.path}`);
        return ref.add(comment)
            .then(doc => {
                return this.success({ id: doc.id });
            })
            .catch(e => {
                console.log(`failed: `, e);
                this.failure(e);
            });
    }

    edit(comment: COMMENT): Promise<COMMENT_EDIT> {
        _.sanitize(comment);
        comment.uid = this.user.uid;
        comment.postId = this.comments[comment.id].postId;
        comment.updated = firebase.firestore.FieldValue.serverTimestamp();
        const ref = this.comment(comment.postId, comment.id);
        console.log(`Going to edit : ${ref.path} with `, comment);
        return ref.update(comment).then(() => {
            return this.success({ id: comment.id });
        })
            .catch(e => this.failure(e));

    }

    /**
     * Returns collection of comment like/dislike.
     * @param commentId Comment Document ID
     * @param collectionName Subcollection name under comment
     */
    private likeColllection(commentId: string, collectionName: string) {
        const postId = this.comments[commentId].postId;
        return this.comment(postId, commentId)
            .collection(collectionName);
    }

    like(commentId: string): Promise<any> {
        return this.doLike(this.likeColllection(commentId, COLLECTIONS.LIKES));
    }

    dislike(commentId: string): Promise<any> {
        return this.doLike(this.likeColllection(commentId, COLLECTIONS.DISLIKES));
    }


    /**
     *
     */
    private subscribeCommentChange(postId: string, comment: COMMENT) {
        if (!this.settings.listenOnCommentChange) {
            return;
        }
        const unsubscribe = this.commentCollection(postId).doc(comment.id).onSnapshot(doc => {
            comment = Object.assign(comment, doc.data());
        });
        this.pushCommentChangeSubscriber(postId, unsubscribe);
    }
    private subscribeCommentAdd(postId: string) {
        if (!this.settings.listenOnCommentChange) {
            return;
        }
        const path = this.commentCollection(postId).path;
        console.log(`watch for new comment: ${path}`);
        const unsubscribe = this.commentCollection(postId).orderBy('created', 'desc').limit(1).onSnapshot(snapshot => {

            console.log('watch the lastest comment: ');
            snapshot.docChanges.forEach(change => {
                const doc = change.doc;
                if (doc.metadata.hasPendingWrites) {
                    console.log('pending', doc.metadata.hasPendingWrites, 'from cache: ', doc.metadata.fromCache);
                } else {
                    console.log('pending', doc.metadata.hasPendingWrites, 'type: ', change.type,
                        'from cache: ', doc.metadata.fromCache, doc.data());
                    const comment: COMMENT = doc.data();
                    comment.id = doc.id;
                    // console.log(`exists: ${this.pagePosts[post.id]}`);
                    if (change.type === 'added' && this.comments[comment.id] === void 0) {
                        this.addCommentOnTop(postId, comment);
                    } else if (change.type === 'modified') {
                        this.updateComment(postId, comment);
                    } else if (change.type === 'removed') {
                        this.removeComment(comment);
                    }
                }
            });
        });
        this.pushCommentChangeSubscriber(postId, unsubscribe);
    }
    private pushCommentChangeSubscriber(postId, unsubscribe) {
        if (this._unsubscribeComments[postId] === void 0) {
            this._unsubscribeComments[postId] = [];
        }
        this._unsubscribeComments[postId].push(unsubscribe);
    }

    /**
     * Add a newly created post on top of post list on the page
     *  - and subscribe post changes if `settings.listenPostChange` is set to true.
     *  - and subscribe like/dislike based on the settings.
     *
     * @desc It's important to understand how `added` event fired on `onSnapshot)`.
     *
     */
    private addCommentOnTop(postId, comment: COMMENT) {
        if (this.comments[comment.id] === void 0) {
            console.log(`addCommentOnTop: `, comment);
            this.comments[comment.id] = comment;
            this.sortComments(postId, comment);
            this.subscribeCommentChange(postId, comment);
            this.subscribeLikes(comment);
        }
    }
    /**
     * When listening the last post on collection in realtime, it often fires `modified` event on new docuemnt created.
     */
    private updateComment(postId, comment: COMMENT) {
        console.log('updateComment id: ', comment.id);
        if (this.comments[comment.id]) {
            console.log(`updateComment`, comment);
            this.comments[comment.id] = Object.assign(this.comments[comment.id], comment);
        } else {
            this.addCommentOnTop(postId, comment);
        }
    }
    /**
     * This method is no longer in use.
     *
     * @deprecated @see README### No post delete.
     */
    private removeComment(comment: COMMENT) {
    }


    private subscribeLikes(comment: COMMENT) {
        if (!this.settings.listenOnCommentLikes) {
            return;
        }
        const likeRef = this.likeColllection(comment.id, COLLECTIONS.LIKES).doc('count');
        // console.log('subscribe on likes: ', post.id, `path: ${likeRef.path}`);
        const subscribeLike = likeRef.onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                comment.numberOfLikes = data.count;
            }
        });
        // this._unsubscribeLikes.push(subscribeLik);
        this.pushCommentLikeSubscriber(comment.postId, subscribeLike);

        const dislikeRef = this.likeColllection(comment.id, COLLECTIONS.DISLIKES).doc('count');
        // console.log('subscribe on dislikes: ', post.id, `path: ${dislikeRef.path}`);
        const subscribeDislike = dislikeRef.onSnapshot(doc => {
            // console.log('changed on dislike: ', doc);
            if (doc.exists) {
                const data = doc.data();
                comment.numberOfDislikes = data.count;
            }
        });
        // this._unsubscribeLikes.push(subscribeDislike);
        this.pushCommentLikeSubscriber(comment.postId, subscribeDislike);
    }

    private pushCommentLikeSubscriber(postId, unsubscribe) {
        if (this._unsubscribeLikes[postId] === void 0) {
            this._unsubscribeLikes[postId] = [];
        }
        this._unsubscribeLikes[postId].push(unsubscribe);
    }


    /**
     * Unsubscribe for the realtime update of changes/likes/dislikes.
     * If you don't unsubscribe, you have to pay more since it will still listen(read) the documents that are no longer needed.
     */
    unsubscribes(postId) {
        if (this._unsubscribeComments[postId] !== void 0 && this._unsubscribeComments[postId].length) {
            this._unsubscribeComments[postId].map(unsubscribe => unsubscribe());
        }
        if (this._unsubscribeLikes[postId] !== void 0 && this._unsubscribeLikes[postId].length) {
            this._unsubscribeLikes[postId].map(unsubscribe => unsubscribe());
        }
    }

    /**
     * Destroys all the resources that were used to display comments of a post.
     * @desc it should be called from `OnDestroy` of the comment component
     *      or anywhere you want to destroy the comments that belong to the post.
     */
    destory(post: POST) {
        console.log(`Going to destroy comments for post.id: `, post.id);
        this.unsubscribes(post.id);
    }

}

