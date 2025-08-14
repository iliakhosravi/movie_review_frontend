// src/constants/api.ts
export const MOVIES_ENDPOINT = '/movies'
export const USERS_ENDPOINT = '/users'
export const COMMENTS_ENDPOINT = '/comments'
export const FAVORITES_ENDPOINT = '/favorites'


// Django routes

// users
export const USER_SIGNUP_URL = "/api/users/signup/";
export const USER_LOGIN_URL = "/api/users/login/";
export const USER_ME_URL = "/api/users/me/";
export const USER_UPDATE_URL = "/api/users/me/update/";
export const USER_ADMIN_LIST_URL = "/api/users/admin/users/";
export const USER_ADMIN_DELETE_URL = (id: number) => `/api/users/admin/users/${id}/delete/`;
export const USER_CHECK_NAME_URL = "/api/users/check-name/";

// movies
export const MOVIE_SUGGEST_URL = "/api/movies/suggest/";
export const MOVIE_LIST_URL = "/api/movies/list/";
export const MOVIE_DETAIL_URL = (id: number) => `/api/movies/${id}/`;
export const MOVIE_INCREASE_VIEWS_URL = (id: number) => `/api/movies/${id}/increase-views/`;
export const MOVIE_QUALITY_URL = (id: number) => `/api/movies/${id}/quality/`;
export const MOVIE_UPDATE_RATING_URL = (id: number) => `/api/movies/${id}/update-rating/`;

// favorites
export const FAVORITES_ME_URL = "/api/favorites/me/";
export const FAVORITE_DELETE_URL = (id: number) => `/api/favorites/${id}/delete/`;
export const FAVORITE_CREATE_URL = "/api/favorites/create/";

// Comments endpoints
export const COMMENT_CREATE_URL = "/api/comments/create/";
export const COMMENT_LIST_BY_MOVIE_ID = (movieId: number) => `/api/comments/movie/${movieId}/`;
export const COMMENT_ADMIN_DELETE_URL = (id: number) => `/api/comments/admin/${id}/delete/`;
export const COMMENT_DELETE_MY_URL = (id: number) => `/api/comments/me/${id}/delete/`;
export const COMMENT_GET_BY_ID_URL = (id: number) => `/api/comments/${id}/`;
export const COMMENT_EDIT_MY_URL = (id: number) => `/api/comments/me/${id}/edit/`;
export const COMMENT_LIST_MY_URL = "/api/comments/me/";
export const COMMENT_ADMIN_LIST_ALL_URL = "/api/comments/admin/";

// Admin endpoints
export const MOVIE_ADMIN_CREATE_URL = "/api/movies/admin/create/";
export const MOVIE_ADMIN_EDIT_URL = (id: number) => `/api/movies/admin/${id}/edit/`;
export const MOVIE_ADMIN_DELETE_URL = (id: number) => `/api/movies/admin/${id}/delete/`;


