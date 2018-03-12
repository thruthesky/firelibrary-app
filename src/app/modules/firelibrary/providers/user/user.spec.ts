import { TestBed, inject } from '@angular/core/testing';


import { FireService } from './../fire.service';
import {  } from './../etc/base';
import { firebaseInit } from './../test.init';
firebaseInit();


describe('User', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FireService]
    });
  });

//   it('should be an error of no category id', inject([FireService], async (fire: FireService) => {
//     const re = await fire.category.create(<any>{}).catch(e => e);
//     // console.log('create re..: ', re);
//     expect( re['message'] ).toBe( CATEGORY_ID_IS_EMPTY );

//   }));


});


