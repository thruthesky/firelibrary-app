import { Component, OnInit } from '@angular/core';
import { FireService } from './../../modules/firelibrary/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    public fire: FireService
  ) { }

  ngOnInit() {
  }

}
