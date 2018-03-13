# Firelibrary

Firebase CMS Library for Frontend

## TODO

* user update with email/password login.
* Authentication social login and profile update.
* resign.
* User profile photo update.
 * Check if `photoURL` is erased every login. then `photoURL` should be saved in `users` collection.
* Update rules

* Create posts under `posts` collection.
 * Anonymous can post with `Firebase Authentication Anonymous Login`



## Documents

* Github - https://github.com/thruthesky/firelibrary
* Npm - https://www.npmjs.com/package/firelibrary
* Webiste - www.firelibrary.net



## How to install firelibrary into another project


* npm i firebase firelibrary

* initialize `firebae` app.

* set the `firebase` app onto `firelibrary` like below
````
import * as firebase from 'firebase';
import "firebase/firestore";
firebase.initializeApp(config.firebase);

````



## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build and publish

Run `npm run pack` to build the project into `firelibrary` node module. The build artifacts will be stored in the `dist/` directory. Use the `npm publish dist` to distribute.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



# Development

* Simple clone this git repository and run `ng serve`
* `src/app/modules/firelibrary` is the `firelibrary` folder. It uses `ng-packagr` to package and distribute.
* Please submit your `pull request` if you want to update.


## Client Side Coding Limitation

* For CRUD by the admin, owner, guest has no problem if they do it on their own documents(data).

* But if there is any document or any property that should be edited by every one, That's a problem.
 * Let's say, when a user reads a post, the docuemnt must count number of views.
  * It can be done in Client side increasing 1 of the property.
  * But what if the user increases 999 instead of 1?
  * `Firebase config` keys are open. And they can do whatever if the permission is open to public.

* For `Like` and `Dislike`.
 * When a user clicks on `Like`, the app can `add` who liked the post on `posts/{post-id}/likes/{uid}`. And when he `Un-Like` it, the app can `delete` it. This is the same on `Dislike` and `Un-Dislike`.
 * But the app still needs how many users liked/disliked the post.

### Solution

#### Solution #1. Let it be
* This is the default.
* Just let it be. Ignore what will happen. Users can edit what they can on Client Side. Even if they mess up, that's not a big problem.


#### Solution #2. Functions
* Protect editing for those doucments and properties with `Firebase Firestore Rules`.
* And do it on functions.
 * `FireLibrary` comes with this option. 
 * @see `Functions` section on how to do it.


## Functions

* If you want to use functions,
 * set `functions: true` on module importing
 * and install the functions in `firelibrary/functions/index.js`

## Unit Testing

* We have a test page component in which all tests are written.
 * You can simply click the link and the app will load test component page.


### What happen to Karma & Jasmine.

* Well, We decided not to use Karma & Jasmine.
 * If you want to pursue using Karma & Jasmine, you can look into `providers/fire.service.spect.ts` and `providers/category/category.spect.ts` for sample test codes.
 * Run `npm run test` and you will see the results.

## Response of FireLibrary. How to handle the return.

All the calls to the `firelibrary` return a Promise of `RESPONSE` type.

If there is no error, then `.then( (re: RESPONSE) => { ... })` would be followed by `firelibrary` call.

If there is error, then `.catch( (re: RESPONSE) => { ... })` would be followed by `firelibrary` call.


### How to handle errors.
* `e.code` is a string of error code.
* `e.message` should be translated already and ready to be used with alert();
* you can `console.error(e)` to view the call stack.
````
  category() {
    this.fire.category.create(<any>{})
      .then(re => {
        console.log( re.data );
      })
      .catch(e => {
        console.log('error code: ', e.code);
        console.log('error message: ', e.message);
        console.error('error stack log: ', e);
      });
  }
````


## Language Translation

* By default, the language is `en` and the text of `en` language is saved in Typescript while other language files are saved in separately in JSON file.

* `en` language is saved in `firelibrary/etc/languages/en.ts` and is loaded in memory by default.
 * So, any language code that is not exist in other language will use `en` language as fallback.
 * All other language text is saved in `assets/lang` folder by default like `assets/lang/ko.json`, `assets/lang/cn.json`.
 * JOSN language files are loaded dynamically through `http.get`. So it does not affects the booting speed.