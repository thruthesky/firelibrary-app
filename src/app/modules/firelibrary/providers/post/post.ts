import {
    Base, _,
    COLLECTIONS, POST,
    CATEGORY_DOES_NOT_EXIST, USER_IS_NOT_LOGGED_IN, CATEGORY_ID_EMPTY, POST_CREATE,
    CATEGORY,
    POST_EDIT,
    POST_ID_EMPTY,
    POST_ID_NOT_EMPTY,
    POST_DELETE,
    ALREADY_LIKED
} from './../etc/base';
import { User } from '../user/user';
import * as firebase from 'firebase';
export class Post extends Base {

    user: User;


    /// Post settings
    settings: { listenOnLikes?: boolean } = {
        listenOnLikes: false
    };
    /// navigation
    cursor: any = null; // null by default
    categoryId: string = null; // Category ID to get posts. null by default


    /// post loading by page
    pagePosts: { [id: string]: POST } = {}; // posts loaded by page indexed by key.
    pagePostIds: Array<string> = []; // posts keys loaded by page.



    ///
    _unsubscribeLikes = [];
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
    createValidator(post: POST): Promise<any> {
        if (this.user.isLogout) {
            return Promise.reject(new Error(USER_IS_NOT_LOGGED_IN));
        }
        if (post.id) {
            return Promise.reject(new Error(POST_ID_NOT_EMPTY));
        }
        if (_.isEmpty(post.category)) {
            return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        }
        return Promise.resolve(null);
    }
    createSanitizer(post: POST) {
        post.uid = this.user.uid;
        post.created = firebase.firestore.FieldValue.serverTimestamp();
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
                this.createSanitizer(post);
                return this.collection.add(post);
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
            .then(doc => this.success({ id: doc.id, post: post }))
            .catch(e => this.failure(e));
    }
    editValidator(post: POST): Promise<any> {
        if (this.user.isLogout) {
            return Promise.reject(new Error(USER_IS_NOT_LOGGED_IN));
        }
        if (_.isEmpty(post.id)) {
            return Promise.reject(new Error(POST_ID_EMPTY));
        }
        if (_.isEmpty(post.category)) {
            return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        }
        return Promise.resolve(null);
    }
    edit(post: POST): Promise<POST_EDIT> {
        return <any>this.editValidator(post)
            .then(() => {
                return this.collection.doc(post.id).update(post);
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
        return this.collection.doc(id).delete()
            .then(() => {
                return this.db.collection(COLLECTIONS.POSTS_DELETED).doc(id)
                    .set({ time: firebase.firestore.FieldValue.serverTimestamp() });
            })
            .then(() => this.success({ id: id }))
            .catch(e => this.failure(e));
    }

    /**
     * It remembers previous category for pagnation.
     * If category changes, it will clear the cursor.
     */
    categoryChanged(category): boolean {
        return this.categoryId !== category;
    }
    /**
     * For pagination.
     */
    resetCursor(category: string) {
        this.categoryId = category;
        this.cursor = null;
    }

    /**
     * Get posts for a page.
     * @desc if input `category` is given, then it opens a new category and gets posts for the first page.
     *    Otherwise it gets posts for next page.
     */
    resetLoadPage(category: string) {
        if (category) {
            if (category === 'all' || this.categoryId !== category) {
                this.pagePosts = {};
                this.unsubscribeLikes();
                this.pagePostIds = [];
                this.categoryId = category;
                this.resetCursor(category);
                this.unsubscribeLikes();
            }
        }
    }
    unsubscribeLikes() {
        if ( this._unsubscribeLikes.length ) {
            this._unsubscribeLikes.map( unsubscribe => {
                unsubscribe();
            });
        }
    }
    subscribeLikes(post: POST) {
        const subscribe = this.likeColllection(post.id).doc('count').onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                post.numberOfLikes = data.count;
                console.log('subscribleLikes: ', post.id);
            }
        });
        this._unsubscribeLikes.push(subscribe);
    }
    /**
     * Get pages.
     *
     *
     * @param
     *      options['listenOnLikes'] if set true, it listens all the posts in the list.
     */
    page(options: { category?: string, limit: number }): Promise<Array<POST>> {

        this.resetLoadPage(options.category);

        let query: any = this.collection;
        if (this.categoryId && this.categoryId !== 'all') {
            query = query.where('category', '==', this.categoryId);
        }
        query = query.orderBy('created', 'desc');
        if (this.cursor) {
            query = query.startAfter(this.cursor);
        }
        query = query.limit(options.limit);
        return query.get().then(querySnapshot => {
            if (querySnapshot.docs.length) {
                querySnapshot.forEach(doc => {
                    const post: POST = <any>doc.data();
                    post.id = doc.id;
                    post['date'] = (new Date(post.created)).toLocaleString();
                    this.pagePosts[post.id] = post;
                    this.pagePostIds.push(post.id);
                    if (this.settings.listenOnLikes) {
                        this.subscribeLikes(post);
                    }
                });
                // only one cursor is supported and normally one page has on pagination.
                this.cursor = querySnapshot.docs[querySnapshot.docs.length - 1];
                return this.pagePosts;
            } else {
                return [];
            }
        });
    }


    /**
     * Add a post on top of post list on the page
     *  - and subscribe like/dislike based on the settings.
     *
     *
     */
    addPostOnTop(post: POST) {
        this.pagePosts[post.id] = post;
        this.pagePostIds.unshift(post.id);
        if (this.settings.listenOnLikes) {
            this.subscribeLikes( post );
        }
    }

    stopLoadPage() {
        this.resetLoadPage(undefined);
        this.unsubscribeLikes();
    }
    likeColllection(id) {
        return this.collection.doc(id)
            .collection(COLLECTIONS.LIKES);
    }
    likeDocument(id) {
        return this.likeColllection(id).doc(this.user.uid);
    }



    /**
     * Validating for like to a post.
     *
     * @desc if the user did `like` already, it returns `ALREADY_LIKED` error.
     */
    likeValidator(id: string): Promise<any> {
        const idCheck = this.checkDocumentIDFormat(id);
        if (idCheck) {
            return this.failure(new Error(idCheck), { documentID: id });
        }
        return this.likeDocument(id).get()
            .then(doc => {
                if (doc.exists) {
                    console.log('likeValidator. already liked');
                    return this.failure(ALREADY_LIKED);
                } else {
                    return null; // NOT error. it resolves with not exists.
                }
            });
        // .catch(e => null); // It cannot be here. If then, ALREADY LIKE becomes NOT error.
    }
    like(id: string): Promise<any> {
        return this.likeValidator(id)
            .then(() => {
                console.log('validator passed. Going to add a like', id);
                return this.likeDocument(id).set({ time: firebase.firestore.FieldValue.serverTimestamp() });
            })
            .then(() => {
                console.log('like has been added: ', id);
                return this.countLikes(id);
            })
            .catch(e => {
                if (e.code === ALREADY_LIKED) {
                    console.log('already liked it. going to unlike : ', id);
                    return this.unlike(id);
                } else {
                    console.log('failed on other reason: ', e);
                    return this.failure(e);
                }
            });
    }


    unlike(id: string): Promise<any> {
        return this.likeDocument(id).delete()
            .then(() => {
                console.log('like has been deleted: ', id);
                return this.countLikes(id);
            })
            .catch(e => this.failure(e));
    }

    /**
     * Counts the number of Likes and saves it into `count` document.
     */
    countLikes(id) {
        return this.likeColllection(id).get()
            .then(snapshot => {
                let count = 0;
                if ( snapshot.size > 2 ) {      // if size is bigger than 2, it probablly has `count` document.
                    count = snapshot.size - 1;
                } else {                        // if size is 1 or 2, then it may not have `count` document yet.
                    snapshot.forEach(doc => {
                        if (doc && doc.exists) {
                            if (doc.id !== 'count') {
                                count++;
                            }
                        }
                    });
                }
                console.log('size: ', count);
                return this.likeColllection(id).doc('count').set({ count: count });
            })
            .then(() => {
                console.log('like counted: ', id);
            });
    }

}

