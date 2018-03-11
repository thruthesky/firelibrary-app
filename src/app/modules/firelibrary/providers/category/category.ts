import { Base, COLLECTIONS, CATEGORY } from './../etc/base';
export class Category extends Base {


    constructor(

    ) {
        super( COLLECTIONS.CATEGORIES );
    }

    create( category: CATEGORY ): Promise<void> {
        return this.collection.doc( category.id ).set( category, { merge: true });
    }
}

