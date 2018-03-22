import { Component, Input, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { DATA_UPLOAD, FireService, POST } from '../../../../public_api';


@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})

export class DataComponent implements OnInit {


  @Input() post: POST;
  upload: DATA_UPLOAD = {
    progress: 0,
    name: ''
  };




  constructor(
    public fire: FireService
  ) { }

  ngOnInit() {
  }


  onChangeFile(event) {
    const files: FileList = event.target.files;
    console.log('onChangeFile(): ', files.length, files[0]);
    const file = files[0];
    const dataRef = firebase.storage().ref().child(`${file.name}`);
    const uploadTask = dataRef.put(file);
    this.upload = { name: file.name };
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // upload in progress
        this.upload['progress'] = Math.round((snapshot['bytesTransferred'] / snapshot['totalBytes']) * 100);
        console.log('progress: ', this.upload['progress']);
      },
      (error) => {
        // upload failed
        console.log(error);
      },
      () => {
        // upload success
        if ( ! this.post.data ) {
          this.post.data = [];
        }
        this.upload.progress = 0;
        this.upload['url'] = uploadTask.snapshot['downloadURL'];
        this.upload.fullPath = dataRef.fullPath;
        delete this.upload.progress;
        this.post.data.push(this.upload);
        console.log(this.upload);
      }
    );

  }
}
