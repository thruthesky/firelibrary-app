import {
    Base, _,
    COLLECTIONS, POST, PERMISSION_DENIED,
    CATEGORY_DOES_NOT_EXIST, USER_IS_NOT_LOGGED_IN, CATEGORY_ID_EMPTY, POST_CREATE,
    CATEGORY,
    POST_EDIT,
    POST_ID_EMPTY,
    POST_ID_NOT_EMPTY,
    POST_DELETE,
    ALREADY_LIKED,
    POST_DELETED
} from './../etc/base';
import { User } from '../user/user';
import * as firebase from 'firebase';
export class Post extends Base {

    /**
     * User class object.
     */
    private user: User;


    /**
     * Navigation
     * `cursor` is indicating where to load from. It is null by default.
     */
    private cursor: any = null;
    /**
     * Navigation
     * `categoryId` holds the selected category id to load and display posts from.
     * null by default
     */
    public categoryId: string = null;


    /**
     * Posts and its IDs that have been loaded by `page()`.
     * Since object has no sequence, `pagePostIds` is holding the keys of the posts in order.
     * These are public variasble which should be used on list component to display posts.
     */
    pagePosts: { [id: string]: POST } = {}; // posts loaded by page indexed by key.
    pagePostIds: Array<string> = []; // posts keys loaded by page.



    /**
     * Subscribing changes for realtime update.
     */
    private _unsubscribeLikes = [];
    private _unsubscribePosts = [];
    private unsubscribePage = null;

    constructor(
    ) {
        super(COLLECTIONS.POSTS);
        this.user = new User();
    }


    /**
     * Validates the input data for creating a post.
     * @desc validate the input for creating a post.
     * @desc Don't check if the category id is really exists. Normally this won't make a trouble.
     */
    private createValidator(post: POST): Promise<any> {
        if (this.user.isLogout) {
            return Promise.reject(new Error(USER_IS_NOT_LOGGED_IN));
        }
        if (post.id) {
            return Promise.reject(new Error(POST_ID_NOT_EMPTY));
        }
        if (_.isEmpty(post.category)) {
            return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        }
        // if ( !_.isEqual(post.uid, this.user.uid) ) {
        //     return this.failure(PERMISSION_DENIED, {info: 'You cannot post on behalf of other users.'});
        // }
        return Promise.resolve(null);
    }
    private createSanitizer(post: POST) {
        _.sanitize(post);
        post.uid = this.user.uid;
        post.created = firebase.firestore.FieldValue.serverTimestamp();
        // console.log(post);
        return post;
    }
    /**
     * Creates a post.
     * @desc if `post.id` exists, then it rejects.
     * @returns Promise<POST_CREATE> with Document ID if success.
     * @since 2018-03-16 Category.numberOfPosts were removed. @see README## Client Side Coding Limitation and PUBLIC META DATA
     */
    create(post: POST): Promise<POST_CREATE> {
        return this.createValidator(post)
            .then(() => {
                return this.collection.add(this.createSanitizer(post));
                // const categoryRef = this.db.collection(COLLECTIONS.CATEGORIES).doc(post.category);
                // const postRef = this.db.collection(COLLECTIONS.POSTS).doc();
                // return <any>this.db.runTransaction(t => {
                //     return t.get(categoryRef)
                //         .then(category => {
                //             if (!category.exists) {
                //                 throw CATEGORY_DOES_NOT_EXIST;
                //             }
                //             const categoryData = <CATEGORY>category.data();
                //             if (categoryData.numberOfPosts === void 0) {
                //                 categoryData.numberOfPosts = 1;
                //             } else {
                //                 categoryData.numberOfPosts++;
                //             }
                //             t
                //                 .set(categoryRef, categoryData)
                //                 .set(postRef, post);
                //             return postRef.id;
                //         });
                // });
            })
            .then(doc => {
                return this.success({ id: doc.id, post: post });
            })
            .catch(e => this.failure(e));
    }

    /**
     * Validates edit.
     * @desc on edit, category can be empty.
     */
    private editValidator(post: POST): Promise<any> {
        if (this.user.isLogout) {
            return Promise.reject(new Error(USER_IS_NOT_LOGGED_IN));
        }
        if (_.isEmpty(post.id)) {
            return Promise.reject(new Error(POST_ID_EMPTY));
        }
        // if (_.isEmpty(post.category)) {
        //     return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        // }
        return Promise.resolve(null);
    }
    edit(post: POST): Promise<POST_EDIT> {
        return <any>this.editValidator(post)
            .then(() => {
                _.sanitize(post);
                post.updated = firebase.firestore.FieldValue.serverTimestamp();
                const ref = this.collection.doc(post.id);
                console.log('update at: ', ref.path);
                return ref.update(post);
            })
            .then(() => {
                return this.success({ id: post.id, post: post });
            })
            .catch(e => this.failure(e));
    }



    /**
     * Deletes a post.
     *
     * @desc It puts the post id under `posts_deleted` to indicate that the post has been deleted.
     * @see REAMEMD## posts_deleted collection
     * @todo test on deleting and marking.
     */
    delete(id: string): Promise<POST_DELETE> {
        const post: POST = {
            id: id,
            title: POST_DELETED,
            content: POST_DELETED
        };
        return this.edit(post);
        // return this.collection.doc(id).delete()
        //     .then(() => {
        //         return this.db.collection(COLLECTIONS.POSTS_DELETED).doc(id)
        //             .set({ time: firebase.firestore.FieldValue.serverTimestamp() });
        //     })
        //     .then(() => this.success({ id: id }))
        //     .catch(e => this.failure(e));
    }


    /**
     * It remembers previous category for pagnation.
     * If category changes, it will clear the cursor.
     */
    private categoryChanged(category): boolean {
        return this.categoryId !== category;
    }
    /**
     * For pagination.
     *
     */
    private resetCursor(category: string) {
        this.categoryId = category;
        this.cursor = null;
    }

    /**
     * Get posts for a page.
     * @desc if input `category` is given, then it opens a new category and gets posts for the first page.
     *    Otherwise it gets posts for next page.
     *
     * @returns true if the category has been chagned and reset. other wise false.
     */
    private resetLoadPage(category: string) {
        let reset = false;
        if (category) {
            if (category === 'all' || this.categoryId !== category) { /// new category. Category has changed to list(load pages)
                this.pagePosts = {};
                this.pagePostIds = [];
                this.categoryId = category;
                this.resetCursor(category);
                this.unsubscribePosts();
                this.unsubscribeLikes();
                reset = true;
            }
        }
        return reset;
    }
    /**
     * Unsubscribe all the posts.
     */
    private unsubscribePosts() {
        if (this._unsubscribePosts.length) {
            this._unsubscribePosts.map(unsubscribe => unsubscribe());
        }
    }
    private unsubscribeLikes() {
        if (this._unsubscribeLikes.length) {
            this._unsubscribeLikes.map(unsubscribe => {
                unsubscribe();
            });
        }
    }

    private subscribePostChange(post: POST) {

        if (!this.settings.listenOnPostChange) {
            return;
        }

        const path = this.post(post.id).path;
        const unsubscribe = this.post(post.id).onSnapshot(doc => {
            // console.log('Update on :', path, doc.data());
            post = Object.assign(post, doc.data());
        });
        this._unsubscribePosts.push(unsubscribe);
    }
    /**
     * Subscribes for likes/dislikes
     * @param post post to subscribe for like, dislike
     */
    private subscribeLikes(post: POST) {

        if (!this.settings.listenOnPostLikes) {
            return;
        }
        const likeRef = this.likeColllection(post.id, COLLECTIONS.LIKES).doc('count');
        // console.log('subscribe on likes: ', post.id, `path: ${likeRef.path}`);
        const subscribeLik = likeRef.onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                post.numberOfLikes = data.count;
            }
        });
        this._unsubscribeLikes.push(subscribeLik);


        const dislikeRef = this.likeColllection(post.id, COLLECTIONS.DISLIKES).doc('count');
        // console.log('subscribe on dislikes: ', post.id, `path: ${dislikeRef.path}`);
        const subscribeDislike = dislikeRef.onSnapshot(doc => {
            // console.log('changed on dislike: ', doc);
            if (doc.exists) {
                const data = doc.data();
                post.numberOfDislikes = data.count;
            }
        });
        this._unsubscribeLikes.push(subscribeDislike);
    }

    /**
     * Get pages.
     *
     *
     * @param
     *      options['listenOnLikes'] if set true, it listens all the posts in the list.
     */
    page(options: { category?: string, limit: number }): Promise<Array<POST>> {
        const reset = this.resetLoadPage(options.category);
        let query: firebase.firestore.Query = <any>this.collection;
        if (this.categoryId && this.categoryId !== 'all') {
            query = query.where('category', '==', this.categoryId);
        }
        query = query.orderBy('created', 'desc');
        if (this.cursor) {
            query = query.startAfter(this.cursor);
        }
        query = query.limit(options.limit);
        return <any>query.get().then(querySnapshot => {
            if (querySnapshot.docs.length) {
                querySnapshot.forEach(doc => {
                    const post: POST = <any>doc.data();
                    post.id = doc.id;
                    post['date'] = (new Date(post.created)).toLocaleString();
                    this.pagePosts[post.id] = post;
                    this.pagePostIds.push(post.id);
                    this.subscribePostChange(post);
                    this.subscribeLikes(post);
                });
                // only one cursor is supported and normally one page has on pagination.
                this.cursor = querySnapshot.docs[querySnapshot.docs.length - 1];


                // @see comment on subscribeNewPost()
                if (reset) {
                    this.subscribePostAdd(query);
                }
                return this.pagePosts;
            } else {
                return [];
            }
        });
    }


    /**
     * Listens on new post only. It does not listen for edit/delete.
     *  It subscribes added/updated/removed only after loading/displaying the post list.
     *  In this way, it prevents double display of the last post.
     */
    private subscribePostAdd(query: firebase.firestore.Query) {
        if (!this.settings.listenOnPostChange) {
            return;
        }
        if (this.unsubscribePage) {
            this.unsubscribePage();
        }
        this.unsubscribePage = query.limit(1).onSnapshot(snapshot => {
            snapshot.docChanges.forEach(change => {
                const doc = change.doc;
                if (doc.metadata.hasPendingWrites) {

                    console.log('pending', doc.metadata.hasPendingWrites, 'from cache: ', doc.metadata.fromCache);

                } else {
                    console.log('pending', doc.metadata.hasPendingWrites, 'type: ', change.type,
                        'from cache: ', doc.metadata.fromCache, doc.data());
                    const post: POST = doc.data();
                    post.id = doc.id;
                    console.log(`exists: ${this.pagePosts[post.id]}`);
                    if (change.type === 'added' && this.pagePosts[post.id] === void 0) {
                        this.addPostOnTop(post);
                    } else if (change.type === 'modified') {
                        this.updatePost(post);
                    } else if (change.type === 'removed') {
                        this.removePost(post);
                    }
                }
            });
        });
    }


    /**
     * Add a newly created post on top of post list on the page
     *  - and subscribe post changes if `settings.listenPostChange` is set to true.
     *  - and subscribe like/dislike based on the settings.
     *
     * @desc It's important to understand how `added` event fired on `onSnapshot)`.
     *
     */
    private addPostOnTop(post: POST) {
        if (this.pagePosts[post.id] === void 0) {
            console.log(`addPostOnTop: `, post);
            this.pagePosts[post.id] = post;
            this.pagePostIds.unshift(post.id);
            this.subscribePostChange(post);
            this.subscribeLikes(post);
        }
    }
    /**
     * When listening the last post on collection in realtime, it often fires `modified` event on new docuemnt created.
     */
    private updatePost(post: POST) {
        console.log('updatePost id: ', post.id);
        if (this.pagePosts[post.id]) {
            console.log(`updatePost`, post);
            this.pagePosts[post.id] = Object.assign(this.pagePosts[post.id], post);
        } else {
            this.addPostOnTop(post);
        }
    }
    /**
     * This method is no longer in use.
     *
     * @deprecated @see README### No post delete.
     */
    private removePost(post: POST) {
        // if (this.pagePosts[post.id]) {
        //     console.log(`deletePost`, post);
        //     this.pagePosts[post.id].title = 'deleted???';
        //     // delete this.pagePosts[post.id];
        // }
    }

    stopLoadPage() {
        this.resetLoadPage(undefined);
        this.unsubscribeLikes();
        this.unsubscribePosts();
    }
    /**
     * Returns post docuement reference.
     */
    private post(postId: string) {
        return this.collection.doc(postId);
    }
    /**
     * Returns collection of like/dislike.
     * @param postId Post Document ID
     * @param collectionName Subcollection name
     */
    private likeColllection(postId: string, collectionName: string) {
        return this.collection.doc(postId)
            .collection(collectionName);
    }

    like(postId: string): Promise<any> {
        return this.doLike(this.likeColllection(postId, COLLECTIONS.LIKES));
    }

    dislike(postId: string): Promise<any> {
        return this.doLike(this.likeColllection(postId, COLLECTIONS.DISLIKES));
    }

}

