import {
    FireService, _, UNKNOWN, POST, COMMENT, POST_CREATE, USER_NOT_FOUND, PERMISSION_DENIED
} from './../../modules/firelibrary/core';
import { TestTools } from './test.tools';
import * as settings from './test.settings';
import * as firebase from 'firebase';

export class TestComment extends TestTools {
    constructor(
    ) {
        super();
    }

    async run() {
        await this.createTest();

    }

    async createTest() {
        const post = await this.createPost();
        if (_.isEmpty(post.data)) {
            this.bad('Post data is missing for create comment test');
            return false;
        }
        const comment: COMMENT  = {
            postId: post.data.id,
            content: 'This post should belong to' + '"' + post.data.post.title + '"'
        };

        /**
        * Comment Create and Nesting Test.
        */
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        if (isLogin) {

            const id = 'comment-' + (new Date).getTime();
            comment.id = id;
            await this.fire.comment.create(comment)
            .then(re => {
                this.good('Create comment expect success. Goin to check data.');
                this.test(re.code === null, 'Test if return code is correct.');
                this.test(re.data.id === id, 'Check comment ID if correct.');
                this.test(comment.id === undefined, 'comment.id should be deleted before set.');
                this.test(comment.uid === this.fire.user.uid, 'check comment author.');
                this.test(
                    comment.displayName === this.fire.user.displayName,
                    'Check  comment author display name',
                );
                this.test(
                    comment.depth === 0 && comment.parentId === undefined,
                    'Parent comment depth should be `0` and parentID is `undefined`'
                );
                this.good('Create comment success.');
                return re;
            })
            .then(async parent => {
                await this.fire.comment.load(post.data.id); // load comments
                console.log('Create child comment');
                comment.content = 'This comment should be under ' + parent.data.id;
                comment.id = parent.data.id + '-child';
                comment.parentId = parent.data.id;
            })
            .then(() => { // create child comment
                return this.fire.comment.create(comment);
            })
            .then(async child => {
                await this.fire.comment.load(post.data.id); // load comment
                this.good('Create child comment success');
                this.test(child.code === null, 'Create child comment return code is null');
                this.test(child.data.id.indexOf('child') !== -1, 'Test child comment ID');
                this.test(comment.id === undefined, 'Comment ID should be deleted. to avoid adding it as a field.');
                this.test(comment.parentId !== undefined, 'parentID is not `undefined`');
                this.test(comment.depth === 1, 'Depth should be equal to 1 comment is first degree child.');
                return child;
            })
            .then(async fristChild => { // form grand comment
                console.log('Create 2nd level child comment');
                comment.content = 'This comment should be under ' + fristChild.data.id;
                comment.id = fristChild.data.id + '-grand';
                comment.parentId = fristChild.data.id;
            })
            .then(() => { // create child comment
                return this.fire.comment.create(comment);
            })
            .then(async grandChild => {
                await this.fire.comment.load(post.data.id); // load comment
                this.good('Create child comment success');
                this.test(grandChild.code === null, 'Create grand child comment return code is null');
                this.test(grandChild.data.id.indexOf('grand') !== -1, 'Test grand child comment ID');
                this.test(comment.id === undefined, 'Comment ID should be deleted. to avoid adding it as a field.');
                this.test(comment.parentId !== undefined, 'parentID is not `undefined`');
                this.test(comment.depth === 2, 'Depth should be equal to 2 comment is second degree child.');
            })
            .catch(e => {
                this.bad('Create post should be success.', e);
            });

            /**
            * Create Test input validator.
            */
            const badUid = 'wrong-uid';
            const badName = 'Bad Name';
            const badDepth = 24;
            const test: COMMENT = {
                postId: post.data.id,
                content: 'This comment has bad inputs',
                uid: badUid,
                displayName: badName,
                depth: badDepth,
            };
            test.id = 'bad-comment' + (new Date).getTime();
            await this.fire.comment.create(test)
            .then(re => {
                this.test(
                    test.uid !== badUid && test.uid === this.fire.user.uid,
                    'UID should be changed into real UID.'
                );
                this.test(
                    test.displayName !== badName && test.displayName === this.fire.user.displayName,
                    'Display Name should changed into current user\'s Display name',
                );
                this.test(
                    test.depth !== badDepth,
                    'Depth should be automatic based on parent\'s depth',
                );
            })
            .catch(e => {
                console.log('ERROR => ', e);

            });

        } else {
            this.bad('Login for comment create and nesting testing failed');
        }

        /**
        * Create test as Anonymous
        */
        const isLogout = await this.logout();
        if (isLogout) {
            comment.postId = post.data.id;
            comment.content = 'This is for Anonymous comment test.';
            comment.id = 'anonymous-comment' + (new Date).getTime();
            await this.fire.comment.create(comment)
            .then(a => {
                this.bad('Should fail, Anonymous users cannot comment.');
            })
            .catch(e => {
                this.test(e.code === PERMISSION_DENIED, 'Anonymous cannot comment.');
            });
        }

    }

    async editTest() {
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        if (isLogin) {
            //
        } else {
            //
        }
    }

    async getTest() {

    }

    async sortTest() {

    }

    async loadTest() {
    }

    async deleteTest() {

    }

    private async createPost(): Promise<POST_CREATE> {
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        const post: POST = {
            title: 'Test Post for creating comment',
            content: 'This post should contain test comments',
            category: settings.TEST_CATEGORY
        };
        post.id = 'post-' + (new Date).getTime();

        if (isLogin) {
            return await this.fire.post.create(post)
            .then( re => {
                console.log('Post created for comment test.');
                return re;
            })
            .catch(e => {
                this.bad('Creating post for comment test fails', e);
                return e;
            });
        } else {
            this.bad('Fail to login as member.');
            return this.fire.failure(USER_NOT_FOUND);
        }

    }
}
