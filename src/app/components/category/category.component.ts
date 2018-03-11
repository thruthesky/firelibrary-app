import { Component, OnInit } from '@angular/core';

import { FireService, CATEGORY } from './../../modules/firelibrary/core';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  progress = false;
  category = <CATEGORY>{};
  constructor(
    public fire: FireService
  ) {
    this.loadCategories();
  }

  ngOnInit() {
  }

  onSubmitCategoryCreateForm(event: Event) {
    event.preventDefault();

    this.progress = true;

    this.fire.category.create(this.category)
      .then(x => this.loadCategories())
      .catch(e => alert(e.message));

    return false;
  }

  loadCategories() {

    console.log('Going to load categories');
  }
}
