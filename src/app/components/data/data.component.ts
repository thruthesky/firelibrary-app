import { Component, Input, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { DATA_UPLOAD, FireService, POST } from '../../../../public_api';


@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})

export class DataComponent implements OnInit {

  /**
   * @warning This `Input` property binding must be created and exists on parent.
   * This is an pitfall.
   */
  @Input() data: Array<DATA_UPLOAD>;
  @Input() path: string;
  progress = 0;
  constructor(
    public fire: FireService
  ) { }

  ngOnInit() {
  }

  addFile(upload: DATA_UPLOAD) {
    if (!this.data) {
      alert('Warning! developer made a mistake. `this.data` is not exists. It needs to be created on initializatino.');
    }
    this.data.push(upload);
  }
  removeFile(upload: DATA_UPLOAD) {
    if (this.data) {
      const pos = this.data.findIndex(file => file.fullPath === upload.fullPath);
      if (pos !== -1) {
        this.data.splice(pos, 1);
      }
    }
  }

  onChangeFile(event) {
    if ( this.fire.user.isLogout ) {
      return alert('Please login to upload a file');
    }
    const files: FileList = event.target.files;
    if ( files.length === 0 ) {
      return;
    }
    const file = files[0];
    const upload: DATA_UPLOAD = {
      name: ''
    };

    const dataRef = this.fire.data.getDataRef(this.path, file);
    const uploadTask = dataRef.put(file);
    upload.name = file.name;
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => { // upload in progress
        this.progress = Math.round((snapshot['bytesTransferred'] / snapshot['totalBytes']) * 100);
      },
      (e) => { // upload failed
        alert(e.message);
      },
      () => { // upload success
        this.progress = 0;
        upload.url = uploadTask.snapshot['downloadURL'];
        upload.fullPath = dataRef.fullPath;
        this.addFile(upload);
      }
    );
  }
  onClickDelete(data: DATA_UPLOAD) {
    this.fire.data.delete(data).then(re => {
      this.removeFile(data);
    })
      .catch(e => alert(e.message));
  }
}
