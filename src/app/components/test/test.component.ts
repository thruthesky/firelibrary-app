import * as E from './../../modules/firelibrary/providers/etc/error';
import { POST, USER } from './../../modules/firelibrary/providers/etc/interface';
import { Component, OnInit } from '@angular/core';
import {
  FireService,
  _,
  CATEGORY_ID_EMPTY, CATEGORY_DOES_NOT_EXIST, UNKNOWN
} from '../../modules/firelibrary/core';

import { TestValidator } from './test.validator';
import { TestTools } from './test.tools';



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
    this.run();
  }
  get count() {
    return TestTools.count;
  }
  /**
   * Runs the all service testing.
   */
  async run() {
    (new TestValidator( this.fire )).run();
    this.version();
    this.library();
    this.translate();
    await this.user();
    this.category();
    this.post();
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
    await this.userRegisterSuccess(_user);
    await this.userLoginSuccess(_user);
    await this.userRegisterExistingUser(_user);
    await this.userLoginFakeUser();
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
  * Tests `User.login` method and expects `success`.
  * @param user `User` that is previously logged in by `userRegisterSuccess()`.
  * @author gem
  */
  async userLoginSuccess(user) {
    await this.fire.user.login(user.email, user.password)
      .then(a => {
        this.test(a.message === undefined, 'Login previously created User by Register test. Expected to be successful');
      })
      .catch(e => {
        this.failure('Login success test failed', e);
      });
  }
  /**
   * Tests `User.register` method for existing user. Expects `Email already in user` error.
   * @param data - User `email` and `password` of previously resgistered user.
   */
  async userRegisterExistingUser(data) {
    await this.fire.user.register(data)
      .then(res => {
        this.failure('Existing user registration should be error. Test Failed!', res);
      })
      .catch(e => {
        this.test(e['code'] === E.EMAIL_ALREADY_IN_USE, 'Register existing user. Should be error.');
      });
  }
  /**
   * Tests `User.login` method with a fake/non-existing user. Expects error. user not found/exists.
   */
  async userLoginFakeUser() {
    await this.fire.user.login('email@fake.com', '000000')
      .then(a => {
        this.failure('Login test should be failed. Email does not exists.', a);
      })
      .catch(e => {
        this.test(e.code === E.USER_NOT_FOUND, 'Login with fake user/email. Expected to be error.', 'Code: ' + e.code);
      });
  }
  /**
  * Runs `Category` Service tests.
  */
  category() {
    this.categoryCreateWrongID();
    this.categoryEmptyID();
    this.categoryGetWrongID();
    this.categoryCreateExist();
    this.categoryNotFound();
  }

  library() {
    let re = _.getBrowserLanguage();
    this.test(re && typeof re === 'string', 'Language should be thruthy and string');
    this.test(re.length === 2, 'Language test: 2 lettetr in short', re);

    re = _.getBrowserLanguage(true);
    this.test(re.length === 5, 'Language should be 5 letter', re);

  }
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

    this.test(this.fire.getText('HOME') === 'Home', 'code `home` should be `Home` in text.', 're: ' + this.fire.getText('HOME'));
    // this.test( this.fire.translate('home') === 'Home', 'Translate home to Home', this.fire.translate('home') );

  }

  categoryEmptyID() {
    this.fire.category.create(<any>{})
      .then(re => {
        this.failure('Creating category should be failed with empty data');
      })
      .catch(e => {
        this.test(e.code === E.CATEGORY_ID_EMPTY, 'Expect error with empty data');
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
        this.test(e.code === E.CATEGORY_ID_EMPTY, 'Expect error with empty category id', this.fire.translate(E.CATEGORY_ID_EMPTY));
      });
  }

  categoryCreateWrongID() {
    this.fire.setLanguage('ko');
    this.fire.category.create({'id': '/'})
      .then(re => {
        this.failure('Creating category should be failed with empty data');
      })
      .catch(e => {
        this.test(e.code === E.DOCUMENT_ID_CANNOT_CONTAIN_SLASH, 'Expect invalid-argument', e.code, e.message);
      });
    this.fire.category.create({ id: 'too-long-category-id-1234567890-1234567890-1234567890-1234567890' +
      '-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890' })
      .then(re => {
        this.failure('Creating category should be failed with empty category id');
      })
      .catch(e => {
        this.fire.setLanguage('ko');
        console.log(this.fire.getLanguage());
        this.test(e.code === E.DOCUMENT_ID_TOO_LONG, 'Expect error with empty category id', e.code, e.message);
      });
  }

  /**
   *
   */
  categoryGetWrongID() {
    this.fire.category.get('wrong-category-id')
      .then(x => this.failure('Category get with wrong id must be failed', x))
      .catch(e => this.test(e.code === E.CATEGORY_DOES_NOT_EXIST, 'Expect error on getting a category with wrong id', e.code, e.message));
  }

  /**
   *
   */
  categoryCreateExist() {
    const categoryId = 'cat-' + (new Date).getTime();
    this.fire.category.create({ id: categoryId })
      .then(re => {
        this.test(re.code === null, 'Category create susccess');
        this.test(re.data === categoryId, `Category id match`);
        this.fire.category.create({ id: categoryId })
          .then(x => this.failure('should fail on creating with existing category id'))
          .catch(e => this.test(e.code === E.CATEGORY_EXISTS, 'Expect error on creating a category with existing category id'));
      })
      .catch(e => {
        this.failure('Should create a category', e);
      });
  }

  /**
   * Category edit test.
   */
  categoryNotFound() {
    this.fire.setLanguage('ko');
    this.fire.category.edit({ id: 'wrong-category-id', name: 'wrong'})
      .then( () => this.failure('Expect error on creating wrong category') )
      .catch( e => {
        this.test( e.code === E.NOT_FOUND, e.message );
      });
  }
  /**
  * Runs `Post` Service testing.
  *
  * @author gem
  */
  post() {
  }
  createPostNoUser() {
    const post: POST = {
      uid: 'wrong-user',                   // author
      title: 'This is title',
      content: 'this is content',
      category: 'abc',             // This is category's 'Document ID'.
      tags: 'abc',                  // Tags to search
      displayName: 'wrong-user',
      email: 'wrong',
      files: [''],
      private: true,
      reminder: 0 // higher number will be listed on top.
    };
    const re = this.fire.post.create(post)
      .then(res => {
        this.failure('Create post but user not logged in test. Failed');
      })
      .catch(e => {
        this.test(e.message === E.USER_IS_NOT_LOGGED_IN, 'Create post without login should be error');
      });
  }
}
