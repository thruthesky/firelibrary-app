export interface USER {
    uid?: string; // `uid` should not be saved in document. the document id is `uid`.
    email: string;
    password?: string; // required on registeration, otherwise optional.
    displayName?: string; // optional. will be saved only on Authentication.
    photoURL?: string; // optional. will be saved only on Authentication.
    mobile?: string; // mobile phone number.
    city?: string; // city. where the user lives.
    name?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    birthday?: string;
    gender?: string;
    phoneNumber?: string;
    landline?: string;
    address?: string;
    zipcode?: string;
    country?: string;
    province?: string;
    role?: string;
    created?: any; /// firestore FieldValue
    updated?: any; /// firestore FieldValue
}
