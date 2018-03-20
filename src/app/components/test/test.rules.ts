import { FireService, UNKNOWN, COLLECTIONS, POST, PERMISSION_DENIED, NOT_FOUND } from '../../../../public_api';
import { TestTools } from './test.tools';

const CATEGORY_ID = 'test';
export class TestRules extends TestTools {
    constructor(
    ) {
        super();
    }

    /**
    * Run test as Anonymous
    */
    async asAnonymous() {
        await this.userRulesAsAnonymous();
        await this.postRulesAsAnonymous();
    }
    /**
    * Run test as member
    */
    async asMember() {
        await this.postRulesAsMember();

    }

    async asAdmin() {
        //
    }


    async userRulesAsAnonymous() {
        await this.fire.user.create({ uid: 'abc', email: 'abc@abc.com', name: 'hi' })
        .then(re => {
            this.bad('expect error with wrong uid');
        })
        .catch(e => this.good('Expect error with wrong uid', e));

        await this.fire.collectionRef(COLLECTIONS.USERS).doc('wrong-user-uid').update({ email: 'wrong@email.com' })
        .then(() => this.bad('Expect error on update with wrong uid'))
        .catch(e => this.good('Expect error on update with wrong uid'));

        await this.fire.collectionRef(COLLECTIONS.USERS).doc('wrong-user-uid').delete()
        .then(() => this.bad('Expect error on delete with wrong uid'))
        .catch(e => this.good('Expect error on deleting with wrong uid'));


    }

    async userRulesAsMember() {

        // create
        await this.fire.user.create({ email: 'abc@abc2.com', name: 'Secret', uid: this.fire.user.uid })
        .then(re => {
            this.good('Expect success on user create with right uid');
            this.fire.user.logout();
        })
        .catch(e => this.good('Expect success with right uid', e));
        // update
        await this.fire.user.update({ email: 'abc@abc.com', name: 'hi' })
        .then(re => {
            this.good('Expect success on user update with right uid');
        })
        .catch(e => {
            console.log('isLogin', this.fire.user.isLogin);
            this.bad('Expect update succes on user with right uid', e);
        });

        // delete
        await this.fire.user.delete()
        .then(re => {
            this.good('Expect success on user create with right uid');
        })
        .catch(e => this.good('Expect success on user delete', e));
    }


    async postRulesAsAnonymous() {

        /// Logout
        // await this.fire.auth.signOut();


        await this.fire.collectionRef(COLLECTIONS.POSTS).add({ title: 'add' })
        .then(() => {
            this.bad('Must failed due to NOT Logged in');
        })
        .catch(e => {
            this.test(e.code === PERMISSION_DENIED, 'User has not logged in', e);
        });

        /// Login
        // this.loginAs('post-rule@test.com', '12345a,*', async () => {
        // });
    }

    async postRulesAsMember() {
        console.log(`User has logged in `, this.fire.user.email);
        /// Must fail due to no Category ID.
        // await this.fire.collectionRef(COLLECTIONS.POSTS).add({ title: 'add' })
        // .then(doc => {
        //     this.bad('Must failed with no category id', doc.id);
        // })
        // .catch(e => {
        //     this.test(e.code === PERMISSION_DENIED, 'Failed due to no category id was given.', e);
        // });
        // /// Must fail due to no uid
        // await this.fire.collectionRef(COLLECTIONS.POSTS).add({ category: 'qna', title: 'add' })
        // .then(doc => {
        //     this.bad('Must fail with no uid.', doc.id);
        // })
        // .catch(e => {
        //     this.test(e.code === PERMISSION_DENIED, 'Failed due to no uid was given.', e);
        // });


        // /// Must fail due to wrong category id.
        // await this.fire.collectionRef(COLLECTIONS.POSTS).add({ category: 'wrong-category-id', uid: 'uid-abc', title: 'add' })
        // .then(doc => {
        //     this.bad('Must fail due to wrong category id.', doc.id);
        // })
        // .catch(e => {
        //     this.test(e.code === PERMISSION_DENIED, 'Failed due to wrong category id', e);
        // });

        // /// wrong uid
        // await this.fire.collectionRef(COLLECTIONS.POSTS).add({ category: CATEGORY_ID, uid: 'wrong-uid', title: 'add' })
        // .then(doc => {
        //     this.bad('Must fail due to wrong uid', doc.id);
        // })
        // .catch(e => this.good('Expect fail due to wrong uid was given.'));


        /// expect success.
        const ref = this.fire.collectionRef(COLLECTIONS.POSTS);
        console.log(`add at: ${ref.path}`, 'email: ', this.fire.user.email, 'category: ', CATEGORY_ID);
        await ref.add({ category: CATEGORY_ID, uid: this.fire.user.uid, title: 'add' })
        .then(doc => {
            this.good('Success on create a post.', doc.id);
        })
        .catch(e => this.bad('Must success on add post.', e));

        /// expect success on update.
        await this.fire.collectionRef(COLLECTIONS.POSTS).add({
            category: CATEGORY_ID,
            uid: this.fire.user.uid,
            title: 'updated'
        })
        .then(doc => {
            this.good('Expect success on update. doc.id: ', doc.id);
        })
        .catch(e => this.bad('Must success', e));

        /// expect error on wrong uid.
        await this.fire.collectionRef(COLLECTIONS.POSTS).add({
            category: CATEGORY_ID,
            uid: 'worng-uid',
            title: 'updated'
        })
        .then(doc => {
            this.bad('Must failed on updating with wrong uid. doc', doc.id);
        })
        .catch(e => this.good('Expect error on update with wrong uid'));


        /// expect error on wrong category id.
        await this.fire.collectionRef(COLLECTIONS.POSTS).add({
            category: 'wrong-category-id-oo',
            uid: this.fire.user.uid,
            title: 'updated'
        })
        .then(doc => {
            this.bad('Must failed on updating with wrong category. doc', doc.id);
        })
        .catch(e => this.good('Expect error on update with wrong category'));
    }
}
