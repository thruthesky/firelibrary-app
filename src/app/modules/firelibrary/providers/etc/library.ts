/**
 *
 * @file library.ts
 *
 */

export class Library {

    /**
     * Returns http query string.
     * @param params Object to build as http query string
     * @return
     *      - http query string
     *      - Or null if the input is emtpy or not object.
     */
    static httpBuildQuery(params): string | null {

        if (Library.isEmpty(params)) {
            return null; //
        }

        const keys = Object.keys(params);
        if (keys.length === 0) {
            return null; //
        }

        const esc = encodeURIComponent;
        const query = keys
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');
        return query;
    }

    /**
     * Returns n'th portion of the input `str` after spliting by the `separator`
     *
     * @param str string to get a portion from.
     * @param separator to split the string. Default is a Blank.
     * @param n n'th portion to get. Index begins with 0. Default is 0.
     * @return
     *      - a portion of the input string.
     *      - or null
     *          - if the input `str` is empty.
     *          - if the input `str` is not a string.
     *          - if the n'th portion does not exists.
     *          - if the value of the portion is empty
     *          - if separator is not a string and empty.
     *
     * @code
     *      const str = 'abc.def.ghi';
     *      return this.library.segment( str, '.', 0 ); // returns `abc`
     *
     */
    static segment(str: string, separator: string = ' ', n: number = 0): string {
        if (typeof str !== 'string') {
            return null;
        }
        if (typeof separator !== 'string' || !separator) {
            return null;
        }
        if (str) {
            const re = str.split(separator);
            if (re[n] !== void 0 && re[n]) {
                return re[n];
            }
        }
        return null;
    }


    /**
     *
     * Returns true if the input `what` is falsy or empty or no data.
     *
     * @returns
     *      - true if the input `what` is
     *          - boolean and it's false,
     *          - number with 0.
     *          - string with empty. ( if it has any vlaue like blank, then it's not empty. )
     *          - object with no key.
     *          - array with 0 length.
     *
     *      - otherwise return false.
     */
    static isEmpty(what): boolean {
        if (!what) {
            return true; // for number, string, boolean, any falsy.
        }
        if (typeof what === 'object') {
            return Object.keys(what).length === 0;
        }
        if (Array.isArray(what)) {
            return what.length === 0;
        }
        return false;
    }

    /**
     * Returns true if the input `a` and `b` are identical.
     * @param a Object a
     * @param b Object b
     */
    static isEqual(a, b): boolean {
        if (typeof a === 'object' && typeof b === 'object') {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            return aKeys.findIndex((v, i) => v !== bKeys[i]) === -1;
        } else if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            } else {
            }
        } else {
            return a === b;
        }
    }

    static isString(str) {
        return typeof str === 'string';
    }



    /**
     *
     * Removes properties with `undefined` value from the object and returns it.
     *
     * You cannot set `undefiend` value into firestore `document`. It will produce a Critical error.
     *
     * @param obj Object to be set into `firestore`.
     *
     * @return object
     */
    static sanitize(obj): any {
        if (obj) {
            if (typeof obj === 'object') {
                Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
            }
        }

        /** Remove `password` not to save on documents. */
        if (obj && obj['password'] !== void 0) {
            delete obj['password'];
        }

        return obj;
    }

}


