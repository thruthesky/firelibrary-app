import { POST_CREATE } from './../../modules/firelibrary/providers/etc/interface';
import { CATEGORY_ID_EMPTY, POST_ID_EMPTY } from './../../modules/firelibrary/providers/etc/error';
import {
    FireService, _, UNKNOWN, POST, CATEGORY_DOES_NOT_EXIST, CATEGORY,
    PERMISSION_DENIED, USER_IS_NOT_LOGGED_IN, POST_ID_NOT_EMPTY
} from '../../../../public_api';
import { TestTools } from './test.tools';
import * as settings from './test.settings';
import * as firebase from 'firebase';

export class TestPost extends TestTools {
    constructor(
    ) {
        super();
    }
    /**
    * Runs all post tests.
    */
    async run() {
        await this.createValidatorTest();
        await this.postCreate();
        await this.postEdit();
        await this.postDelete();
    }

    async createValidatorTest() {
        const isLogout = await this.logout();
        if (isLogout) {
            /**Validator User is not logged in. */
            await this.fire.post.create({category: settings.TEST_CATEGORY, title: 'User not logged in.'})
            .then(a => { this.bad('This should be error. user not logged in.'); })
            .catch(e => { this.test(e.code === USER_IS_NOT_LOGGED_IN, 'Cannot create post, user is not logged in.' ); });

        } else {
            this.bad('createValidatorPostTest: Test requires user to be logged out.');
        }

        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        if (isLogin) {
            /**Validator Post id should be empty */
            await this.fire.post.create({id: 'postid', category: settings.TEST_CATEGORY, title: ' Post id should be empty.'})
            .then(a => { this.bad('This should be error. post id should be empty'); })
            .catch(e => { this.test(e.code === POST_ID_NOT_EMPTY, 'Cannot create post, Post id should be empty.' ); });

            /**Validator Category should not be empty*/
            await this.fire.post.create({title: 'Category should not be empty.'})
            .then(a => { this.bad('This should be error. post id should be empty'); })
            .catch(e => { this.test(e.code === CATEGORY_ID_EMPTY, 'Cannot create post, Category should not be empty.' ); });


        } else {
            this.bad('createValidatorPostTest: Test requires user to login.');
        }
    }
    /**
    * Tests post.create()
    */
    async postCreate() {

        const data: POST = { category: settings.TEST_CATEGORY, title: 'Successful post', content: 'Successful posted in the dateabase.' };
        const isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            /**Success */
            await this.fire.post.create(data)
            .then(re => { this.good('Post created: id:'); })
            .catch(e => {  this.bad('Create post should be success.', e); });

            /**Failed with wrong category id */
            const post_1 = data;
            post_1.uid = 'wrong-uid';
            await this.fire.post.create(data)
            .then(re => { this.good('Wrong UID, firelibrary will sanitize UID.'); })
            .catch(e => {
                this.bad('post.create(): Create post with different UID', e.code );
            });

            /**Failed with wrong category id */
            const post_2 = data;
            post_2.category = 'wrong-category';
            await this.fire.post.create(data)
            .then(re => { this.bad('Wrong category, Expect error.'); })
            .catch(e => { this.good('Create post with wrong Category. Permission will be denied by rules.'); });

        } else {
            this.bad('PostCreate: Login failed');
        }

    }
    /**
    * Tests post.edit()
    */
    async postEdit() {
        const data: POST = { category: settings.TEST_CATEGORY, title: 'Successful post', content: 'Successful posted in the dateabase.' };
        const editData: POST = { title: 'Should be error. No post id or no post to edit.' };
        let id = '';

        const isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            /**Create post */
            await this.fire.post.create(data)
            .then(post => { id = post.data.id; });

            /**Edit post without post id.*/
            // console.log('POST EDIT ID IS IT MODIFIED?=======>', id);
            await this.fire.post.edit(editData)
            .then(() => { this.bad('Should be error. no post id on post.edit() test.'); })
            .catch(e => { this.test(e.code === POST_ID_EMPTY, 'Expect error. no post id on post.edit'); });

            /**Success */
            editData.id = id;
            await this.fire.post.edit(editData)
            .then(a => {
                // console.log('Updated==================>', a.data.post.updated);
                if ( a.data.post.updated instanceof firebase.firestore.FieldValue ) {
                    this.good('success post edited.');
                } else {
                    this.bad('post.updated is empty. Updating post is falsy.');
                }
            })
            .catch(e => { this.bad('Shoud be success post.edit', e); });

        } else {
            this.bad('PostCreate: Login failed');
        }

        const isLogout = await this.logout();
        if (isLogout) {
            /**User not login */
            // editData.id = id; // -> editData already modified with id.
            await this.fire.post.edit(editData)
            .then(() => { this.bad('Should be error. User not logged in.'); })
            .catch(e => { this.test(e.code === USER_IS_NOT_LOGGED_IN, 'Expect error. user not login on post.edit'); });
        } else {
            this.bad('A user is still logged in on `User not logged in test.`');
        }

    }
    /**
    * Tests post.delete().
    */
    async postDelete() {
        const data: POST = { category: settings.TEST_CATEGORY, title: 'Delete post Test', content: 'Successful posted in the dateabase.' };
        // const post: POST = {
        //     category: settings.TEST_CATEGORY,
        //     title: 'This post will be deleted',
        //     content: 'this post should be deleted for testing'
        // };
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        if (isLogin) {
            // Will create a post
            await this.fire.post.create(data)
            .then(post => {
                // Will delete post
                return this.fire.post.delete(post.data.id);
            })
            .then(del => {
                // check if deleted
                if (del.data.id) {
                    this.good('Post delete success. Deleted: ' + del.data.id);
                }
            })
            .catch(e => {
                this.bad('post.delete(0) error: ', e);
            });


        } else {
            this.bad('Error logging in on. deletePost() test');
        }
    }

}

