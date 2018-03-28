import {
    FireService, _, UNKNOWN, POST, COMMENT, POST_CREATE
} from '../../../../public_api';
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

        /**Success comment creation as anonymous */
        const id = 'comment-' + (new Date).getTime();
        comment.id = id;
        await this.fire.comment.create(comment)
        .then(re => {
            this.good('Create post expect success.');
            return re;
        })
        .then(re => {
            this.test(re.code === null, 'Test if return code is correct.');
            this.test(re.data.id === id, 'Check comment ID if correct.');
            this.test(comment.id === undefined, 'comment.id should be deleted before set.');
            this.test(comment.uid === this.fire.user.uid, 'check comment author.');
            this.test(comment.displayName === this.fire.user.displayName, 'Check  comment author display name', this.fire.user.displayName);
        })
        .catch(e => {
            this.bad('Create post should be success.', e);
        });

    }

    async editTest() {

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
        const post: POST = {
            title: 'Test Post for creating comment',
            content: 'This post should contain test comments',
            category: settings.TEST_CATEGORY
        };
        post.id = 'post-' + (new Date).getTime();
        return await this.fire.post.create(post)
        .then( re => {
            console.log('Post created for comment test.');
            return re;
        })
        .catch(e => {
            this.bad('Creating post for comment test fails', e);
            return e;
        });
    }
}
