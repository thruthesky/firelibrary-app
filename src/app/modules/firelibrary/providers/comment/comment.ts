import {
    Base, _,
    COLLECTIONS,
    POST,
    COMMENT
} from './../etc/base';
import { User } from '../user/user';
import * as firebase from 'firebase';
import { post } from 'selenium-webdriver/http';
export class Comment extends Base {

    private user: User;

    comments: { [commentId: string]: COMMENT } = {};
    commentIds: { [postId: string]: Array<string> } = {};



    ///
    private _unsubscribeLikes = [];
    private _unsubscribeComments = [];
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
        return this.db.collection(COLLECTIONS.POSTS).doc(postId).collection(COLLECTIONS.COMMENTS);
    }

    /**
     * Loads all the comments under the postId.
     */
    load(postId: string): Promise<Array<string>> {
        const ref = this.commentCollection(postId);
        // console.log(`gets at: ${ref.path}`);
        return ref.get().then(s => {
            const commentIds = [];
            s.forEach(doc => {
                const c: COMMENT = doc.data();
                c.id = doc.id;
                this.comments[c.id] = c;
                commentIds.push(c.id);
                // @todo sort comments by thread.
                const sorted = this.sortComments(postId, c.id);
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
    sortComments(postId: string, commentId: string) {
        // console.log(`sortComments: `, postId, ids);
        if (this.commentIds[postId] === void 0) {
            this.commentIds[postId] = [];
        }
        //
        // if (_.isEmpty(this.comments[postId])) {
        //     return;
        // }
        // ids.map(commentId => {
        //     const comment: COMMENT = this.comments[commentId];
        //     // console.log(`comment..: `, comment);
        //     if (_.isEmpty(comment.parentCommentId)) {
        //         this.commentIds[postId].push(comment.id);
        //     } else {
        //         console.log(`Children. find parent id in the array and insert it right afetr.`);
        //     }
        // });

        this.commentIds[postId].push(commentId);
        return this.commentIds[postId];
    }

    create(comment: COMMENT): Promise<any> {
        _.sanitize(comment);
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

    /**
     * Returns collection of comment like/dislike.
     * @param commentId Comment Document ID
     * @param collectionName Subcollection name under comment
     */
    private likeColllection(postId: string, collectionName: string) {
        return this.collection.doc(postId)
            .collection(collectionName);
    }
    private likeDocument(postId: string, collectionName: string) {
        console.log(`likeDocument(postId: ${postId}, collectionName: ${collectionName}`);
        const ref = this.likeColllection(postId, collectionName).doc(this.user.uid);
        console.log(`path: `, ref.path);
        return ref;
    }


    /**
     * @todo when does it need to detach all the subscriptons?
     */
    private subscribeCommentChange(postId: string, comment: COMMENT) {
        if (!this.settings.listenOnCommentChange) {
            return;
        }
        const unsubscribe = this.commentCollection(postId).doc(comment.id).onSnapshot(doc => {
            comment = Object.assign(comment, doc.data());
        });
        this._unsubscribeComments.push(unsubscribe);
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
        this._unsubscribeComments.push(unsubscribe);

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
            this.sortComments(postId, comment.id);
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


    subscribeLikes(comment: COMMENT) {

    }
}

