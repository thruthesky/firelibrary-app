import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
   * @warnign This is important and often over looked.
   *
   * @code
   *    data: Array<DATA_UPLOAD> = []; // on the parent, it should be declared something like this. Array!
   */
  @Input() data: Array<DATA_UPLOAD>;

  /**
   * `path` is the path where the file/photo should be saved on `firestore`.
   *
   * @code
   *    <app-data [path]=" 'posts/' + post.id " [data]=" post.data "></app-data>
   *    <app-data [path]=" 'posts/' + post.id + '/comments/' + comment.id " [data]=" comment.data "></app-data>
   *
   */
  @Input() path: string;


  @Input() displayFiles = true;
  @Input() displayProgress = true;

  /**
   * If it is true, it is going to delete all the files and its thumbnails in `data` array.
   * You can set it true Only if you want to maintain the last uploaded file.
   */
  @Input() deleteOldFiles = false;

  /**
   * This event is fired when a file is uploaded successfully.
   */
  @Output() upload = new EventEmitter<void>();
  @Output() progress = new EventEmitter<number>();

  percentage = 0;
  constructor(
    public fire: FireService
  ) { }

  ngOnInit() {
  }

  addFile(upload: DATA_UPLOAD) {
    if (!this.data || !Array.isArray(this.data)) {
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

  async onChangeFile(event) {
    if (this.fire.user.isLogout) {
      return alert('Please login to upload a file');
    }
    const files: FileList = event.target.files;
    if (files.length === 0) {
      return;
    }
    const file = files[0];
    const upload: DATA_UPLOAD = {
      name: ''
    };

    if (this.deleteOldFiles && this.data.length) {
      for (const data of this.data) {
        if ( data.url ) {
          await this.fire.data.delete(data).catch(e => alert(e.message));
        }
      }

      this.data.splice(0, this.data.length);

      console.log(this.data);
    }


    const dataRef = this.fire.data.getDataRef(this.path, file);
    const uploadTask = dataRef.put(file);
    upload.name = file.name;
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => { // upload in progress
        this.percentage = Math.round((snapshot['bytesTransferred'] / snapshot['totalBytes']) * 100);
        this.progress.emit( this.percentage );
      },
      (e) => { // upload failed
        alert(e.message);
      },
      () => { // upload success
        this.percentage = 0;
        upload.url = uploadTask.snapshot['downloadURL'];
        upload.fullPath = dataRef.fullPath;
        this.addFile(upload);
        this.upload.emit();
      }
    );
  }
  onClickDelete(data: DATA_UPLOAD) {
    console.log(`DataComponent::onClickDelete()`);
    this.fire.data.delete(data).then(re => {
      this.removeFile(data);
    })
      .catch(e => alert(e.message));
  }
}
