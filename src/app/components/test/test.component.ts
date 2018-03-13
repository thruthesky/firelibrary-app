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
  ) {

  }

  ngOnInit() {
    this.run();
  }


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
  failure(...params) {
    this.count.test++;
    this.count.failure++;
    console.error(`Failture: [${this.count.failure}/${this.count.test}]: `);

    if (params && params.length) {
      for (const p of params) {
        console.error(p);
      }
    }
  }
  test(b, ...params) {
    if (b) {
      this.success(params);
    } else {
      this.failure(params);
    }
  }

  run() {
    this.version();
    this.user();
    this.category();
  }
  version() {
    const version = this.fire.version();
    this.test(_.isString(version), `Version: ${version}`);
  }
  user() {

  }
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
        this.test(e.code === CATEGORY_ID_IS_EMPTY, 'Expect error with empty data');
        // console.log('error code: ', e.code);
        // console.log('error message: ', e.message);
        // console.error('error stack log: ', e);
      });
    this.fire.category.create(<any>{ id: '' })
      .then(re => {
        this.failure('Creating category should be failed with empty category id');
      })
      .catch(e => {
        this.test(e.code === CATEGORY_ID_IS_EMPTY, 'Expect error with empty category id');
      });



  }
  categoryGetWrongID() {

    this.fire.category.get('wrong-category-id')
      .then(x => this.failure('Category get with wrong id must be failed'))
      .catch(e => this.test(e.code === CATEGORY_DOES_NOT_EXIST, 'Expect error on getting a category with wrong id', e.code, e.message));
  }
}
