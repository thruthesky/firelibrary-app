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
    await ( new TestUser(this.fire) ).run();
    (new TestCategory(this.fire)).run();
    // this.version();
    // this.library();
    // this.translate();

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
    const re = this.fire.post.create(post)
      .then(res => {
        this.bad('Create post but user not logged in test. Failed');
      })
      .catch(e => {
        this.test(e.message === USER_IS_NOT_LOGGED_IN, 'Create post without login should be error', 'Message: ' + e.message);
      });
  }
  createPostSuccess() {
    //
  }
}
