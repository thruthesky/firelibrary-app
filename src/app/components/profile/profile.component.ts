import { Component, OnInit } from '@angular/core';
import { FireService, USER } from '../../../../public_api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: USER = <USER>{};
  constructor(
    public fire: FireService
  ) {
    fire.auth.onAuthStateChanged( user => {
      if ( user ) {
        fire.user.data().then(re => this.user = re.data.user).catch(e => alert(e.message));
      }
    });
  }

  ngOnInit() {
  }
  onSubmitForm(event: Event) {
    event.preventDefault();

    return false;
  }

}
