import { FireService, UNKNOWN, POST, CATEGORY_DOES_NOT_EXIST, CATEGORY } from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestPost extends TestTools {
    constructor(
    ) {
        super();
    }
    async run() {
        this.createWithWrongCategoryId();
        this.create();
    }

    createWithWrongCategoryId() {

    }

    create() {
        this.loginAs('user1@test.com', '12345a,*', () => {
            const data: POST = { category: 'qna', title: 'Latet' };
            this.fire.post.create(data)
                .then(re => {
                    this.good('Post created: id:', re.data);
                })
                .catch(e => {
                    console.log(e);
                });
        });

    }
}
