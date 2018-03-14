import { POST, USER } from './../../modules/firelibrary/providers/etc/interface';
import { Component, OnInit } from '@angular/core';
import {
  FireService,
  _,
  CATEGORY_ID_EMPTY, CATEGORY_DOES_NOT_EXIST, UNKNOWN, INVALID_EMAIL,
  WEAK_PASSWORD, EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, CATEGORY_EXISTS,
  USER_IS_NOT_LOGGED_IN, NOT_FOUND
} from '../../modules/firelibrary/core';



@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  count = {
    test: 0,
    success: 0,
    failure: 0
  };
  constructor(
    public fire: FireService
  ) { }
  ngOnInit() {
    this.run();
  }
  /**
  *
  * @param params
  */
  success(...params) {
    this.count.test++;
    this.count.success++;
    const str = `Success: [${this.count.success}/${this.count.test}]: `;
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
  * @param params
  */
  failure(...params) {
    this.count.test++;
    this.count.failure++;
    console.error(`Failure: [${this.count.failure}/${this.count.test}]: `);
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
      this.success(params);
    } else {
      this.failure(params);
    }
  }
  /**
  * Runs the all service testing.
  */
  async run() {
    // this.version();
    // this.library();
    // this.translate();
    await this.user();
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
    await this.fire.user.register({email: 'Gem@googlecom', password: '000000'})
    .then( () => this.failure('This should be error. Email format is bad.') )
    .catch( e => {
      this.test( e.code === INVALID_EMAIL, 'User Register bad email format. Expecting error' );
    });
  }
  /**
  * Tests Register with bad email format
  */
  async userRegisterWeakPassword(user) {
    await this.fire.user.register({email: 'pass' + user.email, password: 'gemlo'})
    .then( () => this.failure('This should be error. password is weak') )
    .catch( e => {
      this.test( e.code === WEAK_PASSWORD, 'User Register Weak Password. Expecting error', e.code );
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
    .catch(e => this.failure('User registration failed expected to be successful.', e));
  }
  /**
  * Tests `User.login` method and `User.logout` then expects `success`.
  * @param user `User` that is previously logged in by `userRegisterSuccess()`.
  * @author gem
  */
  async userLoginLogout( user ) {
    await this.fire.user.login( user.email, user.password ) // Login
    .then( a => { // test for error message
      this.test(a.message === undefined, 'Login previously created User by Register test. Expected to be successful' );
    })
    .then( () => { // Logout
      this.fire.user.logout();
    })
    .then( () => {
      this.test( this.fire.user.isLogout, 'Logout User should be success');
    })
    .catch( e => {
      this.failure('Login success test failed', e);
    });
  }
  /**
  * Tests `User.register` method for existing user. Expects `Email already in user` error.
  * @param user - User `email` and `password` of previously resgistered user.
  */
  async userRegisterExistingUser(user) {
    await this.fire.user.register(user)
    .then(res => {
      this.failure('Existing user registration should be error. Test Failed!', res);
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
    await this.fire.user.login( user.email, user.password )
    .then( a => {
      return this.fire.user.getUser();
    })
    .then( b => {
      // uid = b.uid;
      return b.delete();
    })
    .then( c => {
      this.test( this.fire.user.isLogout, 'User logged-out so the user is deleted successfully' );
    })
    .then( () => {
      return this.fire.user.login( user.email, user.password );
    })
    .then( a => {
      this.failure( 'Failed should be error, User log in is expects to be deleted.');
    })
    .catch( e => this.test(e.code === USER_NOT_FOUND, 'Login deleted user expected to be an error', e.code) );
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
    this.categoryCreateWrongID();
    this.categoryGetWrongID();
    this.categoryCreateExist();
    this.categoryEdit();
  }
  categoryCreateWrongID() {
    this.fire.category.create(<any>{})
    .then(re => {
      this.failure('Creating category should be failed with empty data');
    })
    .catch(e => {
      this.test(e.code === CATEGORY_ID_EMPTY, 'Expect error with empty data');
      // console.log('error code: ', e.code);
      // console.log('error message: ', e.message);
      // console.error('error stack log: ', e);
    });
    this.fire.category.create(<any>{ id: '' })
    .then(re => {
      this.failure('Creating category should be failed with empty category id');
    })
    .catch(e => {
      this.fire.setLanguage('ko');
      console.log(this.fire.getLanguage());
      this.test(e.code === CATEGORY_ID_EMPTY, 'Expect error with empty category id', this.fire.translate(CATEGORY_ID_EMPTY));
    });
  }
  /**
  *
  */
  categoryGetWrongID() {
    this.fire.category.get('wrong-category-id')
    .then(x => this.failure('Category get with wrong id must be failed', x))
    .catch(e => this.test(e.code === CATEGORY_DOES_NOT_EXIST, 'Expect error on getting a category with wrong id', e.code, e.message));
  }
  /** */
  categoryCreateExist() {
    const categoryId = 'cat-' + (new Date).getTime();
    this.fire.category.create({ id: categoryId })
    .then(re => {
      this.test(re.code === null, 'Category create susccess');
      this.test(re.data === categoryId, `Category id match`);
      this.fire.category.create({ id: categoryId })
      .then(x => this.failure('should fail on creating with existing category id'))
      .catch(e => this.test(e.code === CATEGORY_EXISTS, 'Expect error on creating a category with existing category id'));
    })
    .catch(e => {
      this.failure('Should create a category', e);
    });
  }
  /** */
  categoryEdit() {
    this.fire.setLanguage('ko');
    this.fire.category.edit({ id: 'wrong-category-id', name: 'wrong'})
    .then( () => this.failure('Expect error on creating wrong category') )
    .catch( e => {
      this.test( e.code === NOT_FOUND, e.message );
    });
  }
  /**
  * Runs `Post` Service testing.
  *
  * @author gem
  */
  post() {
    this.createPostNotLogin();
  }
  /**
  * Tests `Post.create` without logging in.
  *
  */
  createPostNotLogin() {
    const post: POST = {
      uid: 'wrong-user',                   // author
      // title: 'This is title',
      // content: 'this is content',
      // category: 'abc',             // This is category's 'Document ID'.
      // tags: 'abc',                  // Tags to search
      // displayName: 'wrong-user',
      // email: 'wrong',
      // files: [''],
      // private: true,
      // reminder: 0 // higher number will be listed on top.
    };
    const re = this.fire.post.create( post )
    .then( res => {
      this.failure('Create post but user not logged in test. Failed');
    })
    .catch( e => {
      this.test(e.message === USER_IS_NOT_LOGGED_IN, 'Create post without login should be error', 'Message: ' + e.message);
    });
  }
  createPostSuccess() {
    //
  }
}
