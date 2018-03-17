import { Component, OnInit, OnDestroy } from '@angular/core';
import { FireService, CATEGORY, POST, COLLECTIONS } from '../../../../public_api';
import * as firebase from 'firebase';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {

  categories: { [id: string]: any } = {};
  categoryIds: Array<string> = [];
  post: POST = <POST>{};
  // posts: { [id: string]: POST } = {};
  // postIds: Array<string> = [];

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

    fire.post.settings = {
      listenOnLikes: true
    };
    this.loadPage('all');
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.fire.post.stopLoadPage();
  }


  getPostIDs() {
    return this.fire.post.pagePostIds;
  }
  getPost(id) {
    return this.fire.post.pagePosts[id];
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
    this.fire.post.page({ category: category, limit: 5 }).then(posts => {
      console.log('posts: ', posts);
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
        this.post.id = re.data.id;
        this.fire.post.addPostOnTop( this.post );
        this.post = {};
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


  onClickEdit(post: POST) {
    console.log('post: ', post);
    this.post = post;
  }
  onClickDelete(id: string) {
    console.log('Going to delete: ', id);
    this.fire.post.delete(id).then(re => {
      console.log('deleted: ', re.data.id);
    }).catch(e => alert(e.message));
  }
  onClickLike(id: string) {
    this.fire.post.like(id).then(re => {
      // console.log(re);
    }).catch(e => alert(e.message));
  }
  onClickDislike(id: string) {

  }
}
