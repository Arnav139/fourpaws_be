import { and, desc, eq, sql } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { comments, postLikes, posts, users } from "../models/schema";

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

  static getAllPosts = async (
    userId: number,
    cursor: number,
    limit: number,
  ): Promise<{ posts: any[]; totalPosts: number }> => {
    try {
      const totalPostsResult = await postgreDb
        .select({ count: sql<number>`COUNT(*)`.as("total") })
        .from(posts);

      const totalPosts = totalPostsResult[0]?.count || 0;

      const postsResult = await postgreDb
        .select({
          id: posts.id,
          content: posts.content,
          image: posts.image,
          type: posts.type,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          authorName: users.name,
          authorAvatar: users.profileImageUrl,
          commentsCount: sql`COUNT(DISTINCT ${comments.id})`.as(
            "commentsCount",
          ),
          likesCount: sql`COUNT(DISTINCT ${postLikes.id})`.as("likesCount"),
          isLiked: sql`
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM ${postLikes}
                WHERE ${postLikes.postId} = ${posts.id}
                AND ${postLikes.userId} = ${userId}
              ) THEN true
              ELSE false
            END
          `.as("isLiked"),

          media: sql`
            CASE
              WHEN ${posts.image} IS NOT NULL THEN jsonb_build_array(
                jsonb_build_object('type', 'image', 'url', ${posts.image})
              )
              ELSE '[]'::jsonb
            END
          `.as("media"),
        })
        .from(posts)
        .leftJoin(users, sql`${posts.authorId} = ${users.id}`)
        .leftJoin(comments, sql`${comments.postId} = ${posts.id}`)
        .leftJoin(postLikes, sql`${postLikes.postId} = ${posts.id}`)
        .groupBy(
          posts.id,
          users.name,
          users.profileImageUrl,
          posts.content,
          posts.image,
          posts.type,
          posts.createdAt,
          posts.updatedAt,
        )
        .orderBy(desc(posts.createdAt))
        .offset(cursor)
        .limit(limit);

      return {
        posts: postsResult,
        totalPosts,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }
  };

  static async getPostById(postId: number): Promise<any> {
    try {
      const post = await postgreDb
        .select()
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.id, postId))
        .limit(1);

      if (post.length === 0) {
        return null;
      }

      return post[0];
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      throw new Error("Failed to fetch post");
    }
  }

  static async toggleLike(userId: number, postId: number): Promise<boolean> {
    try {
      const existingLike = await postgreDb
        .select()
        .from(postLikes)
        .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)))
        .limit(1);

      if (existingLike.length > 0) {
        await postgreDb
          .delete(postLikes)
          .where(
            and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)),
          );
        return false;
      } else {
        await postgreDb.insert(postLikes).values({
          userId,
          postId,
        });
        return true;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("Failed to toggle like");
    }
  }
}
