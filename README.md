# Firelibrary

Firebase CMS Library for Frontend

## Goal

* To make a forum with chatting functionality.
 * Person A post a question.
 * Person B answers.
 * A gets push notification and view the answer and replies immedately.
 * Realtime chat begins on the post
  * and the comments will be open to public since it is merely a comments.


## TODO
* counting likes/dislikes
 * Client does not need to get all the documents since it has backend option.
   so, simple add/deduct 1.
 * Functions does not need to get all the documents since it is safe.
   For functions, security rule for like/dislike must be changed.
* push notifications.
* add `/posts` in the middle of storage path.
* @bug realtime update is not working when there is no post. it works only after there is a post.
* @bug small. when edit, it appears as edited at first and disappears quickly when it is not the user's post. It may be the problem of `local write` in firestore.
* photo thumbnail on functions.
 * @see `# File Upload & Thumbnail.`
 * photos are thumbnailed.
 * if backend updates the post/comment document onCreate, there maybe a chance that on the time of `onCreate` event of post/commnet, the thumbnails may not be generated.
 * do it on client end after post/comment create.

* delete uploaded files when post/comment is deleted.
* delete thumbnails.
* Admin dashboard.
 * installation page.
  * If /settings/admin does not exist, you can install(put your email as admin).
* Security rules on post if the category does not exist, then fail.
* check post's uid on creation. a user may put another user's uid on post and that can cause a problem

* file upload
 * if a file uploaded successfully,
    the file's metadata will have `success: true`.
    Without it, the file is not uploaded. The user may stop posting after uploading.
 * all files without `success: true` must be deleted some time laster.


* Functions options
 * git repo: https://github.com/thruthesky/firelibrary-functions
 * @see functions code https://github.com/firebase/functions-samples
 * Counting comment, likes/dislikes, counting numberOfPosts, numberOfComments.
 * Push notificaton.
  * User can have options. push on reply.


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

* Cleaning tool for deleted posts.

* Rewrite firelibrary to support any kinds of platform.
 * To make it work on `vuejs` and other platform, it needs to be rewritten on simple javascript platform not in angular paltform.
 

## Change log
* @since 2018-03-20 admin email must be saved under /fire-library/{domain}/settings/admin/{email: ... }
 * It can have only one email for admin now.

## Documents

* We use compodoc to generator documents based on Javascript comments.
* Github - https://github.com/thruthesky/firelibrary
* Npm - https://www.npmjs.com/package/firelibrary
* Webiste - www.firelibrary.net


# What you can do with FireLibrary

* @see ### Realtime update


# Programming Tips.

* Use site domain as firelibrary domain.
 * If your domain is 'abc.com', use `/firelibrary/abc.com/...` as your database.
* To upload image, show images locally on the form. in that way, you do not need to download the uploaded images to show it on form.


## How to install firelibrary into another project


* npm i firebase firelibrary

* initialize `firebase` app.

* set the `firebase` app onto `firelibrary` like below.

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
* `We` me and the core developers.
* `You` are the ones who are using this `FireLibrary`.
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

* @since 2018-03-20. It is no longer used.

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
    function isMyDocument() {
    	return resource.data.uid == request.auth.uid
    }
    function isDomainAdmin(domain) {
      return isLogin()
        && get(/databases/$(database)/documents/fire-library/$(domain)/settings/admin).data.email == request.auth.token.email;
    }
    
    function domainPostLikeCreateValidator(domain, post, col) {
    	return isLogin()
      	&& !exists(/databases/$(database)/documents/fire-library/$(domain)/posts/$(post)/$(col)/$(request.auth.uid));
    }
    
    function domainPostLikeDeleteValidator(domain, post, col) {
    	return isLogin()
      	&& exists(/databases/$(database)/documents/fire-library/$(domain)/posts/$(post)/$(col)/$(request.auth.uid));
    }
  
    function domainCommentLikeCreateValidator(domain, post, comment, col) {
    	return isLogin()
      	&& !exists(/databases/$(database)/documents/fire-library/$(domain)/posts/$(post)/comments/$(comment)/$(col)/$(request.auth.uid));
    }
    function domainCommentLikeDeleteValidator(domain, post, comment, col) {
    	return isLogin()
      	&& exists(/databases/$(database)/documents/fire-library/$(domain)/posts/$(post)/comments/$(comment)/$(col)/$(request.auth.uid));
    }
    
    // settings collection
    match /fire-library/{domain}/settings {
    	match /admin {
      	allow read: if false;
        allow create: if !exists(/databases/$(database)/documents/fire-library/$(domain)/settings/admin);
        allow update: if isDomainAdmin( domain );
      }
      match /installed {
      	allow read: if true;
        allow create: if !exists(/databases/$(database)/documents/fire-library/$(domain)/settings/installed);
      }
      match /{document=**} {
      	allow read: if true;
        allow write: if isDomainAdmin( domain );
      }
    }
    
    // user collection (new rule)
    match /fire-library/{domain}/users/{user} {
    	allow read: if isMyDocument();
      allow create: if isLogin();
      allow update: if isMyDocument();
      allow delete: if isMyDocument();
    }
    
    // category collection (new urle)
    match /fire-library/{domain}/categories/{category} {
    	allow read: if true;
      allow create: if isDomainAdmin(domain);
      allow update: if isDomainAdmin(domain);
      allow delete: if isDomainAdmin(domain);
    }
    
    // post collection ( new rule )
    match /fire-library/{domain}/posts/{post} {
      allow get: if true;
      allow list: if request.query.limit <= 50;
      allow create: if isLogin()
        && request.resource.data.keys().hasAll(['category', 'uid'])
        && exists(/databases/$(database)/documents/fire-library/$(domain)/categories/$(request.resource.data.category))
        && request.resource.data.uid == request.auth.uid;
      allow update: if isLogin() && isMyDocument();
      // allow delete: if postDeleteValidator();
      
      match /likes {
        match /count {
        	allow read, write: if true;
        }
      	match /{like} {
          allow read: if true;
          allow create: if domainPostLikeCreateValidator( domain, post, 'likes' );
          allow delete: if domainPostLikeDeleteValidator( domain, post, 'likes' );
        }
      }   
      match /dislikes {
        match /count {
        	allow read, write: if true;
        }
      	match /{like} {
          allow read: if true;
          allow create: if domainPostLikeCreateValidator( domain, post, 'dislikes' );
          allow delete: if domainPostLikeDeleteValidator( domain, post, 'dislikes' );
        }
      }
      match /comments {
        match /{comment} {
        	allow read: if true;
        	allow create: if isLogin();
          allow update: if isLogin() && isMyDocument();                
          match /likes {
            match /count {
              allow read, write: if true;
            }
            match /{like} {
              allow read: if true;
              allow create: if domainCommentLikeCreateValidator( domain, post, comment, 'likes' );
              allow delete: if domainCommentLikeDeleteValidator( domain, post, comment, 'likes' );
            }
          }   
          match /dislikes {
            match /count {
              allow read, write: if true;
            }
            match /{like} {
              allow read: if true;
              allow create: if domainCommentLikeCreateValidator( domain, post, comment, 'dislikes' );
              allow delete: if domainCommentLikeDeleteValidator( domain, post, comment, 'dislikes' );
            }
          }
        }
      }
    }
    // eo new rule
  }
}
````

# Firebase Storage Rules
````
service firebase.storage {
  match /b/{bucket}/o {
		// Only an individual user can write to "their" images
    match /firelibrary/{domain}/{userId}/{allImages=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
````



# Ideas

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

## POST

### Realtime update

* If the posts/comments are updated in realtime, you can build a forum with chatting fuctionality.
 Normally chatting functinality has a realtime update with the messages of other users chat.
 * When you have a QnA forum and person A asks something on the forum.
 * Person B replies on it.
 * the person A gets `push-notification` with the reply on his question.
 * the person A opens the forum and may comments on the reply of person B.
 * Person B gets `push-notification` and opens the qna post.
 * Person B replies again
 * And the chatting fuctionality begins since the comments are updated in realtime and the forum post page may really look like a chat room depending on the desing.
 * It is still a forum. You can open the chat to public simple as a forum posts/comments.



### No post delete.

* When user clicks on delete button to delete the post, firelibrary does not actually delete the post.
  Instead, it marks as deleted.
  * Reasion. There might be comments that belongs to the post. And we consider it is not the poster's previlledge to delete all the comments which are belonging to the comment writers. They shouldn't be disappears only because the poster deleted his post. The comments should be still shown.

* When there is no comments belong to the post, the post may be moved into `posts-trash` collection.




## Installation
With the condition below, you can do installation.

* If `/settings/installed` document exists, it is considered to be installed already.
* `/settings` collection is writable only by admin.
* `/settings/admin` is creatable only if it does not exist.
 Meaning once it is set, it is no longer creatable.
 It can be edited once it is set and if the user logged in as admin email.


1. check if `/settings/installed` exists. If yes, it is installed already.
2. if not, set `/settings/admin.email` with your email.
3. and login as admin
4. set `/settings/installed.time`.

And with that admin account, you can do admin things.



### Example

* @see install.component ts/html


### Case study

* Somehow if `/settings/admin.email` is already set, but `/settings/installed` is not set,
  then you may need to install.
  You will only need to set `/settings/installed`. If you are going to set admin email when it is already exists, you get permission error on installation.

# File Upload & Thumbnail.


* Uploaded files are saved on storage.
 * for files - `fire-library/{domain}/{user-uid}/{post-document-id}/{files}`.
 * for comments - `fire-library/{domain}/{user-uid}/{post-document-id}/comments/{comment-document-id}/{files}`.

* When uploaded files are saved, thumbnails are generated and their paths are saved on
 * for files - `temp/storage/thumbnails/fire-library/{domain}/{user-uid}/{post-document-id}/{file}/{created: time}`
 * for comments - `temp/storage/thumbnails/fire-library/{domain}/{user-uid}/{post-document-id}/comments/{comment-document-id}/{file}/{created: time}`.





# Firebase Cloud Functions

* There are some cases that `Firebase Functions` is needed
 * Counting likes/dislikes
 * Photo thumbnail
 * Push notification
 * etc.


## FireLibrary Functions Installation

If you want a better performance, you can use `firelibrary-functions`.

When `firelibrary-functions` is installed,

 * counting likes/dislikes
 * photo thumbnails

  are authmatically running.



If you are going to use `firelibrary-functions`, you will need to change `like/dislikes` security rules. You need to remove the rules for it or block it. since it is done in the functions with admin previlegdes.


````
$ git clone https://github.com/thruthesky/firelibrary-functions
$ cd firelibrary-functions/
$ firebase add ...
// change security key file.
$ firebase deploy
````




## counting likes/dislikes

* number of likes and dislikes may not updated immediately after voting.
 * You may handle time delay.

## thumbnail

* File is uploaded on
 * for files - `firelibrary/{domain}/{user-uid}/posts/{post-document-id}/{files}`.
 * for comments - `firelibrary/{domain}/{user-uid}/posts/{post-document-id}/comments/{comment-document-id}/{files}`.
* thumbnail will be definitely needed if you are going to show images on front page or post list.
* thumbnail is generated when a post/comment is created.

* Reminder. When a post/comment is created, it fires `onSnapshot()` event immediately or **even** the post/comment is not created(saved) in Database, the event is fired due to `local write`.
Either way, it may not contain the `thumbnailUrl` since `thumbnailUrl` updates is done by `Cloud Functions` and it is not as faster as the post/comment create(`onSnapshot()`) event. But after a few seconds later `thumbnailUrl` will be available. Probably on next page refresh.

## push notificatoin




# Known Issues

## File upload

* If you upload photos with same file name and you are using `Firelibrary Functions`,
 Thumbnail will only generate the first file.
 It does not thumbnail correctly if photos with same name uploaded.
 Since it's a small bug, we simple ignore this.
 * Cause: when thumbnails are generated, it saves a temp data with the uploaded file name.
  If there is same file name, then the problem begins.