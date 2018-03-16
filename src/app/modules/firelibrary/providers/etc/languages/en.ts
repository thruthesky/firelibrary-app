import {
    ALREADY_EXISTS, NOT_FOUND, UNKNOWN, CATEGORY_ID_EMPTY, DOCUMENT_ID_TOO_LONG,
    EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, INVALID_EMAIL, WEAK_PASSWORD, PASSWORD_TOO_LONG,
    EXPIRED_ID_TOKEN, PERMISSION_DENIED, FIREBASE_API_ERROR, WRONG_PASSWORD

} from './../error';

export const en = {
    'HOME': 'Home'
};


/**
 * Error Code and Text
 */
en[ UNKNOWN ] = 'Unkown error. #info';
en[ FIREBASE_API_ERROR ] = 'Firebase API error. #info';
en[ CATEGORY_ID_EMPTY ] = 'Category ID is empty.';
en[ NOT_FOUND ] = 'Document was not found. Document ID: #documentID';
en[ ALREADY_EXISTS ] = 'Category is already exists. Category ID: #categoryID';
en[ DOCUMENT_ID_TOO_LONG ] = 'Document ID is too long. Document ID: #documentID';
en[ PERMISSION_DENIED ] = 'Permission denied or insufficient permission.';
// USER
en[ EMAIL_ALREADY_IN_USE ] = 'Email address already in use. #info';
en[ USER_NOT_FOUND ] = 'User was not found in collection. #info';
en[ INVALID_EMAIL ] = 'Invalid email, #info';
en[ WEAK_PASSWORD ] = 'Weak password, #info';
en[ PASSWORD_TOO_LONG ] = 'Password length exceeds at maximum 128 characters.';
en[ EXPIRED_ID_TOKEN ] = 'ID token is revoked/expired. Login again to get a new id token.';
en[ WRONG_PASSWORD ] = 'Password was incorrect, #info';

