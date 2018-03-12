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


/**
 * 'categories' collection schema.
 * Feel free to extends properties.
 */
export interface CATEGORY {
    route?: string; // This should not be saved into docuemnt.
    id: string;
    name?: string; // to display.
    description?: string; // to display as long description.
    subcategories?: string; // separated by comma.
    tags?: string; // Allowable tags separated by comma.
    // If it is set, only this tags are allowed. otherwise, any tags can be put in the post.
    header?: string;
    footer?: string;
    numberOfPostsPerPage?: number;
    numberOfPagesOnNavigation?: number;
    moderators?: string;
    moderatorRoles?: string;
    allowAttachment?: boolean;
    levelOnList?: number; // if set to 0, Anonymous can list
    levelOnRead?: number; // if set to 0, Anonymous can read
    levelOnWrite?: number;  // if set to 1, Only member can create/edit/delete. Anonymous cannot.
    disableDeleteWithDependant?: boolean; // if set to true, author cannot edit/delete when there is any comments.
    headerOnList?: string;
    footerOnList?: string;
    headerOnWrite?: string;
    footerOnWriter?: string;
    headerOnView?: string;
    footerOnView?: string;
    numberOfPosts?: number;
    numberOfComment?: number;
    created: any; ///
    updated: any; ///
}


/**
* POST data to create/update/delete.
*
* @desc You can update more.
*
*
*/
export interface POST {
    id?: string;                    // Document ID. This is needed only on accessing. It does not need to be saved.
    uid: string;                    // author
    title?: string;
    content?: string;
    category?: string;              // This is category's 'Document ID'.
    subcategory?: string;           // Sub category to categorize in detail.
    tags?: string;                  // Tags to search
    displayName?: string;
    email?: string;
    password?: string;              // Anonymous need to put a password to update/delete.
    phoneNumber?: string;
    country?: string;
    province?: string;
    city?: string;
    address?: string;
    zipCode?: string;
    files?: Array<string>;
    numberOfComments?: number;
    numberOfLikes?: number;
    numberOfDislikes?: number;
    numberOfViews?: number;
    private?: boolean;
    reminder?: number; // higher number will be listed on top.
    created?: any;
    updated?: any;
}




export interface SYSTEM_CONFIG {
    firebaseApp: firebase.app.App;
    functions: boolean;
}



export interface RESPONSE {
    code: string;           // if it is error, it will be string or null.
    message?: string;           // only exists if there is error.
    data?: any;                 // result data.
}

export interface CATEGORY_CREATE extends RESPONSE {
    data: string;
}
export interface CATEGORY_GET extends RESPONSE {
    data: CATEGORY;
}
