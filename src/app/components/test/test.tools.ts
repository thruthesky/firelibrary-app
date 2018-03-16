import {
    FireService, RESPONSE, EMAIL_ALREADY_IN_USE
} from '../../modules/firelibrary/core';
import * as settings from './test.settings';
export class TestTools {

    static fire: FireService;
    static count = {
        test: 0,
        success: 0,
        failure: 0
    };

    constructor() {

    }
    get fire(): FireService {
        return TestTools.fire;
    }
    /**
     *
     * @param params
     */
    good(...params) {
        TestTools.count.test++;
        TestTools.count.success++;
        const str = `Success: [${TestTools.count.success}/${TestTools.count.test}]: `;
        // params.unshift( str );
        // params = [str, ...params];
        // if (params && params.length) {
        //   for (const p of params) {
        //     console.log(p);
        //   }
        // }
        // params.unshift( str );
        console.log(str, ...params);
    }
    /**
     *
     * @deprecated since the method name is same as `Firebase::failure()`.
     * @param params
     */
    bad(...params) {
        TestTools.count.test++;
        TestTools.count.failure++;
        console.error(`Failure: [${TestTools.count.failure}/${TestTools.count.test}]: `);
        if (params && params.length) {
            for (const p of params) {
                console.error(p);
            }
        }
    }
    /**
     * Calls success or failure based on `b`.
     * @param b `Boolean` or `condition`.
     * @param params some useful information that can give developer a clue to the problem.
     */
    test(b, ...params) {
        if (b) {
            this.good(params);
        } else {
            this.bad(params);
        }
    }

    /**
     * Returns Promise<true> if logged in. Otherwise Promise<false>
     */
    async registerOrLoginAs(email, password): Promise<Boolean> {

        let re = await this.fire.user.login(email, password)
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });

        if (re) {
        } else {
            const data = { email: email, password: password };
            re = await this.fire.user.register(data)
                .then(res => {
                    return true;
                })
                .catch(e => false);

        }


        if (!re) {
            return false;
        }

        return true;

    }
    async loginAsAdmin( callback ) {
        this.loginAs( settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD, callback );
        // const admin = await this.registerOrLoginAs( settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD);
        // if (!admin) {
        //     return this.bad('Failed to login as admin in loginAsAdmin()');
        // }
        // this.fire.auth.onAuthStateChanged(user => {
        //     if ( user && user.email === settings.ADMIN_EMAIL) {
        //         callback();
        //     }
        // });
    }


    /**
     * Calls the callback When the user has completely logged
     *  after
     *      1. email/password login(or register)
     *      2. onAuthStateChanged()
     *
     */
    async loginAs(email, password, callback) {
        const login = await this.registerOrLoginAs( email, password);
        if (!login) {
            return this.bad('Failed to login as ' + email);
        }
        this.fire.auth.onAuthStateChanged(user => {
            if ( user && user.email === email) {
                console.log('loginAs: ', user.email);
                setTimeout(callback, 100);
                // callback();
            }
        });
    }
}

