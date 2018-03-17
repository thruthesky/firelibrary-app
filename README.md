# Firelibrary

Firebase CMS Library for Frontend

## TODO
* Security rules on post if the category does not exist, then fail.
* check uid is his uid. a user may put another user's uid on post and that can cause a problem


* Unit test
 * @done (Not much to do) Produce all the errors of https://firebase.google.com/docs/reference/js/firebase.firestore.FirestoreError

   *  emtpy category id
   *  wrong category id: with slash, space, dot, other specail chars.
   *  too long category id
   *  too short category id
   *  category id with existing
   *  category id with
   *  empty category data
   *  too big category data. over 1M. ( this is not easy to test. )
 * Unit test on creating category with admin permission.
* user update with email/password login.
* Authentication social login and profile update.
* resign.
* User profile photo update.
 * Check if `photoURL` is erased every login. then `photoURL` should be saved in `users` collection.
* Update rules

* Create posts under `posts` collection.
 * Anonymous can post with `Firebase Authentication Anonymous Login`

* Rule update
 * Check query data to meet condition.
  * When a user create a post, categoryId must exist in categories collection.


## Documents

* Github - https://github.com/thruthesky/firelibrary
* Npm - https://www.npmjs.com/package/firelibrary
* Webiste - www.firelibrary.net



## How to install firelibrary into another project


* npm i firebase firelibrary

* initialize `firebase` app.

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


## Terms

* `Action Methods` are defined in providers and are handling/manipulating with `Firebase`.
 * Some of `Action Methods` are `Category::create()`, `Category::edit()`, etc.

## Client Side Coding Limitation and PUBLIC META DATA

* For CRUD by the admin, owner, guest has no problem if they do it on their own documents(data).

* But if there is a property that should be edited by every one, That's a problem.
 * Let's say, when a user reads a post, the docuemnt must count number of views.
  * It can be done in Client side increasing 1 of the property.
  * But what if the user increases 999 instead of 1?
  * `Firebase access config` keys are open to public. And they can do whatever if the permission of the document is open to public.

### Post like and dislike
* When a user clicks on `Like`, the app can `add` who liked the post on `posts/{post-id}/likes/{uid}`.    And when the user `Un-Like` it, the app deletes it. This is the same on `Dislike` and `Un-Dislike`.
* and the app needs to count how many users liked/disliked on the post.

* Each post should have `/posts/{post}/likes/{uid}` and `/posts/{post}/dislikes/{uid}`.
* `likes`, `dislikes` should be observed in realtime.
 * which means, it needs to be set in a separate subcollection so it can minimize on downloading playload on observing.
 * It counts how many likes/dislikes was given by reading the whole like/dislike subcollection and saves into `/posts/{post}/likes/count`. And this is the document that should be observed.



### Post
* We will set seucrity rules that
 * User cannot post if the category does not exists.


### Couting no of posts and comments on Category.

* The category may need to know the number of posts/comments that belong to the category.
* And the properties of counting posts/comemnts should be open to public.


When a user does posting/commenting,


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

* We have a test page.
 * You can simply click the link and the app will load test component page.

### How to gain Admin permission on unit testing.
* In `components/test/test.settings.ts`, you can put admin email and password.
 * And you must put admin email on `settings` collection. This means the admin meail in `test.setttings.ts` will become real admin. You will use this only on testing.



### What happen to Karma & Jasmine.

* Well, We decided not to use Karma & Jasmine.
 * If you want to pursue using Karma & Jasmine, you can look into `providers/fire.service.spect.ts` and `providers/category/category.spect.ts` for sample test codes.
 * Run `npm run test` and you will see the results.

## Response of FireLibrary. How to handle the return.

* `Action Methods` must return a Promise of `Base::success()` or `Base::failure()`.
 * The returns of `Base::sucess()` and `Base::failure()` are compatible with `RESPONSE` object.

* If there is no error, then `.then( (re: RESPONSE) => { ... })` would be followed by `Action Methods` call.

* If there is error, then `.catch( (re: RESPONSE) => { ... })` would be followed by `Action Methods` call.


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

## PUBLIC META DATA




## Language Translation

* By default, the language is set to English(`en`) and the text is saved in Typescript while other language texts are saved separately in JSON file.

* `en` language is saved in `firelibrary/etc/languages/en.ts` and is loaded in memory by default.
 * So, any language code that is not exist in other language will use `en` language as fallback.
 * All other language text is saved in `assets/lang` folder by default like `assets/lang/ko.json`, `assets/lang/cn.json`.
 * JOSN language files are loaded dynamically through `http.get`. So it does not affects the booting speed.

* **@warning** The key of the language JSON file is case sensitive. So, becareful on the case.


* It needs sometime for the JSON language files to be loaded since they are loaded by `http.get()`.
 * If you are going to use the language file immediately before loading the language file, English text will be used.

* If error code should be defined in language file so it can be translated to end user.
 * if there is any error that is not translated, you will see a message like `"Error code - not-found - is not translated. Please translate it. It may be firebase error."`.


## Validators

Please follow the rules below when you are going to write a validators.

* validator must have a prefix of the method name it is needed for and postfix of 'Validator'
 * For instance, you need to write a validator for `create` method and the method name of the validator
   would be `createValidator`
* put validator right on top of the caller method.
* must return a Promise. Or it can be `async/wait` method to be chained like below.

````
return this.createValidator(category)
    .then(() => {
        return this.collection.doc(category.id).set(_.sanitize(category));
    })
    .then(() => this.success(category.id))
    .catch(e => this.failure(e));
````

* since all validator returns a `Promise`
 * they are `thenable` and `catchable`.
   * If there is no error, then simply returns null.
   * If there is error on validating, it should return the result of ` failure() `.

## Sanitizers

When there are things to sanitize, it is one good idea to make a separate method for easy structuring.

* All sanitizer must have a prefix of the method name and post fix of `Sanitizer`.
 * For instance, you will write a sinitizer for `create` method, then the name of the sanitizer would be `createSaninitizer`.
* Sanitizer must return the sanitized value even if the data was passed by `reference`.



# Database Structure. Collections and Database Design.

## posts_deleted collection

* If a post is deleted, the post id will be saved under `posts_deleted` collection.
 * This is because deleted posts may have sub collections and they are still living in the `posts` collection.
 * So, `posts_deleted` is to clean the garbages under `posts` collection.
  There should be a node script or functions http trigger to clean this.


# Firebase Security Rules
````
service cloud.firestore {
  match /databases/{database}/documents {
  
    function isLogin() {
    	return request.auth != null;
    }
	  function isAdmin() {
      return isLogin()
        && exists(/databases/$(database)/documents/settings/admins/$(request.auth.token.email)/data);
    }
    function isMy() {
    	return resource.data.uid == request.auth.uid;
    }
    function userReadValidator() {
    	return request.data.uid == request.auth.uid;
    }
    function userCreateValidator() {
    	return isLogin() && request.resource.data.id == request.auth.uid;
    }
    function userUpdateValidator() {
    	return isLogin() && request.data.uid == request.auth.uid;
    }
    function postCreateValidator() {
    	return isLogin()
        && request.resource.data.keys().hasAll(['category', 'uid'])
        && exists(/databases/$(database)/documents/categories/$(request.resource.data.category))
        && request.resource.data.uid == request.auth.uid;
    }
    function postUpdateValidator() {
    	return postCreateValidator() && isMy();
    }
    function postDeleteValidator() {
    	return isMy() || isAdmin();
    }

    match /users/{user} {
    	allow read: if userReadValidator();
      allow create: if userCreateValidator();
      allow update: if userUpdateValidator();
      allow delete: if isMy();
    }
    match /categories/{category} {
    	allow read: if true;
      allow create: if isAdmin();
      allow update: if isAdmin();
    }
    match /posts/{post} {
      allow read: if true;
      allow create: if postCreateValidator();
      allow update: if postUpdateValidator();
      allow delete: if postDeleteValidator();
      // allow get: if request.query.limit <= 10;
    }
  }
}
````



## Ideas

* Increasing/Decreasing by number 1 on `numberOfLikes` when the post was liked or disliked can be a problematic.
 * When a user `like`,
  * it compare if the uid already exists under 'likes' subcollection.
  * if not exists,
   * add 'uid' on the subcollection
   * and add 1 on `numberOfLikes`.
    * Make sure the user cannot add more than 1 by the security rules.
     @see https://firebase.google.com/docs/firestore/security/rules-conditions#data_validation
    * Problem here: The user has already liked it. so the user has a document on `likes` subcollection.
     What if the user want to increase the number 1 again and over again.
     You may still want to do it. and there might be ways like
     * When the user like it, you can leave a timestmap on the document in like subcollection.
      * And increase 1 only if the timestamp is not different in 10 seconds.
     * Or you may want to another subcollection for confirmation.
      When the user like it, create a document under `likes` subcollection and increase by 1 and create another document under
      `like-confirmations` subcollection.
      The user cannot increase `numberOfLikes` anymore because he has a document under `like-confirmation`.
      This still be a problem. What if the user want to create a document only on `likes` collection
      and want to increase number 1 on `numbrerOfLikes` forever?