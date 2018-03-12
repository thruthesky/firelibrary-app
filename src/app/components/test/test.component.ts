import { Component, OnInit } from '@angular/core';
import { FireService, _, CATEGORY_ID_IS_EMPTY, CATEGORY_DOES_NOT_EXIST } from '../../modules/firelibrary/core';



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
    console.log(`Success: [${this.count.success}/${this.count.test}]: `);
    if (params && params.length) {
      for (const p of params) {
        console.log(p);
      }
    }
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
    this.categoryCreateWrongID();
    this.categoryGetWrongID();
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
