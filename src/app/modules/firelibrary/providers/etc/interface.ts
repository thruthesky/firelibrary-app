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





