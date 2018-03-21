import {
    FireService, RESPONSE, EMAIL_ALREADY_IN_USE
} from '../../modules/firelibrary/core';
import * as settings from './test.settings';
import * as firebase from 'firebase';
import { COLLECTIONS } from './../../modules/firelibrary/providers/etc/define';
import { COLLECTION_DOMAIN } from './../../modules/firelibrary/settings';
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
    private async registerOrLoginAs(email, password): Promise<Boolean> {

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
    async loginAsAdmin(callback?: () => Promise<any>) {
        return await this.loginAs(settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD, callback);
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
    * Sleeps for ms.
    * @code await this.sleep(10000).then(() => console.log('after 10 sec'));
    */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
    * Calls the callback When the user has completely logged
    *
    * @code
    let re = await this.loginAs('AAA@AAA.com', 'b018,z8*a~');
    console.log('re: ', re, firebase.auth().currentUser.email);
    re = await this.loginAs('BBB@BBB.com', 'b018,z8*a~');
    console.log('re: ', re, firebase.auth().currentUser.email);
    re = await this.loginAs('CCC@CCC.com', 'b018,z8*a~');
    console.log('re: ', re, firebase.auth().currentUser.email);
    await firebase.auth().signOut();
    re = await this.loginAsAdmin();
    console.log('re: ', re, firebase.auth().currentUser.email);
    re = await this.loginAs('DDD@DDD.com', 'b018,z8*a~');
    console.log('re: ', re, firebase.auth().currentUser.email);
    re = await this.loginAs('EEE@EEE.com', 'b018,z8*a~');
    console.log('re: ', re, firebase.auth().currentUser.email);
    *
    * @endcode
    */
    async loginAs(email: string, password, $deprecated?) {
        const login = await this.registerOrLoginAs(email, password);
        if (!login) {
            // return this.bad('Failed to login as ' + email);
            return false;
        } else {
            for (let i = 0; i < 100; i++) {
                await this.sleep(150).then(() => console.log('after 150ms'));
                const user = firebase.auth().currentUser;
                if (user) {
                    if (user.email === email.toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        }

    }

    async logout(): Promise<boolean> {
        let user = firebase.auth().currentUser;
        // console.log(user);
        if (user) {
            firebase.auth().signOut();
            for (let i = 0; i < 100; i++) {
                await this.sleep(150).then(() => console.log('after 150ms'));
                user = firebase.auth().currentUser;
                console.log(user);
                if (!user) { return true; }
            }
        } else {
            return true;
        }

    }

    async prepareTest(): Promise<any> {
        // await this.setAdmin();
        const isAdmin = await this.loginAsAdmin();
        if (isAdmin) {
            await this.fire.category.create({ id: settings.TEST_CATEGORY, name: 'Testing' })
            .catch(e => console.log(settings.TEST_CATEGORY, ' already exists!'));
        } else {
            this.bad('Error login as admin...');
        }
    }

}

