import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase';
import { RESPONSE, SYSTEM_CONFIG } from './interface';
export * from './interface';
import { Library as _ } from './library';
export { Library as _ } from './library';
export * from './define';
export * from './error';

export * from './languages/en';







export class Base {
    static firebase: firebase.app.App = null;
    static functions = false;
    static http: HttpClient = null; // HttpClient object initiated from FireService

    /**
     *
     * Languages
     * You can change user language with setLanguage()
     */
    static language = 'en';
    static languageFolder = 'assets/lang'; // It can be changed by settings ` Base.languageFolder = '.../...'; `
    static texts: { [language: string]: any } = {};


    ///
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

    get http(): HttpClient {
        return Base.http;
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
    failure(e: Error, info?): any {
        e['code'] = e.message;
        e['message'] = this.translate(e.message, info);
        return Promise.reject(e);
    }




    translate(code: any, info?): string {
        return _.patchMarker(this.getText(code), info);
    }

    getText(code: any): string {
        return code;
        // let text = null;
        // if ( this.getLanguage() !== 'en' ) {
        //     text =
        // }
        // return en[code];
    }

    getLanguage(): string {
        return Base.language;
    }
    /**
     *
     * @returns a Promise<any> on success. Otherwise error will be thrown.
     * @see README## Langulage Translation
     */
    setLanguage(ln: string): Promise<any> {
        if ( ln === 'en' ) {
            return Promise.resolve();
        }
        if ( Base.texts[ ln ] ) {
            return Promise.resolve();
        }
        Base.language = ln;
        return this.http.get(`/${Base.languageFolder}/${ln}.json`).toPromise()
            .then( re => Base.texts[ ln ] = re );
    }

}

