import { Component, OnInit, OnDestroy } from '@angular/core';
import { FireService, USER, DATA_UPLOAD, USER_DATA } from './../../modules/firelibrary/core';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: USER = <USER>{};
  data: Array<DATA_UPLOAD> = []; // this is needed since data component only binds to arry.
  loader = {
    delete: false,
    update: false
  };
  countCheckThumbnail = 0;
  percentage = 0;
  constructor(
    public fire: FireService
  ) {
    /**
     * Get user data safely when user logs in.
     */
    fire.auth.onAuthStateChanged(user => {
      if (user) {
        fire.user.data().then(re => {   // get user data
          this.user = re.data.user;
          console.log('user: ', this.user);
          if (this.user.profilePhoto) {   // if user has profile photo.
            this.data[0] = this.user.profilePhoto; // save profile photo at data[0]
          }
        }).catch(e => alert(e.message));


        /**
         * When profile photo is uploaded/changed/deleted, the new profile data will be arrived here.
         * You can make it simpler here !!
         * When user profile is changed, just update/change the thumbnail url. No need to have complicated computation.
         */
        fire.user.listen(data => {
          console.log('user data:', data);
          if (data.profilePhoto !== void 0 && data.profilePhoto.created !== void 0) { // new data.
            if (!this.data.length || !this.data[0] || !this.data[0].url
              || this.data[0].created !== data.profilePhoto.created) {
              console.log('Change/Update new photo.');
              /**
               * need to re-render page?
               */
              this.data[0] = data.profilePhoto;
            }
          } else {
            this.data[0] = {};
          }
        });
      }
    });
  }


  ngOnInit() {
  }

  ngOnDestroy() {
    this.fire.user.unlisten();
  }

  onSubmitForm(event: Event) {
    event.preventDefault();
    this.loader.update = true;


    /**
     * Do not update profile photo since it is already updated on file upload.
     */
    delete this.user.profilePhoto;

    this.fire.user.update(this.user).then(re => {
      this.loader.update = false;
      console.log('user updated: ', re);
    })
      .catch(e => {
        this.loader.update = false;
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
    // this.updateProfilePhoto();
    /**
     * Reset to check the thumbnail.
     */
    this.data[0].thumbnailUrl = null;
    this.countCheckThumbnail = 0;
  }

  onProgress(percentage) {
    this.percentage = percentage;
  }
  onClickDelete() {
    this.loader.delete = true;
    console.log(`DataComponent::onClickDelete()`);
    if (this.data.length && this.data[0].url) {
      const data = this.data[0];
      this.fire.data.delete(data).then(re => {
        this.loader.delete = false;
        this.data[0] = {};
        this.updateProfilePhoto();
      })
        .catch(e => {
          this.loader.delete = false;
          alert(e.message);
        });
    }
  }
  updateProfilePhoto() {
    this.fire.user.update({ profilePhoto: this.data[0] }).catch(e => alert(e.message));
  }
}
