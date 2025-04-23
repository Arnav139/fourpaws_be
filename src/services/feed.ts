import postgreDb from "../config/dbConfig";
import { posts } from "../models/schema";

export default class FeedService {
  static createPost = async ({
    authorId,
    content,
    type,
    imageUrl,
  }: {
    authorId: number;
    content: string;
    type: string;
    imageUrl: string;
  }) => {
    try {
      const newPost = await postgreDb
        .insert(posts)
        .values({
          authorId: authorId,
          content: content,
          type: type,
          image: imageUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as typeof posts.$inferInsert)
        .returning({
          mediaUrl: posts.image,
          content: posts.content,
          id: posts.id,
          type: posts.type,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
        });
      return newPost[0];
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("Failed to create post");
    }
  };

  static getAllPosts = async()=>{
    try {
      const allPosts = await postgreDb.query.posts.findMany()
      return allPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }
  }
}
