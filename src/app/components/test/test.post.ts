import {
    FireService, _, UNKNOWN, POST, CATEGORY_DOES_NOT_EXIST, CATEGORY,
    PERMISSION_DENIED, USER_IS_NOT_LOGGED_IN, POST_ID_NOT_EMPTY,
    POST_ID_EMPTY, CATEGORY_EXISTS, POST_ALREADY_DELETED, COLLECTIONS
} from './../../modules/firelibrary/core';
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
        await this.createTest();
        await this.editTest();
        await this.deleteTest();
        await this.pageTest();
        // await this.postLike();
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
            /**Validator Post id should not be empty */
            await this.fire.post.create({id: '', category: settings.TEST_CATEGORY, title: ' Post id should not be empty.'})
            .then(a => { this.bad('This should be error. post id should not be empty'); })
            .catch(e => { this.test(e.code === POST_ID_EMPTY, 'Cannot create post, Post id is empty.' ); });

            /**Validator Category should not be empty*/
            await this.fire.post.create({title: 'Category should not be empty.'})
            .then(a => { this.bad('Category should not be empty'); })
            .catch(e => { this.test(e.code, 'Cannot create post, Category should not be empty.', e ); });


        } else {
            this.bad('createValidatorPostTest: Test requires user to login.');
        }
    }
    /**
    * Tests post.create()
    */
    async createTest() {

        const post: POST = {
            category: settings.TEST_CATEGORY,
            title: 'Successful post',
            content: 'Successful posted in the dateabase.'
        };
        const id = 'post-' + (new Date).getTime();

        const isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            /**Success */
            post.id = id;
            await this.fire.post.create(post)
            .then(re => { this.good('Post created: id:'); })
            .catch(e => {  this.bad('Create post should be success.', e); });

            /**Failed with wrong category id */
            post.uid = 'wrong-uid';
            post.id = id;
            await this.fire.post.create(post)
            .then(re => { this.good('Wrong UID, firelibrary will sanitize UID.'); })
            .catch(e => {
                this.bad('post.create(): Create post with different UID', e.code );
            });

            /**Create with the same Post ID with wrong category.*/
            post.id = id;
            post.category = 'xx-category-xx';
            await this.fire.post.create(post)
            .then(re => { this.bad('Wrong category, Post is overwritten with wrong category', re); })
            .catch(e => {
                this.test(e.code === PERMISSION_DENIED, 'Create post with wrong Category. Permission will be denied by rules.');
            });

            // Falsy - Able to create post even if category is not existing.
            /**Failed with wrong category id */
            post.id = id + 'x-category';
            post.category = 'xx-category-xx';
            await this.fire.post.create(post)
            .then(re => { this.bad('Wrong category, Expect error.', re); })
            .catch(e => {
                this.test(e.code === PERMISSION_DENIED, 'Create post with wrong Category. Permission will be denied by rules.');
            });

        } else {
            this.bad('PostCreate: Login failed');
        }

    }
    /**
    * Tests post.edit()
    */
    async editTest() {
        const post: POST = { category: settings.TEST_CATEGORY, title: 'Successful post', content: 'Successful posted in the dateabase.' };
        const editData: POST = { title: 'Updated!' };
        const id = 'post' + (new Date).getTime();
        let isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            /**Create post */
            post.id = id;
            await this.fire.post.create(post)
            .then(p => {  });

            /**Edit post without post id.*/
            delete post.id;
            await this.fire.post.edit(editData)
            .then(() => { this.bad('Should be error. no post id on post.edit() test.'); })
            .catch(e => { this.test(e.code === POST_ID_EMPTY, 'Expect error. no post id on post.edit'); });

            /**Success */
            post.title = editData.title;
            post.id = id;
            await this.fire.post.edit(post)
            .then(a => {
                if ( a.data.post.updated instanceof firebase.firestore.FieldValue && a.data.post === post ) {
                    this.good('success post edited.');
                } else {
                    this.bad('Updating post is falsy. Fields that are missing are deleted.');
                }
                return a;
            })
            .catch(e => { this.bad('Shoud be success post.edit', e); });
        } else {
            this.bad('PostCreate: Login failed');
        }

        const isLogout = await this.logout();
        if (isLogout) {
            /**User not login */
            // post.id = id; // -> post already modified with id.
            await this.fire.post.edit(post)
            .then(() => { this.bad('Should be error. User not logged in.'); })
            .catch(e => { this.test(e.code === USER_IS_NOT_LOGGED_IN, 'Expect error. user not login on post.edit'); });
        } else {
            this.bad('A user is still logged in on `User not logged in test.`');
        }

        /**Edit post again with different user */
        isLogin = await this.loginAs('otheruser@test.com', 'other123');
        if (isLogin) {
            post.title = 'Edited by other USER';
            post.id = id;
            await this.fire.post.edit( post )
            .then(() => {
                this.bad('This should be error Permission denied. Other Users can\'t update others data');
            })
            .catch(e => {
                this.test(e.code === PERMISSION_DENIED, 'Other users can\'t modify others data.');
            });
        }

    }
    /**
    * Tests post.delete().
    */
    async deleteTest() {
        const data: POST = { category: settings.TEST_CATEGORY, title: 'Delete post Test', content: 'Successful posted in the dateabase.' };
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        const id = 'post' + (new Date).getTime();
        if (isLogin) {
            /**Delete on wrong post ID */
            await this.fire.post.delete('wrong-post-id')
            .then(a => { this.bad('Should be error, post ID is incorrect or not existing.', a); })
            .catch(e => { this.test(e.code === PERMISSION_DENIED, 'Wrong post ID to delete.', e.code); });
            /** Will create a post */
            data.id = id;
            await this.fire.post.create(data)
            .then(post => {
                // Will delete post
                return this.fire.post.delete(id);
            })
            .then(del => {
                // check if deleted
                if (del.data.id) {
                    this.good('Post delete success. Deleted: ' + del.data.id);
                }
            })
            .catch(e => {
                this.bad('post.delete() error: ', e.code);
            });

            /** Test delete using different user account and as Anonymous. */

            data.id = id + 'a';
            await this.fire.post.create(data)
            /**Delete as anonymous */
            .then(async post => {
                const logout = await this.logout();
                if (logout) {
                    await this.fire.post.delete(post.data.id)
                    .then( del => { this.bad('Should be error: Anonymous cannot delete post.'); })
                    .catch(e => { this.test(e.code === PERMISSION_DENIED, 'Anonymous are not allowed to delete a post.'); });
                } else {
                    this.bad('Error logout on deleting post as anonymous.');
                }
                return post;
            })
            /**Delete post as other user. */
            .then( async post => {
                const loginAgain = await this.loginAs('UserDeleteTest@test.com', 'userDelete123');
                if (loginAgain) {
                    await this.fire.post.delete(post.data.id)
                    .then( del => { this.bad('Should be error: Deleting post that you don\'t own.'); })
                    .catch( e => { this.test(e.code === PERMISSION_DENIED, 'User cannot delete other user\'s post'); } );
                } else {
                    this.bad('Error login for 2nd time to delete as different user.');
                }
            });

        } else {
            this.bad('Error logging in on. deletePost() test');
        }

    }

    /**
    * Tests post.page()
    */
    async pageTest() {
        /**Create 2 categories and populate each with 10 post */
        let cat;
        const category = <CATEGORY>{};
        const category_list = [];
        for ( cat = 0; cat <= 2; cat++ ) {
            // Category creation
            const isLogin = await this.loginAsAdmin();
            if (isLogin) {
                category.id = 'category_' + cat;
                category.name = 'Category' + cat;
                category_list.push(category.id);
                await this.fire.category.create(category)
                .then(async re => {
                const isMember = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
                if (isMember ) {
                    let post;
                    const data: POST = { category: category.id,  };
                    for ( post = 0; post <= 10; post++ ) { // will post 11 times in a category;
                        data.id = 'post_' + post + '_' + category.id;
                        data.title = 'Post_' + post;
                        data.content = 'This is Post_' + post;
                        await this.fire.post.create(data);
                    }
                } else {
                    this.bad('Failed to login as member on postPage post creation');
                }
                })
                .catch(e => { this.test(e.code === CATEGORY_EXISTS, 'Posts are good for Post::page() testing'); return e.code; });
            } else {
                this.bad('Failed to login as admin failed. on postPage category creation');
            }

        }
        this.good('Test post are existing. post.page() test will start....');

        /**
        * start test post::page()
        */
        let end, start, prevPageLen;
        const limit = 5;
        await this.fire.post.page({ category: category_list[1], limit: limit })
        .then( list => {
            this.test(Object.keys(list).length === limit, 'Post page should be okay. equal to 5', Object.keys(list).length, limit );
            return list;
        })
        .then( list => {
            let last;
            for ( const post in list ) {
                if (list[post]) {
                    console.log('POST=>', list[post].title);
                    this.test(list[post].category === category_list[1], 'Post category are okay');
                    this.test(list[post].date !== null, 'Post page set date is working.');
                    last = list[post];
                    prevPageLen = Object.keys(list).length;
                } else {
                    this.bad('Should be okay.');
                    return null;
                }
            }
            // console.log(last);
            return <POST>last;
        })
        // .then( a => console.log(a) );
        .then(last => {
            if (last) {
                // console.log(last);
                end = last.title.split('_')[1];
                // console.log('END=>', end);
                return this.fire.post.page({ category: category_list[1], limit: limit }).then(a => a);
            }
        })
        .then(list => { // 2nd post page will be pushed into 1st page.
            // console.log(list);
            start = Object.keys(list)[end - 1];
            prevPageLen = Object.keys(list).length;
            return <POST>list[start];
        })
        .then(first => {
            // console.log(first);
            if (first) {
                start = first.title.split('_')[1];
                this.test( start === (end - 1).toString(), 'Test if post are different from the first get.' );
                return this.fire.post.page({ category: category_list[1], limit: limit });
            }
        })
        .then(lastPage => {
            // console.log('LAST PAGE:', Object.keys(lastPage).length);
            // console.log('LAST PAGE:', lastPage);
            this.test( Object.keys(lastPage).length - prevPageLen === 1, 'Post total is 11. Last page query should be 1 only.' );
        })
        .then(() => {
            this.fire.post.stopLoadPage();
        })
        .catch( e => {
            this.bad('Error on post.page() test', e);
            this.fire.post.stopLoadPage();
        });

        // emulate next page.
    }

    async postLikeTest() {
        const post: POST = {
            title: 'Post for like testing',
            content: 'this post is for testing post::like functionality.',
            category: settings.TEST_CATEGORY
        };
        let id = 'post' + (new Date).getTime();
        let likeCountRef: firebase.firestore.DocumentReference;

        const isLogin = await this.loginAs('like_tester@test.com', 'testerlike123');
        if (isLogin) {
            post.id = id;
            /**Create a post */
            await this.fire.post.create(post)
            .then(re => {
                id = re.data.id;
                return this.fire.post.like(re.data.id); // like post
            })
            .then(() => this.sleep(200))
            .then(() => {
                likeCountRef = this.likeColllection(id, COLLECTIONS.POSTS).doc('count');
            })
            .catch(e => this.bad('Error creating post for TestPost::postLike()', e));

            /**Get like Post Count */
            await likeCountRef.get()
            .then(doc => {
                if ( doc.exists ) {
                    // console.log('DOC Data!', doc.data());
                    this.test(doc.data().count === 1, 'Like count should be equal to 1, success!');
                } else {
                    this.bad('No like document found in ' + likeCountRef.path);
                }
            })
            .catch();

        } else {
            this.bad('Error loggin on for TestPost::postLike()');
        }
    }

}
