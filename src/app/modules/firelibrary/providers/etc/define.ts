import * as settings from '../../settings';
const x = settings.COLLECTION_PREFIX;
export const COLLECTIONS = {
    USERS: x + 'users',
    SETTINGS: x + 'settings',
    CATEGORIES: x + 'categories',
    POSTS: x + 'posts',
    // POSTS_DELETED: 'posts_deleted', // no more in use.

    /**
     * Sub collections. No prefix for subcollections.
     */
    LIKES: 'likes',
    DISLIKES: 'dislikes',
    COMMENTS: 'comments'
};


export const POST_DELETED = 'This post has been deleted!';
