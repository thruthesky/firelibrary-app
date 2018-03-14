import { FireService, UNKNOWN } from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestValidator extends TestTools {
    constructor(
        private fire: FireService
    ) {
        super();
    }
    async run() {

        // const p = await this.fire.failure(new Error(UNKNOWN)).catch(e => e);
        // console.log('-- p: ', p, p.code, p.message);

        // const r = this.fire.failure(new Error(UNKNOWN)); // it got Promise.
        // const re = await r.then().catch(e => e); // and wait for the Promise to reject()
        // console.log('-- re: ', re, re.code, re.message);


        // const eo = Promise.reject(new Error(' --> error string')); // It got a Promise.
        // const er = await eo.catch(e => e); // Wait for reject().
        // console.log('--> er: ', er.message);


    }
}
