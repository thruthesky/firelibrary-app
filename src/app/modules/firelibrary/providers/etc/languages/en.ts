import {
    ALREADY_EXISTS, NOT_FOUND, UNKNOWN, CATEGORY_ID_EMPTY, DOCUMENT_ID_TOO_LONG,
    EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, INVALID_EMAIL, WEAK_PASSWORD, PASSWORD_TOO_LONG,
    PERMISSION_DENIED,
    POST_ID_EMPTY,
    POST_ID_NOT_EMPTY
} from './../error';

export const en = {
    'HOME': 'Home'
};


/**
 * Error Code and Text
 */
en[ UNKNOWN ] = 'Unkown error. #info';
en[ CATEGORY_ID_EMPTY ] = 'Category ID is empty.';
en[ NOT_FOUND ] = 'Document was not found. Document ID: #documentID';
en[ ALREADY_EXISTS ] = 'Category is already exists. Category ID: #categoryID';
en[ DOCUMENT_ID_TOO_LONG ] = 'Document ID is too long. Document ID: #documentID';
en[ PERMISSION_DENIED ] = 'Permission denied or insufficient permission.';

en[POST_ID_EMPTY] = 'Post ID is empty.';
en[POST_ID_NOT_EMPTY] = 'Post ID is not empty.';

// User
en[ EMAIL_ALREADY_IN_USE ] = 'Email address already in use. #message';
en[ USER_NOT_FOUND ] = 'User does not found in collection. #message';
en[ INVALID_EMAIL ] = 'Invalid email, #message';
en[ WEAK_PASSWORD ] = 'Weak password, #message';
en[ PASSWORD_TOO_LONG ] = 'Password length exceeds at maximum 128 characters.';

