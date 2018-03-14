/**
 *
 * @file error.ts
 * @description It only holds constants. No class, functions, vars.
 *          - the value of the constant must be a string only. It cannot contain numeric value.
 */



/// General error code
/// firebase error code
export const UNKNOWN = 'unknown-error';
export const NOT_FOUND = 'not-found';
export const ALREADY_EXISTS = 'already-exists';
export const PERMISSION_DENIED = 'permission-denied';
export const RESOURCE_EXHAUSTED = 'resource-exhausted';

export const USER_IS_NOT_LOGGED_IN = 'You are not logged in';

export const NO_DOCUMENT_ID = 'no-document-id';
export const DOCUMENT_ID_TOO_LONG = 'document-id-too-long';
export const DOCUMENT_ID_CANNOT_CONTAIN_SLASH = 'document-id-cannot-cotain-slash';


/// Categories

export const CATEGORY_ID_EMPTY = NO_DOCUMENT_ID;
export const CATEGORY_EXISTS = ALREADY_EXISTS;
export const CATEGORY_DOES_NOT_EXIST = 'category id does not exist';

export const POST_ID_EXISTS = 'post id exists';


// User
export const EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use'; // from firebase
export const USER_NOT_FOUND = 'auth/user-not-found'; // from firebase
