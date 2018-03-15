import {
    Base, COLLECTIONS, POST,
    POST_ID_EXISTS, CATEGORY_DOES_NOT_EXIST, USER_IS_NOT_LOGGED_IN, CATEGORY_ID_EMPTY, POST_CREATE, CATEGORY
} from './../etc/base';
import { User } from '../user/user';
import * as firebase from 'firebase';
export class Post extends Base {

    user: User;

    /// navigation
    cursor: any = null;
    prevCategory: string = null;
    constructor(
    ) {
        super(COLLECTIONS.POSTS);
        this.user = new User();
    }

    /**
     * Creates a post.
     * @desc if `post.id` exists, then it rejects.
     * @returns Promise<string> with Document ID if success.
     */
    createValidator(post: POST): Promise<any> {
        if (this.user.isLogout) {
            return Promise.reject(new Error(USER_IS_NOT_LOGGED_IN));
        }
        if (post.id) {
            return Promise.reject(new Error(POST_ID_EXISTS));
        }
        if (!post.category) {
            return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        }
        return Promise.resolve(null);
    }
    create(post: POST): Promise<POST_CREATE> {
        return this.createValidator(post)
            .then(() => {
                post.uid = this.user.uid;
                post.created = firebase.firestore.FieldValue.serverTimestamp();
                const postRef = this.db.collection(COLLECTIONS.POSTS).doc();
                const categoryRef = this.db.collection(COLLECTIONS.CATEGORIES).doc(post.category);
                return <any>this.db.runTransaction(t => {
                    return t.get(categoryRef)
                        .then(category => {
                            if (!category.exists) {
                                throw CATEGORY_DOES_NOT_EXIST;
                            }
                            const categoryData = <CATEGORY>category.data();
                            if (categoryData.numberOfPosts === void 0) {
                                categoryData.numberOfPosts = 1;
                            } else {
                                categoryData.numberOfPosts++;
                            }
                            t
                                .set(categoryRef, categoryData)
                                .set(postRef, post);
                            return postRef.id;
                        });
                });
            })
            .then(id => this.success(id))
            .catch(e => this.failure(e));
    }
    /**
     * @deprecated
     */
    // createOld(post: POST): Promise<string> {
    //     return this.createValidator(post)
    //         .then(() => {
    //             post.uid = this.user.uid;
    //             post.created = firebase.firestore.FieldValue.serverTimestamp();
    //             return this.collection.add(post);
    //         })
    //         .then(doc => doc.id)
    //         .catch(e => this.failure(e));
    // }


    /**
     * It remembers previous category for pagnation.
     * If category changes, it will clear the cursor.
     */
    categoryChanged(category): boolean {
        return this.prevCategory !== category;
    }
    /**
     * For pagination.
     */
    resetCursor(category) {
        this.prevCategory = category;
        this.cursor = null;
    }

    /**
     *
     */
    page(options: { category: string, limit: number }): Promise<Array<POST>> {
        console.log('options:', options);
        if (this.categoryChanged(options.category)) {
            this.resetCursor(options.category);
        }
        let query;
        if (this.cursor) {
            query = this.collection
                .where('category', '==', options.category)
                .orderBy('created', 'desc')
                .startAfter(this.cursor)
                .limit(options.limit);
        } else {
            query = this.collection
                .where('category', '==', options.category)
                .orderBy('created', 'desc')
                .limit(options.limit);
        }
        return query.get().then(querySnapshot => {
            const posts: Array<POST> = [];
            if (querySnapshot.docs.length) {
                querySnapshot.forEach(doc => {
                    const post: POST = <any>doc.data();
                    post.id = doc.id;
                    posts.push(post);
                });
                // only one cursor is supported and normally one page has on pagination.
                this.cursor = querySnapshot.docs[querySnapshot.docs.length - 1];
                return posts;
            } else {
                return [];
            }
        });
    }

}

