import { TestUser } from './test.user';
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
import { TestPost } from './test.post';
import { TestRules } from './test.rules';

import * as firebase from 'firebase';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent extends TestTools implements OnInit {
  constructor(
    fire: FireService
  ) {
    super();
    TestTools.fire = fire;
  }
  ngOnInit() {
    this.run();
  }

  /**
  * Runs the all service testing.
  */
  async run() {


    // let re = await this.loginAs('AAA@AAA.com', 'b018,z8*a~');
    // console.log('re: ', re, firebase.auth().currentUser.email);
    // re = await this.loginAs('BBB@BBB.com', 'b018,z8*a~');
    // console.log('re: ', re, firebase.auth().currentUser.email);
    // re = await this.loginAs('CCC@CCC.com', 'b018,z8*a~');
    // console.log('re: ', re, firebase.auth().currentUser.email);
    // await firebase.auth().signOut();
    // re = await this.loginAsAdmin();
    // console.log('re: ', re, firebase.auth().currentUser.email);
    // re = await this.loginAs('DDD@DDD.com', 'b018,z8*a~');
    // console.log('re: ', re, firebase.auth().currentUser.email);
    // re = await this.loginAs('EEE@EEE.com', 'b018,z8*a~');
    // console.log('re: ', re, firebase.auth().currentUser.email);


    await this.asMemberTest();


    // await this.asAnonymousTest();
    // await this.asMemberTest();
    // await this.asAdminTest();

    // this.version();
    // this.library();
    // this.translate();
  }

  get count() {
    return TestTools.count;
  }

  /**
  * Run test as anonymous
  */
  async asAnonymousTest() {
    console.log('=========================> ANONYMOUS TEST');
    // Run tests here.
    await (new TestError()).asAnonymous();
    await (new TestValidator()).asAnonymous();
    await (new TestRules()).asAnonymous();

    await (new TestUser()).asAnonymous();
    await (new TestCategory()).asAnonymous();
    await (new TestPost()).asAnonymous();

  }
  /**
  * Run test as member
  */
  async asMemberTest() {
    console.log('=========================> MEMBER TEST');
    const user = { email: 'user' + (new Date).getTime() + '@test.com', password: 'UserTest123' };
    const isLogin = await this.loginAs( user.email, user.password);

    if ( isLogin ) {
      console.log( 'Logged in..', this.fire.user.uid );
      // Run tests here
      // await (new TestError()).asMember();
      // await (new TestValidator()).asMember();
      // await (new TestRules()).asMember();

      // await (new TestUser()).asMember();
      // await (new TestCategory()).asMember();
      // await (new TestPost()).asMember();

      await (new TestRules()).postRulesAsMember();

    } else {
      return this.bad(`Testing as admin Member. email: ${user.email} password:${user.password}`);
    }
  }
  /**
  * Run test as admin
  */
  async asAdminTest() {
    console.log('=========================> ADMIN TEST');
    const isLogin = await this.loginAsAdmin();

    if ( isLogin ) {
      // Run Tests here
      await (new TestError()).asAdmin();
      await (new TestValidator()).asAdmin();
      await (new TestRules()).asAdmin();

      await (new TestUser()).asAdmin();
      await (new TestCategory()).asAdmin();
      await (new TestPost()).asAdmin();

    } else {
      return this.bad('Failed to login as Administrator.');
    }
  }
  /**
  * Tests current version
  */
  version() {
    const version = this.fire.version();
    this.test(_.isString(version), `Version: ${version}`);
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
