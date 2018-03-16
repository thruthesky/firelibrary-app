import {
    Base, _,
    COLLECTIONS, POST,
    CATEGORY_DOES_NOT_EXIST, USER_IS_NOT_LOGGED_IN, CATEGORY_ID_EMPTY, POST_CREATE,
    CATEGORY,
    POST_EDIT,
    POST_ID_EMPTY,
    POST_ID_NOT_EMPTY
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
     * Validates the input data for creating a post.
     * @desc it does not check if the category exists for efficiency. It is done in `transaction`.
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
            .then(doc => this.success({ id: doc.id, post: post}))
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

