import { FireService, UNKNOWN } from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestValidator extends TestTools {
    constructor(
        private fire: FireService
    ) {
        super();
    }
    async run() {

    }
}
