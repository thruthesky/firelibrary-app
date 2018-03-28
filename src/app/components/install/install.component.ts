import { Component, OnInit } from '@angular/core';
import { FireService } from './../../modules/firelibrary/core';

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.css']
})
export class InstallComponent implements OnInit {


  constructor(
    public fire: FireService
  ) {

  }

  ngOnInit() {
  }


  onSubmitInstall(event: Event) {
    event.preventDefault();
    console.log(`Going to set ${this.fire.user.email} as admin`);
    this.fire.install({ email: this.fire.user.email }).then(re => {
      console.log('install: ', re);
    })
      .catch(e => alert(e.message));
    return false;
  }
}
