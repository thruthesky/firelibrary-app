import * as firebase from 'firebase';
import { RESPONSE, SYSTEM_CONFIG } from './interface';
export * from './interface';
export { Library as _ } from './library';
export * from './define';
export * from './error';






export class Base {
    static firebase: firebase.app.App = null;
    static functions = false;
    auth: firebase.auth.Auth = null;
    db: firebase.firestore.Firestore = null;
    storage: firebase.storage.Storage = null;
    constructor(public collectionName = '') {

        this.auth = Base.firebase.auth();
        this.db = Base.firebase.firestore();
        this.storage = Base.firebase.storage();


    }
    static configure(config: SYSTEM_CONFIG) {
        Base.firebase = config.firebaseApp;
        Base.functions = config.functions;
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


    success(data?): any {
        return {
            code: null,
            data: data
        };
    }
    failure(e: Error): any {
        e['code'] = e.message;
        e['message'] = e.message; /// @todo translate it.
        return Promise.reject( e );
    }



}

