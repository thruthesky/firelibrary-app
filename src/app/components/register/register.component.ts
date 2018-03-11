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
  }


  onSubmitRegisterForm(event: Event) {

    event.preventDefault();

    this.fire.user.register(this.user).then(user => {
      console.log('user register: ', user);
    })
      .catch(e => alert(e.message));

    return false;

  }
}
