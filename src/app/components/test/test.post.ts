import { FireService, UNKNOWN, POST, CATEGORY_DOES_NOT_EXIST, CATEGORY } from '../../../../public_api';
import { TestTools } from './test.tools';
import { PERMISSION_DENIED } from './../../modules/firelibrary/providers/etc/error';

export class TestPost extends TestTools {
    constructor(
    ) {
        super();
    }
    async run() {
        await this.createWithWrongCategoryId();
        await this.createPostWithDifferentUID();
        await this.PostCreate();
    }

    async createWithWrongCategoryId() {
        const user = {
            email: 'user1@test.com', password: '12345a,*'
        };
        /**Failed with wrong category id */
       await this.loginAs( user.email, user.password, () => {
            const data: POST = { category: 'wrong', title: 'This is Error' };
            this.fire.post.create(data)
            .then(re => {
                this.bad('Wrong category, Expect error.');
            })
            .catch(e => {
                this.test( e.code === PERMISSION_DENIED, 'Create post with wrong Category.', e.code, e.message );
            });
        });
    }

    async createPostWithDifferentUID() {
        const user = {
            email: 'user1@test.com', password: '12345a,*'
        };
        /**Failed with wrong category id */
        await this.loginAs( user.email, user.password, () => {
            const data: POST = { category: 'qna', title: 'This is Error', uid: 'wrong-user' };
            this.fire.post.create(data)
            .then(re => {
                this.good('Wrong UID, firelibrary will sanitize UID.', re.data);
            })
            .catch(e => {
                this.bad('Create post with different UID', e.code );
            });
        });
    }

    async PostCreate() {
        const user = {
            email: 'user1@test.com', password: '12345a,*'
        };
        /**Success */
        await this.loginAs(user.email, user.password, () => {
            const data: POST = { category: 'qna', title: 'Latet' };
            this.fire.post.create(data)
            .then(re => {
                this.good('Post created: id:', re.data);
                this.fire.user.logout();
            })
            .catch(e => {
                console.log(e);
                this.fire.user.logout();
            });
        });
    }
}
