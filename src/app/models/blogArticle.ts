export interface BlogArticle {
  id: number;
  title: string;
  authorName: string;
  coverImage: string;
  datePublished: string;
  lastEdited: string;
  isPublished: boolean;
  body: string;
  blurb: string;
  comments: number;
}
