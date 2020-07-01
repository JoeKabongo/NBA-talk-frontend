import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CloudinaryImageUploadAdapter } from 'ckeditor-cloudinary-uploader-adapter';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';


import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BlogArticle } from '../../../models/blogArticle';
import { BlogpostService } from 'src/app/services/blogposts/blogpost.service';
import { AuthService } from 'src/app/services/auth/auth.service';




@Component({
  selector: 'app-write-blog',
  templateUrl: './write-blog.component.html',
  styleUrls: ['./write-blog.component.css']
})
export class WriteBlogComponent implements OnInit {
  public Editor = ClassicEditor;
  editorConfig = {
    placeholder: 'Type the content here!',
    extraPlugins: [ this.imagePluginFactory ],
    // toolbar: [ 'identention', 'heading', 'bold', 'italic', 'bulletedList', 'numberedList',
    // 'blockQuote',  { name: 'insert', items: [ 'Table' ] }  ]


  };
  article: BlogArticle;
  previouslySaved: BlogArticle;
  selectedFile: File;

  wasSaved: boolean;

  tags: string;
  previewUrl: any = null;


  constructor(private blogService: BlogpostService, private authService: AuthService,
              private router: Router, private route: ActivatedRoute, private http: HttpClient) {
        this.article = {
          id: -1,
          title: '',
          authorName: this.authService.getUsername(),
          coverImage: '',
          datePublished: '',
          lastEdited: '',
          body: '',
          isPublished: false,
          blurb: '',
          comments: 0,
        };
  }



  imagePluginFactory(editor) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = (loader ) => {
      console.log(loader);
      return new CloudinaryImageUploadAdapter(
        loader,   'dgknrkenk', 'default-preset',
        [ 160, 500, 1000, 1052 ]
      );
    };
  }

  ngOnInit() {
    this.wasSaved = false;
    this.tags = '';

    this.route.paramMap.subscribe((params: ParamMap) => {
        const articleId = (params.get('articleId'));
        if (articleId !== null) {
          this.getArticleInfo(articleId);
          this.wasSaved = true;
        } else {
          this.wasSaved = false;
        }
    });

  }

  public onChange( { editor }: ChangeEvent ) {
    const data = editor.getData();
  }

  getArticleInfo(articleId) {
    this.blogService.getBlogArticle(articleId).subscribe(
        data => {
            this.article = data;
            this.previewUrl = this.article.coverImage;
        }, error => {
            console.log(error);
        }
    );

  }

  onFileChanged(event) {
      this.selectedFile = event.target.files[0];
      this.preview();

      // const formData: FormData = new FormData();
      // formData.append('file_upload', this.selectedFile, this.selectedFile.name);
      // this.http.post<any>('http://127.0.0.1:8000/api/blogPost/uploadFile', formData).subscribe(
      //   data => {
      //     console.log(data);
      //   }, error => {
      //     console.log(error);
      //   }
      // );
  }

  preview() {
    // Show preview
    const mimeType = this.selectedFile.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (event) => {
      this.previewUrl = reader.result;
    };
  }

  publishArticle() {
    // if this is a new post
    if (this.article.id === -1 && this.wasSaved === false) {
        this.article.isPublished = true;
        this.blogService.createBlogPost(this.article, this.selectedFile).subscribe(
          data => {
            console.log(data);
            this.router.navigate(['blog', data.id, data.title]);
          }, error => {
            console.log('something is wrong');
            this.article.isPublished = false;

          }
        );
    } else { // if this post was already save, just save the new data
      this.article.isPublished = true;


      // see if the image was changed or not
      let file = this.selectedFile;
      if (this.previewUrl === this.article.coverImage) {
          file = null;
      }

      this.blogService.saveArticle(this.article, file).subscribe(
          data => {
            console.log(data);
            this.router.navigate(['blog', data.id]);

          },
          error => {
            console.log(error);
            this.article.isPublished = false;
          }

      );
    }

  }

  saveArticle(exit: boolean) {
    if (this.wasSaved) {

      // see if the image was changed or not
      let file = this.selectedFile;
      if (this.previewUrl === this.article.coverImage) {
          file = null;
      }

      console.log(file);
      this.blogService.saveArticle(this.article, this.selectedFile).subscribe(
            data => {
              this.article.id = data.id;
              this.wasSaved = true;

              /* if the writer wants to exit the page, redirect to the article or dashboard */
              if (exit) {
                  if (this.article.isPublished) {
                      this.router.navigate(['blog', this.article.id, this.article.title]);
                  } else {
                    this.router.navigate(['blog/dashboard']);
                  }
              }
              console.log('yess, we did it');
          }, error => {
              console.log(error);
          }
      );
    } else {
      this.blogService.createBlogPost(this.article, this.selectedFile).subscribe(
          data => {
              this.article = data;
              this.wasSaved = true;

              /* if the writer wants to exit the page, redirect to the article or dashboard */
              if (exit) {
                if (this.article.isPublished) {
                    this.router.navigate(['blog', this.article.id]);
                } else {
                  this.router.navigate(['blog/dashboard']);
                }
              }
              console.log(data);
          }, error => {
            console.log(error);
          }
      );
    }
  }

  editArticle() {
    // see if the image was changed or not
    let file = this.selectedFile;
    if (this.previewUrl === this.article.coverImage) {
        file = null;
    }

    this.blogService.saveArticle(this.article, file)
        .subscribe(data => {
          console.log(data);
        });


  }
  onSubmit(event: Event) {
    // this.blogService.createBlogPost(this.article);
  }

}
