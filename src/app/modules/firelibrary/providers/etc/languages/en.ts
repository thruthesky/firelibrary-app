import {
    ALREADY_EXISTS, NOT_FOUND, UNKNOWN, CATEGORY_ID_EMPTY, DOCUMENT_ID_TOO_LONG,
    EMAIL_ALREADY_IN_USE, USER_NOT_FOUND, INVALID_EMAIL, WEAK_PASSWORD
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

// User

en[ EMAIL_ALREADY_IN_USE ] = 'Email address already in use. #message';
en[ USER_NOT_FOUND ] = 'User does not found in collection. #message';
en[ INVALID_EMAIL ] = 'Invalid email, #message';
en[ WEAK_PASSWORD ] = 'Weak password, #message';
