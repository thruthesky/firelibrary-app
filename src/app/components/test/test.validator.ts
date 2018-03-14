import { FireService, UNKNOWN } from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestValidator extends TestTools {
    constructor(
        private fire: FireService
    ) {
        super();
    }
    async run() {

        const p = await this.fire.failure(new Error(UNKNOWN)).catch(e => e); // Returns an unhandled.
        console.log('-- p: ', p, p.code, p.message);

        const r = this.fire.failure(new Error(UNKNOWN));
        const re = await r.then().catch(e => e);
        console.log('-- re: ', re, re.code, re.message);


        const eo = Promise.reject(new Error(' --> error string'));
        const er = await eo.catch(e => e);
        console.log('--> er: ', er.message );


        // const handledError = p.catch( e => e ); // handles now. If not handle here, it will not be handled.
        // console.log('---> handled error : ', handledError, handledError.code, handledError.message);
        // this.test(typeof o._translated === 'boolean' )
    }
}
