import { FireService, UNKNOWN } from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestPost extends TestTools {
    constructor(
    ) {
        super();
    }
    async run() {
        this.createWithWrongCategoryId();
    }

    createWithWrongCategoryId() {

    }
}
