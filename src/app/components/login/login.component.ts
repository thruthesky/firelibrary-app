import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireService } from './../../modules/firelibrary/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  constructor(
    public router: Router,
    public fire: FireService
  ) { }

  ngOnInit() {
  }

  onSubmitLoginForm( event: Event ) {
    event.preventDefault();


    this.fire.user.login( this.email, this.password )
      .then( x => this.router.navigateByUrl('/') )
      .catch( e => alert(e.message));


    return false;
  }

}
