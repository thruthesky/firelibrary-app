import { Component, OnInit } from '@angular/core';
import { FireService, CATEGORY, POST } from '../../../../public_api';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  categories: { [id: string]: any } = {};
  categoryIds: Array<string> = [];
  post: POST = <POST>{};
  posts: { [id: string]: POST } = {};
  postIds: Array<string> = [];

  loader = {
    creating: false
  };

  /// post list
  category = '';
  constructor(
    public fire: FireService
  ) {
    this.fire.category.categories().then(re => {
      if (re.length) {
        re.map(category => {
          this.categories[category.id] = category;
          this.categoryIds.push(category.id);
        });
      }
    });

    this.loadPage();
  }

  ngOnInit() {
  }
  loadPage( category? ) {
    if ( category ) {
      this.posts = {};
      this.postIds = [];
      this.category = category;
    }
    console.log(this.category);
    this.fire.post.page({ category: this.category, limit: 5 }).then(posts => {
      if (posts.length) {
        posts.map(post => {
          post['date'] = (new Date(post.created)).toLocaleString();
          this.posts[post.id] = post;
          this.postIds.push(post.id);
        });
        console.log('postIds:', this.postIds);
      }
    });
  }
  onSubmit(event: Event) {
    this.fire.post.create(this.post).then(postId => {
      console.log('postId:', postId);
    }).catch(e => alert(e.message));
  }

  get subcategories() {
    if (!this.categoryIds.length) {
      return false;
    }
    if (this.categories[this.post.category] === void 0) {
      return false;
    }
    const sub = this.categories[this.post.category].subcategories;
    if (sub) {
      return sub.split(',').map(v => v.trim());
    } else {
      return false;
    }
  }

}