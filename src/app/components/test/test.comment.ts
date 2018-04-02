import {
    FireService, _, UNKNOWN, POST, COMMENT, POST_CREATE, USER_NOT_FOUND, PERMISSION_DENIED,
    DELETED_MARKER, COMMENT_CREATE
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
        await this.editTest();
        await this.deleteTest();
        await this.sortTest();
    }

    async createTest() {
        const post = await this.createPost(); // create post
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
            .then(async re => {
                this.test(re.code === null, 'Test if return code is correct.');
                this.test(re.data.id === id, 'Check comment ID if correct.');
                return await this.loadGetComment(post.data.id, re.data.id);
            })
            .then((re: COMMENT) => {
                this.good('Create comment expect success. Goin to check data.');
                this.test(comment.id === undefined, 'comment.id should be deleted before set.');
                this.test(re.uid === this.fire.user.uid, 'check comment author.');
                this.test(
                    re.displayName === this.fire.user.displayName,
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
                comment.content = 'This comment should be under ' + parent.id;
                comment.id = parent.id + '-child';
                comment.parentId = parent.id;
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
            const badID = 'bad-comment' + (new Date).getTime();
            const test: COMMENT = {
                postId: post.data.id,
                content: 'This comment has bad inputs',
                uid: badUid,
                displayName: badName,
                depth: badDepth,
            };
            test.id = badID;
            await this.fire.comment.create(test)
            .then(async re => {
                return await this.loadGetComment(post.data.id, re.data.id);
            })
            .then(re => {
                this.test(
                    re.uid !== badUid && re.uid === this.fire.user.uid,
                    'UID should be changed into real UID.'
                );
                this.test(
                    re.displayName !== badName && re.displayName === this.fire.user.displayName,
                    'Display Name should changed into current user\'s Display name',
                );
                this.test(
                    re.depth !== badDepth,
                    'Depth should be automatic based on parent\'s depth',
                );
            })
            .catch(e => {
                this.bad('Error on Comment.create() validator', e);

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
        const comment: COMMENT = {
            content: 'This comment will be used for edit test',
        };
        const newContent = 'Comment is edited.';
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        if (isLogin) {
            const post: POST_CREATE = await this.createPost(); // create post
            const commentID = 'comment-' + (new Date).getTime();
            comment.id = commentID;
            comment.postId = post.data.id;

            await this.fire.comment.create(comment) // create comment
            .then(async re => {
                return await this.loadGetComment(post.data.id, re.data.id);
            })
            .then(re => {
                comment.content = newContent;
                comment.id = re.id;
                return this.fire.comment.edit(comment);
            })
            .then(async re => {
                return await this.loadGetComment(post.data.id, re.data.id);
            })
            .then(com => {
                this.test(com.created !== undefined, '`created` field still exists after update.');
                this.test(com.updated !== undefined, '`updated` field is now existing.');
                this.test(com.content === newContent, '`content` has been updated with correct content.');
                // this.test(comment.id === undefined, '`comment.id` should be deleted.'); // to be enabled once bug is fixed
            })
            .catch(e => {
                this.bad('Error on edit test', e);
            });
        } else {
            this.bad('Error logging in.');
        }
    }


    async deleteTest() {
        const time = (new Date).getTime().toString();
        const postID = 'post-comment-delete' + time;
        const commentID = 'comment-delete-' + time;
        const post: POST = {
            title: 'Post for delete test',
            content: 'This post is for deleting test.',
            category: settings.TEST_CATEGORY
        };
        const comment: COMMENT = { content: 'This comment is for comment delete test.' };
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);

        if (isLogin) {
            post.id = postID;
            await this.createPost(post)
            .then(re => {
                comment.postId = re.data.id;
                comment.id = commentID;
                return this.fire.comment.create(comment);
            })
            .then(async re => {
                return await this.loadGetComment(postID, re.data.id);
            })
            .then(com => {
                return this.fire.comment.delete(com.id);
            })
            .then(async del => {
                return await this.loadGetComment(postID, del.data.id);
            })
            .then(com => {
                this.test(com.deleted, 'Delete field should exist and equal to true', com.deleted);
                this.test(com.content === DELETED_MARKER, `Content should be '${DELETED_MARKER}'`, com.content);
                return com;
            })
            .then(com => {
                return this.fire.comment.delete(com.id);
            })
            .then(com => {
                console.log(com);
            })
            .catch(e => {
                this.bad('Failure in deleteTest()', e);
            });
        } else {
            this.bad('Login fails in deleteTest()');
        }

    }

    async sortTest() {
        const comment: COMMENT = {};
        const post: POST = {};
        const comment_list = [];
        const commentID = 'comment-' + (new Date).getTime();
        const postID = 'post-' + (new Date).getTime();
        post.id = postID + 'sort-test';
        post.category = settings.TEST_CATEGORY;
        post.title = 'POST-SORT-TEST';
        post.content = 'this is post for comment sort test';
        await this.createPost()
        .then(async re => {
            let i, c: COMMENT_CREATE;
            comment.postId = re.data.id;
            for (i = 1; i <= 2; i++) {
                comment.content = 'comment-' + i;
                comment.id = commentID + '-' + i + '-parent';
                c = await this.fire.comment.create(comment);
                comment_list.push(c.data.id);
                // create child comment
                // await this.fire.comment.load(comment.postId);
                comment.content = 'comment-child';
                comment.parentId = c.data.id;
                comment.id = commentID + '-' + i + '-child';
                const child = await this.fire.comment.create(comment);
                delete comment.parentId;
                comment_list.push(child.data.id);

                await this.fire.comment.unsubscribes(comment.postId);
            }
            return re;
        })
        .then(re => {
            return this.fire.comment.load(re.data.id);
        })
        .then(com => {
            this.test(com[0].indexOf('1-parent') !== -1, 'comment 1 - parent position is correct');
            this.test(com[1].indexOf('1-child') !== -1, 'comment 1 - child position is correct');
            this.test(com[2].indexOf('2-parent') !== -1, 'comment 2 - parent position is correct');
            this.test(com[3].indexOf('2-child') !== -1, 'comment 2 - child position is correct');
            console.log('COMMENTS==>', com);
        })
        .catch(e => {
            this.bad('Error on sort testing', e);
        });

        // await this.fire.comment.load()
    }

    private async createPost(post?: POST): Promise<POST_CREATE> {
        const isLogin = await this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD);
        if (_.isEmpty(post)) {
            post = {
                title: 'Test Post',
                content: 'This post is for testing',
                category: settings.TEST_CATEGORY
            };
            post.id = 'post-' + (new Date).getTime();
        }

        if (isLogin) {
            return await this.fire.post.create(post)
            .then( re => {
                this.good('Post created for comment test.');
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

    private async loadGetComment(postID, commentID) {
        if ( _.isEmpty(postID) || ! _.isString(postID) ) {
            this.bad('Load Get comment error postID is falsy');
        }
        if (_.isEmpty(commentID) || ! _.isString(commentID)) {
            this.bad('Load Get comment error commentID is falsy');
        }
        await this.fire.comment.load(postID);
        return this.fire.comment.getComment(commentID);
    }
}
