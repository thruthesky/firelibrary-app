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
  // category;
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

    this.loadPage('all');
  }

  ngOnInit() {
  }

  /**
   * Get posts for a page.
   * @desc if input `category` is given, then it opens a new category and gets posts for the first page.
   *    Otherwise it gets posts for next page.
   */
  resetLoadPage(category: string) {
    if (category) {
      if (category === 'all' || this.fire.post.categoryId !== category) {
        this.posts = {};
        this.postIds = [];
        this.fire.post.categoryId = category;
        this.fire.post.resetCursor(category);
      }
    }
  }

  /**
   * Get posts for a page.
   * @desc if input `category` is given, then it opens a new category and gets posts for the first page.
   *    Otherwise it gets posts for next page.
   * @param a category id.
   *    if it is omitted, it loads next page.
   *    if it is 'all', then it loads all categories.
   *    if not, it loads that category only.
   */
  loadPage(category: string) {
    this.resetLoadPage(category);
    this.fire.post.page({ limit: 5 }).then(posts => {
      if (posts.length) {
        posts.map(post => {
          post['date'] = (new Date(post.created)).toLocaleString();
          this.posts[post.id] = post;
          this.postIds.push(post.id);
        });
        // console.log('postIds:', this.postIds);
      }
    });
  }
  /**
   * Create or edit a post
   */
  onSubmit(event: Event) {
    if (this.post.id) {
      this.fire.post.edit(this.post).then(re => {
        console.log('post edit', re);
      })
        .catch(e => alert(e.message));
    } else {
      this.fire.post.create(this.post).then(re => {
        console.log('postId:', re.data.id);
      }).catch(e => alert(e.message));
    }
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


  onClickPostEdit(post: POST) {
    console.log('post: ', post);
    this.post = post;
  }
  onClickPostDelete(id: string) {
    console.log('Going to delete: ', id);
    this.fire.post.delete(id).then(re => {
      console.log('deleted: ', re.data.id);
    })
      .catch(e => alert(e.message));
  }
}
