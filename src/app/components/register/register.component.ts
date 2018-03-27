import { Component, OnInit } from '@angular/core';
import { FireService, USER } from './../../modules/firelibrary/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user = <USER>{};
  constructor(public fire: FireService) { }

  ngOnInit() {
    // this.user.email = 'test' + (new Date).getTime() + '@user.com';
    // this.user.password = this.user.email;
    // this.user.displayName = 'Name';
    // this.onSubmitRegisterForm();
  }


  onSubmitRegisterForm(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    console.log('user data: ', this.user);
    this.fire.user.register(this.user).then(user => {
      console.log('user register: ', user);
    })
      .catch(e => alert(e.message));

    return false;

  }
}
