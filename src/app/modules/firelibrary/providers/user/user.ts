import { INVALID_EMAIL, WEAK_PASSWORD, PASSWORD_TOO_LONG, UNKNOWN, FIREBASE_API_ERROR } from '../etc/error';
import { Base, _, USER, COLLECTIONS, RESPONSE } from './../etc/base';
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
    get email(): string {
        if (this.auth.currentUser) {
            return this.auth.currentUser.email;
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
    * @desc Validates user data to be used for registration
    * @param user User data to validate
    */
    async registerValidator(user: USER): Promise<any> {
        /**PASSWORD VALIDATION**/
        if (! _.isString(user.password) || ! _.isString(user.email)) {
            return this.failure(FIREBASE_API_ERROR, { info: 'Password and Email should contain valid string.' });
        }
        // As prescribe in `https://stackoverflow.com/questions/98768/should-i-impose-a-maximum-length-on-passwords`
        if (user.password.length > 128) {
            return this.failure(PASSWORD_TOO_LONG);
        }
        if (user.displayName) {
            if (user.password.toLowerCase().indexOf(user.displayName.toLowerCase()) > -1) {
                return this.failure(WEAK_PASSWORD, { message: 'Password should not contain display name.' });
            }
        }
        if (user.email) {
            const email = user.email.split('@');
            if (user.password.toLowerCase().indexOf(email[0].toLowerCase()) > -1) {
                return this.failure(WEAK_PASSWORD, { message: 'Password should not contain email.' });
            }
        }
        if (!user.password.match(/[0-9]/g)) { // must contain number
            return this.failure(WEAK_PASSWORD, { message: 'Password should contain atleast 1 number' });
        }
        if (!user.password.match(/[a-zA-Z]/g)) { // must contain letter
            return this.failure(WEAK_PASSWORD, { message: 'Password should contain atleast 1 letter.' });
        }
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
    register(data: USER): Promise<RESPONSE> {
        return this.registerValidator(data)
        .then(() => {
            return this.auth.createUserWithEmailAndPassword(data.email, data.password); // 1. create authentication.
        })
        .then((user: firebase.User) => {
            return this.updateAuthentication(user, data); // 2. update Authentication(profile) with `dispalyName` and `photoURL`
        })
        .then((user: firebase.User) => {
            return this.set(user, data); // 3. update other information like birthday, gender on `users` collection.
        })
        .then(a => this.success(a))
        .catch(e => this.failure(e));
    }
    /**
    * Validator for User.login()
    */
    async loginValidator( email: string, password: string ): Promise<any> {
        /**
        * Test email and password should be both `string`
        */
        if (! _.isString(email) || ! _.isString(password) ) {
            return this.failure(FIREBASE_API_ERROR, {info: 'Both email and password should contain valid string.'});
        }
        return null;
    }
    /**
    * Login User
    * @param email
    * @param password
    */
    login(email: string, password: string): Promise<any> {
        return this.loginValidator(email, password)
        .then( () => {
            return this.auth.signInWithEmailAndPassword(email, password);
        })
        .then( a => this.success(a))
        .catch( e => this.failure(e));
        // .catch( e => e );
    }
    /**
    * Logout user.
    */
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
    /**
    *
    */
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
    getCurrentUser() {
        return this.auth.currentUser;
    }
}

