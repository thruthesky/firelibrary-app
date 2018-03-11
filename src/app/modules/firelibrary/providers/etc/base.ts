import * as firebase from 'firebase';
import { } from './interface';
export * from './interface';
export { Library as _ } from './library';
import { } from './define';
export * from './define';




export class Base {
    static firebase: firebase.app.App;

    auth: firebase.auth.Auth;
    db: firebase.firestore.Firestore;
    storage: firebase.storage.Storage;
    constructor(public collectionName = '') {

        this.auth = Base.firebase.auth();
        this.db = Base.firebase.firestore();
        this.storage = Base.firebase.storage();


    }

    version() {
        return '0.0.2';
    }




    get collection(): firebase.firestore.CollectionReference {
        if (this.collectionName) {
            console.log('col name: ', this.collectionName);
            return this.db.collection(this.collectionName);
        } else {
            return null;
        }
    }



}

