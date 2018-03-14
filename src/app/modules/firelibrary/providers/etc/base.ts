import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase';
import { RESPONSE, SYSTEM_CONFIG } from './interface';
export * from './interface';
import { Library as _ } from './library';
export { Library as _ } from './library';
export * from './define';
import * as E from './error';
export * from './error';
import { en } from './languages/en';







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
    static texts: { [language: string]: any } = { en: en };


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

    /**
     * Returns the collection of the selected collection in this.collectionName
     */
    get collection(): firebase.firestore.CollectionReference {
        if (this.collectionName) {
            // console.log('col name: ', this.collectionName);
            return this.db.collection(this.collectionName);
        } else {
            return null;
        }
    }


    /**
     *
     * Returns an object of RESPONSE interface.
     *
     * @returns
     *      - <RESPONE> object.
     */
    success(data?): any {
        return {
            code: null,
            data: data
        };
    }

    /**
     *
     * Returns a Promise.
     *
     * @desc This method returns a Promise. And this is important to understand.
     *      Firstly, it will first return a Promise.
     *      Secondl, laster it will reject().
     *
     * @desc This method is actually an Asynchronous method since it returns a Promise.
     *
     *
     * @param e error object. the input `e` MUST be an Error object. It cannot be a string.
     *      If you have a string or `error code string` call this method as ` failure( new Error('string') ) `.
     *      It can be an error of ` new Error('string..') ` or Firebase error.
     *      We need to detect if it's a firebase error or not. so we can translate the firebase error into proper erro string.
     *      Unfortunately I cannot refer `firebase.firestore.FirestoreError`.
     *      I simply compare if the error code is one of the firebase error code.
     *      @see for Firestore, https://firebase.google.com/docs/reference/js/firebase.firestore.FirestoreError
     *      @see for Authentication, https://firebase.google.com/docs/reference/js/firebase.auth.Error
     *
     * @return Promise<never>
     *
     */
    failure(e: Error, info = {}): Promise<never> {
        if (e['_translated']) { // Already translated.
            return Promise.reject(e);
        }
        if (this.isFirebaseError(e, info)) {
            this.translateFirebaseError(e, info);
        } else {
            e['code'] = e.message;
            e['message'] = this.translate(e.message, info);
        }
        if (e['code'] === e['message']) {
            e['message'] = `Error code - ${e['code']} - is not translated. Please translate it. It may be firebase error.`;
        }
        e['_translated'] = true;
        return Promise.reject(e);
    }

    /**
     * Returns true if the error is a Firebase Error object.
     *
     * @description
     *      - It checks if the error code is the same as `Firebase Error Code`. If yes, it returns true.
     */
    isFirebaseError(e, info): boolean {
        switch (e.code) {
            case 'not-found':
                // console.log('not-found: ', e.message);
                const str: string = e.message;
                info['documentID'] = str.split('/').pop();
                return true;
            case 'already-exists':
                return true;
            default:
                return false;
        }
    }
    translateFirebaseError(e, info) {
        e['message'] = this.translate(e.code, info);
    }



    translate(code: any, info?): string {
        return _.patchMarker(this.getText(code), info);
    }

    /**
     * Returns the text of the code.
     * @desc If the language is not `en`, then it gets the text of the language.
     *
     * @returns text of that code.
     *      - if the code does not exist on text file, then it returns the code itself.
     */
    getText(code: any): string {
        const ln = this.getLanguage();
        let text = null;
        // console.log('getText: ', ln, Base.texts);
        if (this.getLanguage() !== 'en') { // if not English,
            if (Base.texts[ln] !== void 0 && Base.texts[ln][code] !== void 0) { // check if the text of the language exists
                text = Base.texts[ln][code];
            }
        }
        if (!text) { // if it's not English or the text of that language not found,
            if (Base.texts['en'][code] !== void 0) { // get the text of the code in English
                text = Base.texts['en'][code];
            }
        }
        if (!text) { // if no text found, return the code.
            text = code;
        }
        return text;
    }

    getLanguage(): string {
        return Base.language;
    }
    /**
     * Sets a language and loads the language file.
     * This will load JSON language file under `assets/lang` by default. You can change the path.
     * @desc If the input `ln` is 'en', then it will just return since `en` language is loaded by typescript by default.
     * @desc If the language is already loaded, it does not load again.
     *
     * @returns a Promise<any> on success. Otherwise error will be thrown.
     * @see README## Langulage Translation
     *
     * @code
     *          fire.setLanguage('cn')
                  .catch( e => alert('Failed to load language file. ' + e.message) );
     *
     */
    setLanguage(ln: string): Promise<any> {
        Base.language = ln;
        if (ln === 'en') {
            return Promise.resolve();
        }
        if (Base.texts[ln]) {
            return Promise.resolve();
        }
        return this.http.get(`/${Base.languageFolder}/${ln}.json`).toPromise()
            .then(re => Base.texts[ln] = re);
    }


    /**
     *
     * Checks if the Document ID is in right format.
     *
     *
     * @param documentID Document ID
     * @returns null if there is no problem. Otherwise `ERROR CODE` will be returned.
     *
     *
     */
    checkDocumentIDFormat(documentID) {
        if (_.isEmpty(documentID)) {
            return E.NO_DOCUMENT_ID;
        }
        if (documentID.length > 128) {
            return E.DOCUMENT_ID_TOO_LONG;
        }
        if (documentID.indexOf('/') !== -1) {
            return E.DOCUMENT_ID_CANNOT_CONTAIN_SLASH;
        }
        return null;
    }

}

