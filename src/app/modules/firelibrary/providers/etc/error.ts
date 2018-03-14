/**
 *
 * @file error.ts
 * @description It only holds constants. No class, functions, vars.
 *          - the value of the constant must be a string only. It cannot contain numeric value.
 */



/// General error code
export const UNKNOWN = 'unknown-error';
export const NOT_FOUND = 'not-found';
export const USER_IS_NOT_LOGGED_IN = 'You are not logged in';


/// Categories

export const CATEGORY_ID_EMPTY = 'category-id-empty';
export const CATEGORY_EXISTS = 'category-exists';
export const CATEGORY_DOES_NOT_EXIST = 'category id does not exist';
export const POST_ID_EXISTS = 'post id exists';


// User
export const EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use'; // from firebase
export const USER_NOT_FOUND = 'auth/user-not-found'; // from firebase
export const INVALID_EMAIL = 'auth/invalid-email'; // from firebase
export const WEAK_PASSWORD = 'auth/weak-password'; // from firebase
