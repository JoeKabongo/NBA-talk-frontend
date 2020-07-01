export  interface Post {
  id: number;
  username: string;
  profileImage: string;
  time: string;
  content: string;
  likes: number;
  dislikes: number;
  comments: number;
  isLiked: boolean;
  isDisliked: boolean;
}
