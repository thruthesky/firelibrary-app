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

    /**
     * If you put it in comment component, it will be called many times since you are subscribing many times.
     * Try to put it somewhere like post list page or app component if you want it to be called only one time.
     */
    fire.comment.created.subscribe( (comment) => {
      console.log('comment created subscription: ', comment);
    });

    fire.setLanguage('ko')
      .catch( e => alert('Failed to load language file. ' + e.message) );

    fire.checkInstall().then( re => this.installed = re.data.installed ).catch(e => alert(e.message));


  }
}
