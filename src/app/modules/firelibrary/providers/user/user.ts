import { Base, _, USER, COLLECTIONS } from './../etc/base';
import * as firebase from 'firebase';
export class User extends Base {

    constructor() {
        super(COLLECTIONS.USERS);

    }

    get displayName(): string {
        if (this.auth.currentUser) {
            return this.auth.currentUser.displayName;
        } else {
            return null;
        }
    }

    register(data: USER): Promise<firebase.User> {

        return this.auth.createUserWithEmailAndPassword(data.email, data.password)
            .then((user: firebase.User) => {
                return this.updateProfile(user, data);
            })
            .then((user: firebase.User) => {
                // newUser;
                return this.set(user, data);
            });

    }

    login( email: string, password: string ): Promise<any> {
        return this.auth.signInWithEmailAndPassword( email, password );
    }

    logout() {
        this.auth.signOut();
    }
    /**
     * Update `displayName`, `photoURL` on Authentication.
     */
    updateProfile(user: firebase.User, data: USER): Promise<firebase.User> {
        const up = {
            displayName: user.displayName,
            photoURL: user.photoURL
        };
        return user.updateProfile(_.sanitize(up)).then(x => user);
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
}

