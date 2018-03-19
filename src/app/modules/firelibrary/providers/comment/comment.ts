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
        console.log(`gets at: ${ref.path}`);
        return ref.get().then(s => {
            const commentIds = [];
            s.forEach(doc => {
                const c: COMMENT = doc.data();
                c.id = doc.id;
                this.comments[c.id] = c;
                commentIds.push(c.id);

                if (this.settings.listenOnCommentChange) {
                    this.subscribeCommentChange(postId, c);
                }
            });
            // @todo sort comments by thread.
            const sorted = this.sortComments(postId, commentIds);
            console.log('sorted: ', sorted);
            // observe like/dislike

            this.subscribeCommentAdd(postId);
            return sorted;
        }).catch(e => this.failure(e));
    }




    /**
     * Sorts the comments.
     * @param postId Post Document ID
     */
    sortComments(postId: string, ids: Array<string>) {
        // console.log(`sortComments: `, postId, ids);
        this.commentIds[postId] = [];
        //
        // if (_.isEmpty(this.comments[postId])) {
        //     return;
        // }
        ids.map(commentId => {
            const comment: COMMENT = this.comments[commentId];
            // console.log(`comment..: `, comment);
            if (_.isEmpty(comment.parentCommentId)) {
                this.commentIds[postId].push(comment.id);
            } else {
                console.log(`Children. find parent id in the array and insert it right afetr.`);
            }
        });
        return this.commentIds[postId];
    }

    create(comment: COMMENT): Promise<any> {
        _.sanitize(comment);
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
        // const path = this.commentCollection(postId).path;
        // const unsubscribe = this.commentCollection(postId).onSnapshot(doc => {
        //     console.log('Observe new comments on :', path, doc.data());
        //     post = Object.assign(post, doc.data());
        // });
        // this._unsubscribePosts.push(unsubscribe);
    }
}

