import { INVALID_EMAIL, WEAK_PASSWORD } from '../../core';
import { Base, _, USER, COLLECTIONS } from './../etc/base';
import * as firebase from 'firebase';
export class User extends Base {
    constructor() {
        super(COLLECTIONS.USERS);
    }
    get isLogin(): boolean {
        if (this.auth.currentUser) {
            return true;
        } else {
            return false;
        }
    }
    get isLogout(): boolean {
        return !this.isLogin;
    }
    get uid(): string {
        if (this.auth.currentUser) {
            return this.auth.currentUser.uid;
        } else {
            return null;
        }
    }
    get displayName(): string {
        if (this.auth.currentUser) {
            return this.auth.currentUser.displayName;
        } else {
            return null;
        }
    }
    /**
     * Validates user data to be used for registration
     * @param user User data to validate
     */
    async registerValidator(user: USER): Promise<any> {
        /**PASSWORD VALIDATION**/
        if (user.displayName) {
            if ( user.password.toLowerCase().indexOf(user.displayName.toLowerCase()) > -1 ) {
                return this.failure(WEAK_PASSWORD, { message: 'Password should not contain display name.'});
            }
        }
        if (user.email) {
            const email = user.email.split('@');
            if (user.password.toLowerCase().indexOf(email[0].toLowerCase()) > -1) {
                return this.failure(WEAK_PASSWORD, { message: 'Password should not contain email.'});
            }
        }
        if ( !user.password.match(/[0-9]/g)) { // must contain number
            return this.failure(WEAK_PASSWORD, { message: 'Password should contain atleast 1 number'});
        }
        if ( !user.password.match(/[a-zA-Z]/g)) { // must contain number
            return this.failure(WEAK_PASSWORD, { message: 'Password should contain atleast 1 letter.'});
        }
        /**EMAIL VALIDATION
         * empty and invalid email format
         *  - are handled by firebase by default.
         */

        return null;
    }
    /**
    * User regigration with email and password.
    * @desc this method get user data from HTML FORM including email, password, displayName, gender, birthday, etc.
    * @desc `Firebase Authentication` needs to create an `Authentication` in their `Authentication Service`.
    *      The app
    *          1. Create an Authentication (on the Authentication Service)
    *          2. Update the profile on the Authentication with displayName and photoURL.
    *          3. Sets other information on `users` collection.
    */
    register(data: USER): Promise<firebase.User> {
        return this.registerValidator(data)
        .then( () => {
                return this.auth.createUserWithEmailAndPassword(data.email, data.password) // 1. create authentication.
            .then((user: firebase.User) => { // 2. update Authentication(profile) with `dispalyName` and `photoURL`
                return this.updateAuthentication(user, data);
            })
            .then((user: firebase.User) => { // 3. update other information like birthday, gender on `users` collection.
                return this.set(user, data);
            });
        })
        .then( a => this.success(a) )
        .catch( e => this.failure(e) );
    }

login(email: string, password: string): Promise<any> {
    return this.auth.signInWithEmailAndPassword(email, password);
}

logout() {
    this.auth.signOut();
}
/**
* Update `displayName`, `photoURL` on Authentication.
* @desc it does not update other information.
* @see `this.updateProfile()` for updating user information.
*/
updateAuthentication(user: firebase.User, data: USER): Promise<firebase.User> {
    const up = {
        displayName: user.displayName,
        photoURL: user.photoURL
    };
    return user.updateProfile(_.sanitize(up)).then(x => user);
}
updateProfile() {
}

/**
* Sets user information on user collection.
*/
set(user: firebase.User, data: USER): Promise<firebase.User> {
    delete data.displayName;
    delete data.photoURL;
    delete data.password;
    data.created = firebase.firestore.FieldValue.serverTimestamp();
    return this.collection.doc(user.uid).set(data).then(x => user);
}

/**
* For Unit-testing - Get user to delete.
*
* @author gem
*/
getUser() {
    return this.auth.currentUser;
}
}

