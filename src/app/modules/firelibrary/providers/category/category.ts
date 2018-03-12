import {
    Base, _, COLLECTIONS, CATEGORY,
    CATEGORY_ID_IS_EMPTY, DOCUMENT_DOES_NOT_EXIST, CATEGORY_EXISTS, CATEGORY_DOES_NOT_EXIST, CATEGORY_CREATE, CATEGORY_GET
} from './../etc/base';
export class Category extends Base {


    constructor(

    ) {
        super(COLLECTIONS.CATEGORIES);
    }

    create(category: CATEGORY): Promise<CATEGORY_CREATE> {
        if (category.id === void 0 || !category.id) {
            return this.failure(new Error(CATEGORY_ID_IS_EMPTY)); // Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
        }
        category.subcategories = _.removeSpaceBetween(',', category.subcategories);
        return this.collection.doc(category.id).get()
            .then(doc => {
                if (doc.exists) {
                    return Promise.reject(new Error(CATEGORY_EXISTS));
                } else {
                    return this.collection.doc(category.id).set(_.sanitize(category));
                }
            })
            .then(() => {
                return this.success(category.id);
            });
    }

    edit(category: CATEGORY): Promise<void> {
        if (category.id === void 0 || !category.id) {
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
        }
        category.subcategories = _.removeSpaceBetween(',', category.subcategories);
        return this.collection.doc(category.id).update(_.sanitize(category));
    }

    get(id: string): Promise<CATEGORY_GET> {

        if (!id) {
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
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
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
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

