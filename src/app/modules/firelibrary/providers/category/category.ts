import * as firebase from 'firebase';
import {
    Base, _, COLLECTIONS, CATEGORY,
    CATEGORY_EXISTS, CATEGORY_DOES_NOT_EXIST, CATEGORY_CREATE, CATEGORY_GET, CATEGORY_EDIT, CATEGORY_ID_EMPTY
} from './../etc/base';
export class Category extends Base {


    constructor(

    ) {
        super(COLLECTIONS.CATEGORIES);
    }

    /**
     * Creates a category
     *
     * @returns
     *      - Promise<CATEGORY_CREATE>
     *      - Otherwise Promise<RESONSE> error object.
     */
    async createValidator(category: CATEGORY): Promise<any> {
        const idCheck = this.checkDocumentIDFormat(category.id);
        if (idCheck) {
            return this.failure(new Error(idCheck), { documentID: category.id });
        }
        return await this.collection.doc(category.id).get()
            .then(doc => {
                if (doc.exists) {
                    return this.failure(new Error(CATEGORY_EXISTS));
                } else {
                    return null;
                }
            });
    }
    create(category: CATEGORY): Promise<CATEGORY_CREATE> {
        return this.createValidator(category)
            .then(() => {
                category.subcategories = _.removeSpaceBetween(',', category.subcategories);
                category.created = firebase.firestore.FieldValue.serverTimestamp();
                return this.collection.doc(category.id).set(_.sanitize(category));
            })
            .then(() => this.success(category.id))
            .catch(e => this.failure(e));

        // const validate = this.createValidator(category);
        // if (validate) {
        //     return validate;
        // }
        // category.subcategories = _.removeSpaceBetween(',', category.subcategories);
        // category.created = firebase.firestore.FieldValue.serverTimestamp();
        // return this.collection.doc(category.id).get()
        //     .then(doc => {
        //         if (doc.exists) {
        //             return this.failure(new Error(CATEGORY_EXISTS));
        //         } else {
        //             return this.collection.doc(category.id).set(_.sanitize(category));
        //         }
        //     })
        //     .then(() => {
        //         return this.success(category.id);
        //     })
        //     .catch(e => this.failure(e));
    }

    /**
     * Edits a category.
     */
    edit(category: CATEGORY): Promise<CATEGORY_EDIT> {
        if (category.id === void 0 || !category.id) {
            return this.failure(new Error(CATEGORY_ID_EMPTY));
        }
        category.subcategories = _.removeSpaceBetween(',', category.subcategories);
        return this.collection.doc(category.id).update(_.sanitize(category))
            .then(() => this.success(category.id))
            .catch(e => this.failure(e));
    }

    get(id: string): Promise<CATEGORY_GET> {

        if (!id) {
            return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        }
        return this.collection.doc(id).get().then(doc => {
            if (doc.exists) {
                return this.success(doc.data());
            } else {
                return this.failure(new Error(CATEGORY_DOES_NOT_EXIST));
            }
        });
    }

    delete(id: string): Promise<any> {
        if (!id) {
            return Promise.reject(new Error(CATEGORY_ID_EMPTY));
        }
        return this.collection.doc(id).delete().catch(e => {
            return e;
        });
    }

    categories(): Promise<Array<CATEGORY>> {
        return this.collection.get().then((querySnapshot) => {
            const categories = <Array<CATEGORY>>[];
            querySnapshot.forEach(doc => {
                categories.push(<any>doc.data());
            });
            return categories;
        });
    }
}

