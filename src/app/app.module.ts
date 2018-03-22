import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import * as firebase from 'firebase';
import 'firebase/firestore';
firebase.initializeApp({
  apiKey: 'AIzaSyBICC2AsPPYYxkVmfcCF9fDNSAJov-4TVU',
  authDomain: 'thruthesky-firebase-backend.firebaseapp.com',
  databaseURL: 'https://thruthesky-firebase-backend.firebaseio.com',
  projectId: 'thruthesky-firebase-backend',
  storageBucket: 'thruthesky-firebase-backend.appspot.com',
  messagingSenderId: '918272936330'
});


import { FirelibraryModule } from './modules/firelibrary/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CategoryComponent } from './components/category/category.component';
import { PostComponent } from './components/post/post.component';
import { TestComponent } from './components/test/test.component';
import { CommentComponent } from './components/comment/comment.component';
import { CommentListComponent } from './components/comment/comment-list.component';
import { InstallComponent } from './components/install/install.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DataComponent } from './components/data/data.component';





const appRoutes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'post', component: PostComponent },
  { path: 'test', component: TestComponent },
  { path: 'install', component: InstallComponent },
  { path: '', component: HomeComponent },
  { path: '**', component: HomeComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    CategoryComponent,
    PostComponent,
    TestComponent,
    CommentComponent,
    CommentListComponent,
    InstallComponent,
    ProfileComponent,
    DataComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot( appRoutes ),
    FirelibraryModule.forRoot( { firebaseApp: firebase.app(), functions: false } )
  ],
  providers: [  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
