import { POST, USER } from './../../modules/firelibrary/providers/etc/interface';
import { Component, OnInit } from '@angular/core';
import {
  FireService,
  _,
  CATEGORY_ID_EMPTY, CATEGORY_DOES_NOT_EXIST, UNKNOWN, INVALID_EMAIL,
  WEAK_PASSWORD, EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, CATEGORY_EXISTS,
  USER_IS_NOT_LOGGED_IN, NOT_FOUND, DOCUMENT_ID_TOO_LONG, DOCUMENT_ID_CANNOT_CONTAIN_SLASH
} from '../../modules/firelibrary/core';

import { TestValidator } from './test.validator';
import { TestTools } from './test.tools';
import { TestError } from './test.error';
import { TestCategory } from './test.category';



@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent extends TestTools implements OnInit {
  constructor(
    public fire: FireService
  ) {
    super();
  }
  ngOnInit() {
    // (new TestCategory(this.fire)).run(); // Run only one test file.
    // (new TestCategory(this.fire)).categoryEmptyID(); // Run only one test method.
    // (new TestCategory(this.fire)).categoryDelete(); // Run only one test method.
    this.run();
  }

  get count() {
    return TestTools.count;
  }
  /**
  * Runs the all service testing.
  */
  async run() {
    (new TestError(this.fire)).run();
    (new TestValidator(this.fire)).run();
    this.version();
    this.library();
    this.translate();
    await this.user();
    (new TestCategory(this.fire)).run();
    // this.category();
    // this.post();
  }
  /**
  * Tests current version
  */
  version() {
    const version = this.fire.version();
    this.test(_.isString(version), `Version: ${version}`);
  }
  /**
  * Runs `User` Service tests
  *
  * @author gem
  *
  * @todo test all possible way.
  *    test
  *      - without email
  *      - without wrong email format like `1234`, `@134.com`, `aaaaaa.bbbb`
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
  async user() {
    const _user = {
      email: 'user-' + (new Date).getTime() + '@sample.com',
      password: '000000'
    };
    await this.userRegisterBadEmail();
    await this.userRegisterWeakPassword(_user);
    await this.userRegisterSuccess(_user);
    await this.userLoginLogout(_user);
    await this.userRegisterExistingUser(_user);
    await this.deleteUserThenLogin(_user);
  }
  /**
  * Tests Register with bad email format
  */
  async userRegisterBadEmail() {
    await this.fire.user.register({ email: 'Gem@googlecom', password: '000000' })
      .then(() => this.bad('This should be error. Email format is bad.'))
      .catch(e => {
        this.test(e.code === INVALID_EMAIL, 'User Register bad email format. Expecting error');
      });
  }
  /**
  * Tests Register with bad email format
  */
  async userRegisterWeakPassword(user) {
    await this.fire.user.register({ email: 'pass' + user.email, password: 'gemlo' })
      .then(() => this.bad('This should be error. password is weak'))
      .catch(e => {
        this.test(e.code === WEAK_PASSWORD, 'User Register Weak Password. Expecting error', e.code);
      });
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
  /**
  * Tests `User.login` method and `User.logout` then expects `success`.
  * @param user `User` that is previously logged in by `userRegisterSuccess()`.
  * @author gem
  */
  async userLoginLogout(user) {
    await this.fire.user.login(user.email, user.password) // Login
      .then(a => { // test for error message
        this.test(a.message === undefined, 'Login previously created User by Register test. Expected to be successful');
      })
      .then(() => { // Logout
        this.fire.user.logout();
      })
      .then(() => {
        this.test(this.fire.user.isLogout, 'Logout User should be success');
      })
      .catch(e => {
        this.bad('Login success test failed', e);
      });
  }
  /**
  * Tests `User.register` method for existing user. Expects `Email already in user` error.
  * @param user - User `email` and `password` of previously resgistered user.
  */
  async userRegisterExistingUser(user) {
    await this.fire.user.register(user)
      .then(res => {
        this.bad('Existing user registration should be error. Test Failed!', res);
      })
      .catch(e => {
        this.test(e['code'] === EMAIL_ALREADY_IN_USE, 'Register existing user. Should be error.');
      });
  }
  /**
  * Deletes current User and tries to `User.login` method with previously deleted email. Expects error. user not found/exists.
  */
  async deleteUserThenLogin(user) {
    // let uid;
    await this.fire.user.login(user.email, user.password)
      .then(a => {
        return this.fire.user.getUser();
      })
      .then(b => {
        // uid = b.uid;
        return b.delete();
      })
      .then(c => {
        this.test(this.fire.user.isLogout, 'User logged-out so the user is deleted successfully');
      })
      .then(() => {
        return this.fire.user.login(user.email, user.password);
      })
      .then(a => {
        this.bad('Failed should be error, User log in is expects to be deleted.');
      })
      .catch(e => this.test(e.code === USER_NOT_FOUND, 'Login deleted user expected to be an error', e.code));
  }
  /**
  * Runs Library Test.
  */
  library() {
    let re = _.getBrowserLanguage();
    this.test(re && typeof re === 'string', 'Language should be thruthy and string');
    this.test(re.length === 2, 'Language test: 2 lettetr in short', re);
    //
    re = _.getBrowserLanguage(true);
    this.test(re.length === 5, 'Language should be 5 letter', re);
  }
  /**
  * Tests Language Translator
  */
  async translate() {
    const old = this.fire.getLanguage();
    this.fire.setLanguage('en');
    // console.log(`getLanguage() after setLanguage('en')`, this.fire.getLanguage());
    this.test(this.fire.getLanguage() === 'en', `getLanguage() after setLanguage('en')`);
    try {
      const re = await this.fire.failure(<any>{ message: UNKNOWN }, { info: 'what' });
    } catch (e) {
      // console.log(e);
      const text = this.fire.getText(UNKNOWN).replace('#info', 'what');
      this.test(e.message === this.fire.translate(UNKNOWN, { info: 'what' }), 'Error translation test', e);
      this.test(e.message === text, 'Unknown error translation test');
    }
    //
    this.test(this.fire.getText('HOME') === 'Home', 'code `home` should be `Home` in text.', 're: ' + this.fire.getText('HOME'));
    // this.test( this.fire.translate('home') === 'Home', 'Translate home to Home', this.fire.translate('home') );
    //
  }
  /**
  * Runs `Category` Service tests.
  */
  category() {
    // this.categoryCreateWrongID();
    // this.categoryGetWrongID();
    // this.categoryCreateExist();
    // this.categoryNotFound();
  }

  // /**
  // * Runs `Post` Service testing.
  // *
  // * @author gem
  // */
  // post() {
  //   this.createPostNotLogin();
  // }
  // /**
  // * Tests `Post.create` without logging in.
  // *
  // */
  // createPostNotLogin() {
  //   const post: POST = {
  //     uid: 'wrong-user',                   // author
  //     // title: 'This is title',
  //     // content: 'this is content',
  //     // category: 'abc',             // This is category's 'Document ID'.
  //     // tags: 'abc',                  // Tags to search
  //     // displayName: 'wrong-user',
  //     // email: 'wrong',
  //     // files: [''],
  //     // private: true,
  //     // reminder: 0 // higher number will be listed on top.
  //   };
  //   const re = this.fire.post.create(post)
  //     .then(res => {
  //       this.bad('Create post but user not logged in test. Failed');
  //     })
  //     .catch(e => {
  //       this.test(e.message === USER_IS_NOT_LOGGED_IN, 'Create post without login should be error', e);
  //     });
  // }
  // createPostSuccess() {
  //   //
  // }
}
