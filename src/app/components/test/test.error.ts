import { FireService, UNKNOWN } from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestError extends TestTools {
    constructor(
    ) {
        super();
    }
    async asAnonymous() {

        const e1 = await this.fire.failure(new Error(UNKNOWN)).catch(e => e);
        const e2 = await this.fire.failure(UNKNOWN).catch(e => e);
        this.test(e1.code === e2.code, 'Expect same error code.');

        const eo = await this.fire.failure(new Error(UNKNOWN)).catch(e => e);
        this.test(eo.code === UNKNOWN, 'Expect error object of UNKNOWN', eo.code, eo.message);


        const p = this.fire.failure(new Error(UNKNOWN)); // it got Promise.
        const pErrObj = await p.then().catch(e => e); // and wait for the Promise to reject()
        this.test(eo.code === UNKNOWN, 'Expect error object of UNKNOWN from Promise object.', eo.code, eo.message);

        //
        // const str = '--> error code';
        // const reject = Promise.reject(new Error(str)); // It got a Promise.
        // const er = await reject.catch(e => e); // Wait for reject().
        // this.test( er.message === str, 'Expect string error code after reject()', er.message);


        // try/cach
        try {
            await this.fire.failure(new Error(UNKNOWN));
        } catch (e) {
            this.test(e.code === UNKNOWN, 'try/catch test', e.code, e.message);
        }

        // double call to failure()
        const eUnknwon = await this.fire.failure(new Error(UNKNOWN)).catch(e => e);
        this.test(eUnknwon['_count'] === 1, '_count must be 1');

        const eUnknownAgain = await this.fire.failure(eUnknwon).catch(e => e);
        this.test(eUnknownAgain['_count'] === 2, '_count must be 2', eUnknownAgain);

        const eUnknownAgainAndAgain = await this.fire.failure(eUnknwon).catch(e => e);
        this.test(eUnknownAgainAndAgain['_count'] === 3, '_count must be 3', eUnknownAgain);
        this.test(eUnknownAgainAndAgain.code === UNKNOWN, 'Still it must be Unknown error',
            eUnknownAgainAndAgain.code, eUnknownAgainAndAgain.message);

        try {
            const catchLoop = await this.fire.failure(UNKNOWN)
                .catch(e => {
                    this.test(e.code === UNKNOWN, `Failure loop 1`);
                    return this.fire.failure(e);
                })
                .catch(e => {
                    this.test(e.code === UNKNOWN, `Failure loop 2`);
                    return e; // Not throwing. Returns to next then.
                })
                .then(e => {
                    this.test(e['code'] === UNKNOWN, 'Error was passed. not thrown.');
                    return this.fire.failure(<any>e); // Throwing error agagin.
                })
                .catch(e => {
                    this.test(e.code === UNKNOWN, `Failure loop 3. Now handle it outside.`);
                    return this.fire.failure(e);
                });
        } catch (e) {
            this.test(e['code'] === UNKNOWN, `Caught afetr catch => catch => then => catch : `, e);
        }

    }
}
