import { Component, OnInit } from '@angular/core';

import { FireService, CATEGORY } from './../../modules/firelibrary/core';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  loader = {
    create: false,
    categories: false,
    edit: false
  };
  show = {
    create: true,
    edit: false
  };
  category = <CATEGORY>{};
  categories = <Array<CATEGORY>>[];
  constructor(
    public fire: FireService
  ) {
    this.loadCategories();
  }

  ngOnInit() {
  }

  onSubmitCategoryCreateForm(event: Event) {
    if (this.show.edit) {
      return this.onSubmitEditCategoryForm(event);
    }
    event.preventDefault();

    this.loader.create = true;

    this.fire.category.create(this.category)
      .then(x => {
        this.loader.create = false;
        this.category = <any>{};
        this.loadCategories();
      })
      .catch(e => {
        this.loader.create = false;
        alert(e.message);
        // console.log('error: ');
        // console.error(e);
      });

    return false;
  }
  onSubmitEditCategoryForm(event: Event) {
    event.preventDefault();
    this.loader.edit = true;
    this.fire.category.edit(this.category)
      .then(x => {
        this.loader.edit = false;
        this.category = <any>{};
        this.loadCategories();
      })
      .catch(e => {
        this.loader.edit = false;
        alert(e.message);
      });
    return false;
  }

  loadCategories() {
    this.fire.category.categories().then(re => this.categories = re).catch(e => alert(e.message));
  }

  onClickDeleteCategory(category: CATEGORY) {
    category['delete'] = true;
    this.fire.category.delete(category.id)
      .then(x => {
        this.loadCategories();
        category['delete'] = false;
      })
      .catch(e => {
        category['delete'] = false;
        alert(e.message);
        console.log('error: ');
        console.error(e);
      });
  }

  onClickEditCategory(category: CATEGORY) {
    this.show.create = false;
    this.show.edit = true;
    this.loader.edit = true;
    this.fire.category.get(category.id).then(re => {
      console.log('category: ', re);
      this.category = <any>re.data; // 'CATEGORY_GET' is not assignable to type 'CATEGORY'.
      this.loader.edit = false;
    }).catch(e => alert(e.message));
  }
}
