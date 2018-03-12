import { Base, _, COLLECTIONS, CATEGORY,
    CATEGORY_ID_IS_EMPTY, DOCUMENT_DOES_NOT_EXIST, CATEGORY_EXISTS, CATEGORY_DOES_NOT_EXIST
} from './../etc/base';
export class Category extends Base {


    constructor(

    ) {
        super(COLLECTIONS.CATEGORIES);
    }

    create(category: CATEGORY): Promise<void> {
        if (category.id === void 0 || !category.id) {
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
        }
        category.subcategories = _.removeSpaceBetween(',', category.subcategories);
        return this.collection.doc(category.id).get()
            .then(doc => {
                if (doc.exists) {
                    return Promise.reject(new Error(CATEGORY_EXISTS));
                } else {
                    return this.collection.doc(category.id).set(_.sanitize(category));
                }
            });
    }

    edit(category: CATEGORY): Promise<void> {
        if (category.id === void 0 || !category.id) {
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
        }
        category.subcategories = _.removeSpaceBetween(',', category.subcategories);
        return this.collection.doc(category.id).update(_.sanitize(category));
    }

    get(id: string): Promise<CATEGORY> {

        if (!id) {
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
        }
        return this.collection.doc(id).get().then(doc => {
            if (doc.exists) {
                return <any>doc.data();
            } else {
                return Promise.reject(new Error(CATEGORY_DOES_NOT_EXIST));
            }
        });
    }

    delete(id: string): Promise<any> {
        if (!id) {
            return Promise.reject(new Error(CATEGORY_ID_IS_EMPTY));
        }
        return this.collection.doc(id).delete();
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

