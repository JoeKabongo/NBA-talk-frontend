export  interface Reply {
  id: number;
  username: string;
  profileImage: string;
  time: string;
  content: string;
  likes: number;
  dislikes: number;
  isDisliked: boolean;
  isLiked: boolean;
}
