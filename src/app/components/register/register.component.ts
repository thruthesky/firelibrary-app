import { Component, OnInit } from '@angular/core';
import { FireService, USER } from './../../modules/firelibrary/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user = <USER>{};
  loader = false;
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
    this.loader = true;
    this.fire.user.register(this.user).then(() => {
      console.log('user register: ');
      this.fire.auth.onAuthStateChanged(user => {
        if (user) {
          this.fire.user.create(this.user).then(re => {
            console.log('User registration comeplete!', re);
            this.loader = false;
          }).catch(e => {
            this.loader = false;
            alert(e.message);
          });
        }
      });
    })
      .catch(e => {
        this.loader = false;
        alert(e.message);
      });

    return false;

  }
}
