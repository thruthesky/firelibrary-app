import { Component, OnInit } from '@angular/core';
import { FireService } from './../../modules/firelibrary/core';

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.css']
})
export class InstallComponent implements OnInit {

  show = {
    loader: false,
    content: false,
    installed: false
  };
  constructor(
    public fire: FireService
  ) {
    this.show.loader = true;

    fire.checkInstall().then(re => {
      this.show.loader = false;
      this.show.content = true;
      this.show.installed = re.data.installed;
    })
      .catch(e => {
        this.show.loader = false;
        alert(e.message);
      });
  }

  ngOnInit() {
    //
  }

  onSubmitInstall(event: Event) {
    event.preventDefault();
    console.log(`Going to set ${this.fire.user.email} as admin`);
    this.fire.install({ email: this.fire.user.email }).then(re => {
      console.log('install: ', re);
      this.fire.checkInstall()
        .then( result => this.show.installed = result.data.installed );
    })
      .catch(e => alert(e.message));
    return false;
  }
}
