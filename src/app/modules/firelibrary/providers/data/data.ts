import * as firebase from 'firebase';
import {
    Base, _, DATA_UPLOAD
} from './../etc/base';
import { User } from '../user/user';
export class Data extends Base {

    /**
    * User class object.
    */
    private user: User;

    constructor(

    ) {
        super('');
        this.user = new User();
    }

    /**
     * Get the storage data reference of a file.
     */
    getDataRef(file: File) {
        return firebase.storage().ref().child(`${this.user.uid}`).child(`${file.name}`);
    }

    delete(data: DATA_UPLOAD): Promise<any> {
        return firebase.storage().ref(data.fullPath).delete().then(re => {
            return this.success(true);
        })
            .catch(e => this.failure(e));
    }
}
