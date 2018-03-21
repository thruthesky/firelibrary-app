import { Component } from '@angular/core';
import { FireService } from './modules/firelibrary/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  installed = false;
  constructor(public fire: FireService) {

    fire.setLanguage('ko')
      .catch( e => alert('Failed to load language file. ' + e.message) );

    fire.checkInstall().then( re => this.installed = re.data.installed ).catch(e => alert(e.message));


  }
}
