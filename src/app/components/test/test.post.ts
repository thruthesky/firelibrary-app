import { FireService, UNKNOWN, POST, CATEGORY_DOES_NOT_EXIST, CATEGORY } from '../../../../public_api';
import { TestTools } from './test.tools';
import * as settings from './test.settings';
import { PERMISSION_DENIED } from './../../modules/firelibrary/providers/etc/error';

export class TestPost extends TestTools {
    constructor(
    ) {
        super();
    }

    async run() {
        await this.createWithWrongCategoryId();
        await this.createPostWithDifferentUID();
        await this.postCreate();
    }

    async createWithWrongCategoryId() {
        /**Failed with wrong category id */
        const data: POST = { category: 'wrong', title: 'This is Error' };
        const isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            await this.fire.post.create(data)
            .then(re => {
                this.bad('Wrong category, Expect error.');
            })
            .catch(e => {
                this.test( e.code === PERMISSION_DENIED, 'Create post with wrong Category.');
            });
        } else {
            this.bad('createWithWrongCategoryId: Login failed');
        }


    }

    async createPostWithDifferentUID() {
        /**Failed with wrong category id */
        const data: POST = { category: settings.TEST_CATEGORY, title: 'This is Error', uid: 'wrong-user' };
        const isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            await this.fire.post.create(data)
            .then(re => {
                this.good('Wrong UID, firelibrary will sanitize UID.');
            })
            .catch(e => {
                this.bad('post.create(): Create post with different UID', e.code );
            });
        } else {
            this.bad('createPostWithDifferentUID: Login failed');
        }


    }

    async postCreate() {
        /**Success */
        const data: POST = { category: settings.TEST_CATEGORY, title: 'Latest' };
        const isLogin = await this.loginAs('testing123@testing.com', '123456s');
        if ( isLogin ) {
            await this.fire.post.create(data)
            .then(re => {
                this.good('Post created: id:');
            })
            .catch(e => {
                this.bad('Create post should be success.', e);
            });
        } else {
            this.bad('PostCreate: Login failed');
        }

    }
}
