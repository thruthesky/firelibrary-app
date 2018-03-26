import * as firebase from 'firebase';
import {
    Base, _, DATA_UPLOAD
} from './../etc/base';
import { User } from '../user/user';
export class Data extends Base {


    user: User;
    constructor(

    ) {
        super('');
        this.user = new User();
    }

    /**
     * Get the storage data reference of a file.
     */
    getDataRef(path: string, file: File) {
        if (typeof path !== 'string' || !path) {
            alert('Error. path must give in string.');
        }
        path = 'firelibrary/' + Base.collectionDomain + '/' + this.user.uid + '/' + path;
        return firebase.storage().ref().child(path).child(`${file.name}`);
    }

    delete(data: DATA_UPLOAD): Promise<any> {
        return firebase.storage().ref(data.fullPath).delete().then(re => {
            return this.success(true);
        })
            .catch(e => this.failure(e));
    }
}
