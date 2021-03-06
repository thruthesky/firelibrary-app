﻿import { TestUser } from './test.user';
import { POST, USER } from './../../modules/firelibrary/providers/etc/interface';
import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  FireService,
  _,
  CATEGORY_DOES_NOT_EXIST, UNKNOWN, INVALID_EMAIL,
  WEAK_PASSWORD, EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, CATEGORY_EXISTS,
  USER_IS_NOT_LOGGED_IN, NOT_FOUND, DOCUMENT_ID_TOO_LONG, DOCUMENT_ID_CANNOT_CONTAIN_SLASH, Base
} from '../../modules/firelibrary/core';

import { TestValidator } from './test.validator';
import { TestTools } from './test.tools';
import { TestError } from './test.error';
import { TestCategory } from './test.category';
import { TestPost } from './test.post';
import { TestRules } from './test.rules';
import { TestComment } from './test.comment';

import * as firebase from 'firebase';
import * as settings from './test.settings';
import { TestInstall } from './test.install';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent extends TestTools implements OnInit, OnDestroy {
  oldDomain = '';
  constructor(
    fire: FireService
  ) {
    super();
    TestTools.fire = fire;
    this.oldDomain = Base.collectionDomain;
    Base.collectionDomain = 'unit-test';
  }

  ngOnInit() {
    this.run();
  }
  ngOnDestroy() {
    Base.collectionDomain = this.oldDomain;
    this.fire.post.stopLoadPage();
  }

  /**
   * Logs in as admin and create `Testing` category.
   */
  async prepareTest(): Promise<any> {
    const isAdmin = await this.loginAsAdmin();
    if (isAdmin) {
      await this.fire.category.create({ id: settings.TEST_CATEGORY, name: 'Testing' })
        .catch(e => console.log(settings.TEST_CATEGORY, ' already exists!'));
    }
  }

  /**
  * Runs the all service testing.
  */
  async run() {

    this.translate();

    await (new TestInstall).run();

    await this.prepareTest()
      .then(() => { // register member with displayname
        return this.loginAs(settings.MEMBER_EMAIL, settings.MEMBER_PASSWORD, settings.MEMBER_DISPLAY_NAME);
      })
      .then(() => { // logout
        return this.logout();
      })
      .then(() => {
        // this.run();
        console.log('Preparation done... test starts!');
      })
      .catch(e => this.bad('Error preparing test...', e));

    this.version();
    this.library();

    await (new TestRules()).run();
    await (new TestError()).run();
    await (new TestUser()).run();
    await (new TestCategory()).run();
    await (new TestPost()).run();
    await (new TestComment()).run();

    // await (new TestComment()).sortTest();
    // await (new TestComment()).createTest();
    // await (new TestComment()).editTest();
    // await (new TestComment()).deleteTest();

  }

  get count() {
    return TestTools.count;
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
    this.test(re.length === 5, 'Language hould be 5 letter', re);
  }

  /**
  * Tests Language Translator
  */
  async translate() {
    const old = this.fire.getLanguage();
    await this.fire.setLanguage('en').then( re => console.log('setLanguage(en) re: ', re));

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

    /**
     * Adding language code dynamically.
     */
    const testText = 'This is test text. #no';
    const testCode = 'test-code';
  //  Base.texts['en'][testCode] = testText; /// Warning. no uppercase.
    this.fire.addText(testCode, testText);  /// It is now saved as uppercase.
    this.test(this.fire.t(testCode) === testText, 'Inserting a text dynamically.', this.fire.t(testCode));
    this.test(this.fire.t(testCode, { no: 5 }) === testText.replace('#no', '5'),
      'Patching information on dynamic text', this.fire.t(testCode, { no: 5 }));

    /**
     * Loading another language (JSON file) by setting URL to load from.
     */
    this.fire.setLanguage('cn', '/assets/cn.json')
      .then(re => {
        this.good('External JSON langauge file loaded.', this.fire.t(NOT_FOUND));
        /**
         * Adding text dynamically on externally loadded language.
         */
        this.fire.addText('count-123', '一二三 #no');
        this.test(this.fire.t('count-123', { no: 5 }) === '一二三 #no'.replace('#no', '5'),
          'Patching information on externally loaded language', this.fire.t('count-123', { no: 5 }));
      })
      .catch(e => this.bad('Failed to set a Language'));

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
