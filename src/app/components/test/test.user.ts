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
    NOT_FOUND,
    INVALID_EMAIL, WEAK_PASSWORD, EMAIL_ALREADY_IN_USE, USER_NOT_FOUND,
    PASSWORD_TOO_LONG, FIREBASE_API_ERROR, WRONG_PASSWORD
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
    async asAnonymous() {
        await this.userRegisterEmailValidation();
        await this.userRegisterPasswordValidation();
        await this.userRegisterSuccess();
        await this.userLoginTest();
    }

    // async asMember(){
    // }
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
        /**
        * Tests Register with undefined email
        */
        this.fire.user.register({ email: undefined, password: '000asdf000' })
        .then(() => { this.bad('Email is `undefined`. Should be error of FIREBASE_API_ERROR with message.'); })
        .catch(e => { this.test(e.code === FIREBASE_API_ERROR,
            'Email is `undefined` expect error FIREBASE_API_ERROR ', e.code, e.message);
        });
        /**
        * Tests RegisterValidator success
        */
        this.fire.user.registerValidator({ email: 'unit-test@gmail.com', password: '000asdf000' })
        .then((a) => { this.test(a === null, 'Email is good expect success.'); })
        .catch(e => { this.bad( 'Email validation should be success' ); });
    }
    /**
    * Test Password validation.
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
        * Tests Register with password undefined
        */
        await this.fire.user.register({email: user.email, password: undefined})
        .then( () => { this.bad('Password undefined should be FIREBASE_API_ERROR with message'); } )
        .catch( e => { this.test( e.code === FIREBASE_API_ERROR,
            'User Register `undefined` Password. Expecting error', e.code, e.message );
        });
        /**
        * Tests Register with password containing only letters.
        */
        // await this.fire.user.register({email: user.email, password: 'asdfgakjshgf'})
        // .then( () => { this.bad('Letter only password. password should contain atleast 1 number'); } )
        // .catch( e => { this.test( e.code === WEAK_PASSWORD,
        //     'User Register letter only password. Expecting error', e.code, e.message );
        // });
        /**
        * Tests Register with password containing only numbers.
        */
        // await this.fire.user.register({email: user.email, password: '123123123'})
        // .then( () => { this.bad('Number only password. password should contain atleast 1 letter'); } )
        // .catch( e => { this.test( e.code === WEAK_PASSWORD,
        //     'User Register number only password. Expecting error', e.code, e.message );
        // });
        /**
        * Tests Password. Password contains displayname
        */
        // await this.fire.user.register({email: 'pass' + user.email, password: 'myname123', displayName: 'myName'})
        // .then( () => this.bad('Password contains display name. Password is weak - expects error') )
        // .catch( e => {this.test( e.code === WEAK_PASSWORD, 'User Register `password contains display name`', e.code, e.message ); });
        /**
        * Tests Password. Password contains email
        */
        // await this.fire.user.register({email: user.email, password: user.email + '123sd'})
        // .then( () => this.bad('Password contains email. Password is weak - expects error') )
        // .catch( e => {this.test( e.code === WEAK_PASSWORD, 'User Register `password contains email`', e.code, e.message ); });
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
    */
    async userRegisterSuccess() {
        const userInfo = {
            email: 'test-' + (new Date).getTime() + '@test.com',
            password: 'Asd12345',
            displayName: 'TestName',
            photoUrl: 'myphoto',
            address: '#23, Sesame st., Brgy, City, Province'
        };
        await this.fire.user.register(Object.assign(userInfo))
        .then(res => {
            this.test(this.fire.user.isLogin, 'User Registration, Should be success.');
        })
        .then(() => this.fire.user.logout())
        .catch(e => this.bad('User registration failed expected to be successful.', e));
    }

    async userLoginTest() {
        const userInfo = {
            email: 'test-' + (new Date).getTime() + '@test.com',
            password: 'Asd12345',
            displayName: 'TestName',
            photoUrl: 'myphoto',
            address: '#23, Sesame st., Brgy, City, Province'
        };
        /**
        * Test email undefined
        */
        await this.fire.user.login(undefined,  'Password123')
        .then( user => { this.bad('Email `undefined` test should be error', user); })
        .catch( e => { this.test(FIREBASE_API_ERROR, 'Email is `undefined` should be a valid string', e); });
        /**
        * Test password is undefined
        */
        await this.fire.user.login('email@gmail.com',  undefined)
        .then( user => { this.bad('Password is `undefined`. Expect Error. ', user); })
        .catch( e => { this.test(FIREBASE_API_ERROR, 'Password is `undefined` should be a valid string', e); });
        /**
        * Test both email and paswword are `undefined`
        */
        await this.fire.user.login(undefined,  undefined)
        .then( user => { this.bad('Password and Email are `undefined`. Expect Error. ', user); })
        .catch( e => { this.test(FIREBASE_API_ERROR, 'Password and Email are `undefined` should be a valid string', e); });
        /**
        * Test login invalid email.
        */
        await this.fire.user.loginValidator(userInfo.email, userInfo.password)
        .then( a => { this.test(a === null, 'email and password are both valid.', a); })
        .catch( e => { this.bad('Email and password should pass the validator.', e); } );

        /**
        * Test login invalid email.
        */
        await this.fire.user.login('WrongEmail@x.com', 'Password123')
        .then( (a) => { this.bad('Wrong email should not be success.', a); })
        .catch( e => { this.test(e.code === USER_NOT_FOUND, 'Login with wrong email, Expect user-not-found', e.code, e.message); } );
        /**
        * Test login invalid password.
        */
        await this.fire.user.register(userInfo)
        .then( a => this.fire.auth.currentUser )
        .then( a => { this.fire.user.logout(); })
        .then( () => this.fire.user.login(userInfo.email, 'invalidPassword123') )
        .then( a => { this.bad(a, 'This should be error. Password is not valid', a); })
        .catch( e => { this.test(e.code === WRONG_PASSWORD, 'Login test with wrong password', e.code, e.message); } );
    }

    async userUpdateTest() {

    }
}
