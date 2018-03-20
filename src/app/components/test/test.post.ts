import { FireService, UNKNOWN, POST, CATEGORY_DOES_NOT_EXIST, CATEGORY } from '../../../../public_api';
import { TestTools } from './test.tools';
import { PERMISSION_DENIED } from './../../modules/firelibrary/providers/etc/error';

export class TestPost extends TestTools {
    constructor(
    ) {
        super();
    }
    async asMember() {
        // console.log('Iam am in test.post.asMember() $$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        await this.createWithWrongCategoryId();
        await this.createPostWithDifferentUID();
        await this.PostCreate();
    }

    async createWithWrongCategoryId() {
        /**Failed with wrong category id */
        const data: POST = { category: 'wrong', title: 'This is Error' };
        await this.fire.post.create(data)
        .then(re => {
            this.bad('Wrong category, Expect error.');
        })
        .catch(e => {
            this.test( e.code === PERMISSION_DENIED, 'Create post with wrong Category.', e.code, e.message );
        });
    }

    async createPostWithDifferentUID() {
        /**Failed with wrong category id */
        const data: POST = { category: 'qna', title: 'This is Error', uid: 'wrong-user' };
        await this.fire.post.create(data)
        .then(re => {
            this.good('Wrong UID, firelibrary will sanitize UID.', re.data);
        })
        .catch(e => {
            this.bad('Create post with different UID', e.code );
        });
    }

    async PostCreate() {
        /**Success */
        const data: POST = { category: 'qna', title: 'Latet' };
        await this.fire.post.create(data)
        .then(re => {
            this.good('Post created: id:', re.data);
            // this.fire.user.logout();
        })
        .catch(e => {
            console.log(e);
            // this.fire.user.logout();
        });
    }
}
