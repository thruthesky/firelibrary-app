import { Component, OnInit } from '@angular/core';
import { FireService, USER, DATA_UPLOAD } from '../../../../public_api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: USER = <USER>{};
  data: Array<DATA_UPLOAD> = [];
  loader = false;
  countCheckThumbnail = 0;
  percentage = 0;
  constructor(
    public fire: FireService
  ) {
    fire.auth.onAuthStateChanged(user => {
      if (user) {
        fire.user.data().then(re => {
          this.user = re.data.user;
          console.log('user: ', this.user);
          if (this.user.profilePhoto) {
            this.data.push(this.user.profilePhoto);
          }
        }).catch(e => alert(e.message));
      }
    });
  }

  ngOnInit() {
  }
  onSubmitForm(event: Event) {
    event.preventDefault();
    this.loader = true;


    /**
     * Do not update profile photo since it is already updated on file upload.
     */
    delete this.user.profilePhoto;

    this.fire.user.update(this.user).then(re => {
      this.loader = false;
      console.log('user updated: ', re);
    })
      .catch(e => {
        this.loader = false;
        alert(e.message);
      });
    return false;
  }

  /**
   * When profile photo uploaded, it will get the thumbnail url.
   *  1. reset the data for check thumbnial.
   *  2. call `checkThumbnail` every 2 seconds for until it gets thumbnail url. It stops after 10 times try.
   * @see README# User profile
   *
   *
   */
  onUpload() {
    console.log('onUpload(): ', this.data);
    this.updateProfilePhoto();
    /**
     * Reset to check the thumbnail.
     */
    this.data[0].thumbnailUrl = null;
    this.countCheckThumbnail = 0;
    this.checkThumbnail();
  }
  /**
   * Runs every 2 secodns until it gets url of thumbnail or it only repeat 10 times.
   */
  checkThumbnail() {
    if (this.data[0].thumbnailUrl || this.countCheckThumbnail > 10) {
      return;
    }
    this.fire.storage.ref(this.fire.data.getThumbnailPath(this.data[0].fullPath))
      .getDownloadURL()
      .then(url => {
        console.log('I got thumbnail url: ', url);
        this.data[0].thumbnailUrl = url;
        this.updateProfilePhoto();
      })
      .catch(e => { // failed to get thumbnail.
        this.countCheckThumbnail++;
        console.log('Failed to get thumbnail: repeat: ', this.countCheckThumbnail);
        setTimeout(() => {
          this.checkThumbnail();
        }, 2000);
      });
  }
  onProgress(percentage) {
    this.percentage = percentage;
  }
  onClickDelete() {
    console.log(`DataComponent::onClickDelete()`);
    if (this.data.length && this.data[0].url) {
      const data = this.data[0];
      this.fire.data.delete(data).then(re => {
        this.data[0] = {};
        this.updateProfilePhoto();
      })
        .catch(e => alert(e.message));
    }
  }
  updateProfilePhoto() {
    this.fire.user.update({ profilePhoto: this.data[0] }).catch(e => alert(e.message));
  }
}
