import * as E from './../../modules/firelibrary/providers/etc/error';
import { POST, USER } from './../../modules/firelibrary/providers/etc/interface';
import { Component, OnInit } from '@angular/core';
import {
  FireService,
  _,
  CATEGORY_ID_IS_EMPTY, CATEGORY_DOES_NOT_EXIST, UNKNOWN
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
  ) {}
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
    params = [ str, ...params];
    // if (params && params.length) {
    //   for (const p of params) {
    //     console.log(p);
    //   }
    // }
    console.log(params);
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
  run() {
    this.version();
    this.user();
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
  */
  async user() {
    const _user = {
      email : 'user-' + (new Date).getTime() + '@sample.com',
      password: '000000'
    };
    await this.userRegisterSuccess( _user );
    this.userLoginSuccess( _user );
    this.userRegisterExistingUser( _user );
    this.userLoginFakeUser();
  }
  /**
   * Tests` User.register` method and expects `success`.
   * @param data - user `email` and `password`.
   */
  async userRegisterSuccess( data ) {
    const userInfo = {
      displayName : 'TestName',
      photoUrl : 'myphoto',
      address : '#23, Kekami st., Brgy, City, Province'
    };
    await this.fire.user.register( Object.assign( userInfo, data ) )
    .then( res => {
      this.test( this.fire.user.isLogin , 'User Registration, Should be success.');
    })
    .then( () => this.fire.user.logout() )
    .catch( e => this.failure('User registration failed expected to be successful.', e) );
  }
  /**
  * Tests `User.login` method and expects `success`.
  * @param user `User` that is previously logged in by `userRegisterSuccess()`.
  * @author gem
  */
  userLoginSuccess( user ) {
    this.fire.user.login( user.email, user.password )
    .then( a => {
      this.test(a.message === undefined, 'Login previously created User by Register test. Expected to be successful' );
    })
    .catch( e => {
      this.failure('Login success test failed', e);
    } );
  }
  /**
   * Tests `User.register` method for existing user. Expects `Email already in user` error.
   * @param data - User `email` and `password` of previously resgistered user.
   */
  userRegisterExistingUser( data ) {
    this.fire.user.register( data )
    .then( res => {
      this.failure('Existing user registration should be error. Test Failed!', res);
    })
    .catch( e => {
      this.test( e['code'] === E.EMAIL_ALREADY_IN_USE, 'Register existing user. Should be error.');
    });
  }
  /**
   * Tests `User.login` method with a fake/non-existing user. Expects error. user not found/exists.
   */
  userLoginFakeUser() {
    this.fire.user.login( 'email@fake.com', '000000' )
    .then( a => {
      this.failure('Login test should be failed. Email does not exists.', a);
    } )
    .catch( e => {
      this.test(e.code === E.USER_NOT_FOUND, 'Login with fake user/email. Expected to be error.', 'Code: ' + e.code);
    });
  }
  /**
  * Runs `Category` Service tests.
  */
  category() {
    this.library();
    this.translateError();
    this.categoryCreateWrongID();
    this.categoryGetWrongID();
  }

  library() {
    let re = _.getBrowserLanguage();
    this.test(re && typeof re === 'string', 'Language should be thruthy and string');
    this.test(re.length === 2, 'Language test: 2 lettetr in short', re);

    re = _.getBrowserLanguage(true);
    this.test(re.length === 5, 'Language should be 5 letter', re);

  }
  async translateError() {
    const old = this.fire.getLanguage();
    this.fire.setLanguage('en');
    try {
      const re = await this.fire.failure(<any>{ message: UNKNOWN }, { info: 'what' });
    } catch (e) {
      // console.log(e);
      const text = this.fire.getText( UNKNOWN ).replace('#info', 'what');
      this.test(e.message ===  this.fire.translate(UNKNOWN, { info: 'what' }), 'Error translation test', e);
      this.test(e.message === text, 'Unknown error translation test');
    }
  }

  categoryCreateWrongID() {
    this.fire.category.create(<any>{})
    .then(re => {
      this.failure('Creating category should be failed with empty data');
    })
    .catch(e => {
      this.test(e.code === E.CATEGORY_ID_IS_EMPTY, 'Expect error with empty data');
      // console.log('error code: ', e.code);
      // console.log('error message: ', e.message);
      // console.error('error stack log: ', e);
    });
    this.fire.category.create(<any>{ id: '' })
    .then(re => {
      this.failure('Creating category should be failed with empty category id');
    })
    .catch(e => {
      this.test(e.code === E.CATEGORY_ID_IS_EMPTY, 'Expect error with empty category id');
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
    const re = this.fire.post.create( post )
    .then( res => {
      this.failure('Create post but user not logged in test. Failed');
    })
    .catch( e => {
      this.test(e.message === E.USER_IS_NOT_LOGGED_IN, 'Create post without login should be error');
    });
  }
}
