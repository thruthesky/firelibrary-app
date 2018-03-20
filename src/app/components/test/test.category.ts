import {
    FireService,
    UNKNOWN, CATEGORY_ID_EMPTY, DOCUMENT_ID_CANNOT_CONTAIN_SLASH, DOCUMENT_ID_TOO_LONG,
    CATEGORY_DOES_NOT_EXIST, CATEGORY_EXISTS, NOT_FOUND, NO_DOCUMENT_ID, COLLECTION_NOT_EMPTY
} from '../../../../public_api';
import { TestTools } from './test.tools';
import * as settings from './test.settings';

export class TestCategory extends TestTools {
    constructor(
    ) {
        super();
    }
    async asAnonymous() {
        //
    }
    async asMember() {
        //
    }
    async asAdmin() {
        await this.categoryEmptyID();
        await this.categoryGetWrongID();
        await this.categoryCreateWrongID();
        await this.categoryCreateExist();
        await this.categoryNotFoundForEditing();
        await this.categoryCreateGetEdit();
        await this.categoryDelete();
    }

    async categoryEmptyID() {
        this.fire.category.create(<any>{})
        .then(re => {
            this.bad('Creating category should be failed with empty data');
        })
        .catch(e => {
            this.test(e.code === CATEGORY_ID_EMPTY, 'Expect error with empty data. no category id.');
            // console.log('error code: ', e.code);
            // console.log('error message: ', e.message);
            // console.error('error stack log: ', e);
        });
        this.fire.category.create(<any>{ id: '' })
        .then(re => {
            this.bad('Creating category should be failed with empty category id');
        })
        .catch(e => {
            this.fire.setLanguage('ko');
            console.log(this.fire.getLanguage());
            this.test(e.code === CATEGORY_ID_EMPTY, 'Expect error with empty category id', this.fire.translate(CATEGORY_ID_EMPTY));
        });
        this.fire.category.create({ id: undefined })
        .then(() => this.bad('Must be error with `undefined` category id'))
        .catch(e => this.test(e.code === NO_DOCUMENT_ID, 'Expect error with undefined category id'));

        this.fire.category.create({ id: null })
        .then(() => this.bad('Must be error with `null` category id'))
        .catch(e => this.test(e.code === NO_DOCUMENT_ID, 'Expect error with null category id'));


        this.fire.category.edit({ id: '' })
        .then(() => this.bad('Must be error with `` category id on edit'))
        .catch(e => this.test(e.code === NO_DOCUMENT_ID, 'Expect error with empty category id on edit'));


        this.fire.category.edit({ id: null })
        .then(() => this.bad('Must be error with `null` category id on edit'))
        .catch(e => this.test(e.code === NO_DOCUMENT_ID, 'Expect error with null category id on edit'));

    }

    async categoryCreateWrongID() {
        this.fire.setLanguage('ko');
        this.fire.category.create({ 'id': '/' })
        .then(re => {
            this.bad('Creating category should be failed with empty data');
        })
        .catch(e => {
            this.test(e.code === DOCUMENT_ID_CANNOT_CONTAIN_SLASH, 'Expect invalid-argument', e.code, e.message);
        });
        this.fire.category.create({
            id: 'too-long-category-id-1234567890-1234567890-1234567890-1234567890' +
            '-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890'
        })
        .then(re => {
            this.bad('Creating category should be failed with empty category id');
        })
        .catch(e => {
            this.fire.setLanguage('ko');
            console.log(this.fire.getLanguage());
            this.test(e.code === DOCUMENT_ID_TOO_LONG, 'Expect error with empty category id', e.code, e.message);
        });
    }

    /**
    *
    */
    async categoryCreateExist() {

        // console.log('user email: ', this.fire.user.email);
        //         const categoryId = 'cat-' + (new Date).getTime();
        //         this.fire.category.create({ id: categoryId })
        //             .then(re => {
        //                 this.test(re.code === null, 'Category create susccess');
        //                 this.test(re.data === categoryId, `Category id match`);
        //                 this.fire.category.create({ id: categoryId })
        //                     .then(x => this.bad('should fail on creating with existing category id'))
        //                     .catch(e => this.test(e.code === CATEGORY_EXISTS,
        //                         'Expect error on creating a category with existing category id'));
        //             })
        //             .catch(e => {
        //                 this.bad('Expect success on creating a category', e);
        //             });


        // const admin = await this.registerOrLoginAsAdmin();
        // if (!admin) {
        //     return this.bad('Failed to login as admin');
        // }
        // this.fire.auth.onAuthStateChanged(user => {
        //     if ( user && user.email === settings.ADMIN_EMAIL) {
        //         const categoryId = 'cat-' + (new Date).getTime();
        //         this.fire.category.create({ id: categoryId })
        //             .then(re => {
        //                 this.test(re.code === null, 'Category create susccess');
        //                 this.test(re.data === categoryId, `Category id match`);
        //                 this.fire.category.create({ id: categoryId })
        //                     .then(x => this.bad('should fail on creating with existing category id'))
        //                     .catch(e => this.test(e.code === CATEGORY_EXISTS,
        //                         'Expect error on creating a category with existing category id'));
        //             })
        //             .catch(e => {
        //                 this.bad('Expect success on creating a category', e);
        //             });
        //     }
        // });

        const categoryId = 'cat-' + (new Date).getTime();
        this.fire.category.create({ id: categoryId })
        .then(re => {
            this.test(re.code === null, 'Category create susccess');
            this.test(re.data.id === categoryId, `Category id match`);
            this.fire.category.create({ id: categoryId })
            .then(x => this.bad('should fail on creating with existing category id'))
            .catch(e => {
                this.test(e.code === CATEGORY_EXISTS, 'Expect error on creating a category with existing category id');
            });
        })
        .catch(e => {
            this.bad('Expect success on creating a category', e);
        });
    }


    /**
    *
    */
    async categoryGetWrongID() {
        this.fire.category.get('wrong-category-id')
        .then(x => this.bad('Category get with wrong id must be failed', x))
        .catch(e => {
            this.test(e.code === CATEGORY_DOES_NOT_EXIST, 'Expect error on getting a category with wrong id', e.code, e.message);
        });
    }

    /**
    * Category edit test.
    */
    async  categoryNotFoundForEditing() {
        this.fire.setLanguage('ko');
        this.fire.category.edit({ id: 'wrong-category-id', name: 'wrong' })
        .then(() => this.bad('Expect error on creating wrong category'))
        .catch(e => {
            this.test(e.code === NOT_FOUND, 'Expect not-found error with wrong category id.', e);
        });
    }

    async categoryCreateGetEdit() {
        const name = 'category Name 2';
        const categoryId = 'cat-2-' + (new Date).getTime();
        this.fire.category.create({ id: categoryId, name: name })
        .then(re => {
            this.fire.category.get(re.data.id)
            .then(res => {
                this.test(res.data.name === name, 'Expect name match');
                this.fire.category.edit({ id: res.data.id, name: 'updated' })
                .then(edited => {
                    this.fire.category.get(edited.data.id)
                    .then(r => {
                        this.test(r.data.name === 'updated',
                        'Expect success on updating category', r.data.name, r.data.id);
                    });
                });
            })
            .catch(e => this.bad('Expect failure on createEditGet'));
        })
        .catch(e => {
            this.bad('Should create a category', e);
        });
    }


    async categoryDelete() {
        const name = 'cat-3';
        const categoryId = name + (new Date).getTime();
        this.fire.category.create({ id: categoryId, name: name, numberOfPosts: 1 })
        .then(re => {
            return this.fire.category.delete(re.data.id);
        })
        .then(() => {
            this.good('Category deleted.');
        })
        .catch(e => {
            this.test(e.code === COLLECTION_NOT_EMPTY, 'Expect error since the collection is not empty');
            // this.bad('Create a category for categoryDelete test', e);
        });

        this.fire.category.create({ id: categoryId + '-2' })
        .then(re => {
            return this.fire.category.delete(re.data.id);
        })
        .then(() => {
            this.good('Success on deleting a category.');
        })
        .catch(e => this.bad('Expect to delete the category', e));

        this.fire.category.delete('this-is-wrong-category-id')
        .then(() => this.bad('Expect error with wrong category id on delete'))
        .catch(e => {
            this.test(e.code === NOT_FOUND, 'Expect not-found with wrong category id on delete', e);
        });
    }
}
