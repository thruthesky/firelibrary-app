/**
* Runs `User` Service tests
*
* @author gem
*
* @todo test all possible way.
*    test
*      - without email
*      - wrong email format like `1234`, `@134.com`, `aaaaaa.bbbb`
*      - with short email like `a@a.com`
*      - without password
*      - with short password
*      - with simple password
*      - with password like people name like `michael`, 'puppy'
*      - with password of too long chars.
*      - with password of same email
*      - with password of same displayName
*      - without displayName
*      - without data
*/
import {
    FireService,
    UNKNOWN, NOT_FOUND,
    INVALID_EMAIL, WEAK_PASSWORD, EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, PASSWORD_TOO_LONG
} from '../../../../public_api';
import { TestTools } from './test.tools';

export class TestUser extends TestTools {
    constructor(
    ) {
        super();
    }
    /**
    *
    */
    async run() {
        await this.userRegisterEmailValidation();
        await this.userRegisterPasswordValidation();
    }
    /**
    * Test Email validation.
    */
    async userRegisterEmailValidation() {
        /**
        * Tests Register without email
        * Firebase handles empty email as badly formatted email.
        */
        this.fire.user.register({email: '', password: '000sdfa000'})
        .then( () => { this.bad('Empty Email Validation. Expects to be error', 'Expects error: ' + INVALID_EMAIL ); })
        .catch(e => { this.test( e.code === INVALID_EMAIL, 'User Register without email. Expects Error', e.code, e.message ); });
        /**
        * Tests Register with bad email format
        */
        this.fire.user.register({ email: 'Gem@googlecom', password: '000asdf000' })
        .then(() => { this.bad('This should be error. Email format is bad.'); })
        .catch(e => { this.test(e.code === INVALID_EMAIL, 'User Register bad email format. Expecting error', e.code, e.message); });
    }
    /**
    * @todo Password Validation
    *      - with simple password
    *      - with password like people name like `michael`, 'puppy'
    *      - with password of too long chars.
    *      - with password of same email
    *      - with password of same displayName
    */
    async userRegisterPasswordValidation() {
        const user = {
            email: 'user-' + (new Date).getTime() + '@sample.com',
            password: '000000'
        };
        /**
        * Tests Register with weak password
        * Firebase only restricts password that are less tha 6 characters.
        */
        await this.fire.user.register({ email: user.email, password: 'geml2' })
        .then(() => this.bad('Password is less then 6 characters. password is weak'))
        // .then( a => console.log('ERRORRR============', a) )
        .catch(e => {
            this.test(e.code === WEAK_PASSWORD, 'User Register password less than 6 characters. Expecting error', e.message, e.code);
        });
        /**
        * Tests Register without password
        */
        await this.fire.user.register({email: user.email, password: ''})
        .then( () => { this.bad('Password is empty. password is weak'); } )
        .catch( e => { this.test( e.code === WEAK_PASSWORD, 'User Register Empty Password. Expecting error', e.code, e.message ); });
        /**
        * Tests Register with password containing only letters.
        */
        await this.fire.user.register({email: user.email, password: 'asdfgakjshgf'})
        .then( () => { this.bad('Letter only password. password should contain atleast 1 number'); } )
        .catch( e => { this.test( e.code === WEAK_PASSWORD, 'User Register letter only password. Expecting error', e.code, e.message ); });
        /**
        * Tests Register with password containing only numbers.
        */
        await this.fire.user.register({email: user.email, password: '123123123'})
        .then( () => { this.bad('Number only password. password should contain atleast 1 letter'); } )
        .catch( e => { this.test( e.code === WEAK_PASSWORD, 'User Register number only password. Expecting error', e.code, e.message ); });
        /**
        * Tests Password. Password contains displayname
        */
        await this.fire.user.register({email: 'pass' + user.email, password: 'myname123', displayName: 'myName'})
        .then( () => this.bad('Password contains display name. Password is weak - expects error') )
        .catch( e => {this.test( e.code === WEAK_PASSWORD, 'User Register `password contains display name`', e.code, e.message ); });
        /**
        * Tests Password. Password contains email
        */
        await this.fire.user.register({email: user.email, password: user.email + '123sd'})
        .then( () => this.bad('Password contains email. Password is weak - expects error') )
        .catch( e => {this.test( e.code === WEAK_PASSWORD, 'User Register `password contains email`', e.code, e.message ); });
        /**
        * Tests Password. Password exceeds at max 128 characters
        */
        await this.fire.user.register({email: user.email, password: ('asdf1234').repeat(20)})
        .then( () => this.bad('Password too long exceeds at 128 maximum characters') )
        .catch( e => {
            this.test( e.code === PASSWORD_TOO_LONG, 'User Register `password exceeds at 128 characters`', e.code, e.message );
        });
        /**
        * Tests Password Validation success
        */
        await this.fire.user.registerValidator({email: user.email, password: '123asdfasdf'})
        .then( a => { this.test( a === null, 'Password is strong should be success and expecting a null.', a ); } )
        .catch( e => { this.bad('Expecting null since password is strong', e.code, e.message ); });
    }
    /**
    * Tests` User.register` method and expects `success`.
    * @param data - user `email` and `password`.
    */
    async userRegisterSuccess(data) {
        const userInfo = {
            displayName: 'TestName',
            photoUrl: 'myphoto',
            address: '#23, Kekami st., Brgy, City, Province'
        };
        await this.fire.user.register(Object.assign(userInfo, data))
        .then(res => {
            this.test(this.fire.user.isLogin, 'User Registration, Should be success.');
        })
        .then(() => this.fire.user.logout())
        .catch(e => this.bad('User registration failed expected to be successful.', e));
    }
}
