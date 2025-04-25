import { $Type, and, desc, eq, sql } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { comments, postLikes, posts, users } from "../models/schema";
import { TypeOf } from "zod";
import { alias } from "drizzle-orm/gel-core";

export default class FeedService {
  private static getPostQuery = (userId: number) => {
    return postgreDb
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        type: posts.type,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorName: users.name,
        authorAvatar: users.profileImageUrl,
        commentsCount: sql`COUNT(DISTINCT ${comments.id})`.as("commentsCount"),
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
              jsonb_build_object('id', CONCAT('m', ${posts.id}), 'type', 'image', 'url', ${posts.image})
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
        posts.metadata,
      )
      .orderBy(desc(posts.createdAt));
  };

  static createPost = async (data: any): Promise<any> => {
    try {
      // Insert the new post into the DB.
      const [newPost] = await postgreDb
        .insert(posts)
        .values({
          authorId: data.authorId,
          content: data.content,
          type: data.type,
          image: data.imageUrl,
          metadata: data.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as typeof posts.$inferInsert)
        .returning({
          id: posts.id,
          content: posts.content,
          type: posts.type,
          image: posts.image,
          metadata: posts.metadata,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          authorId: posts.authorId,
        });

      // Get author details for formatting.
      const [author] = await postgreDb
        .select({
          name: users.name,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, data.authorId));

      // Build a base post object.
      const basePost = {
        id: newPost.id.toString(),
        authorId: newPost.authorId.toString(),
        authorName: author.name,
        authorAvatar: author.profileImageUrl,
        content: newPost.content,
        createdAt: newPost.createdAt.toISOString(),
        updatedAt: newPost.updatedAt.toISOString(),
        type: newPost.type,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };

      // Apply type-specific formatting.
      let formattedPost: any = { ...basePost };
      switch (newPost.type) {
        case "poll": {
          const pollData = newPost.metadata as {
            pollOptions: { text: string }[];
            pollDuration: number;
          };
          formattedPost = {
            ...basePost,
            pollOptions: pollData.pollOptions.map((opt, index) => ({
              id: `opt${index + 1}`,
              text: opt.text,
              votes: 0,
              percentage: 0,
            })),
            pollDuration: pollData.pollDuration,
            expiresAt: new Date(
              Date.now() + pollData.pollDuration * 3600000,
            ).toISOString(),
            totalVotes: 0,
            userVoted: false,
          };
          break;
        }
        case "link": {
          const linkData = newPost.metadata as { linkUrl: string };
          formattedPost = {
            ...basePost,
            linkUrl: linkData.linkUrl,
            linkTitle: "Example Link Title", // In production, fetch via a preview service.
            linkDescription: "This is a placeholder for link description",
            linkImage: "https://via.placeholder.com/300",
          };
          break;
        }
        case "campaign": {
          const campaignData = newPost.metadata as {
            campaignTitle: string;
            campaignGoal: number;
            deadline: string;
            campaignImage?: string;
          };
          formattedPost = {
            ...basePost,
            campaignTitle: campaignData.campaignTitle,
            campaignGoal: campaignData.campaignGoal,
            currentAmount: 0,
            deadline: campaignData.deadline,
            campaignImage: campaignData.campaignImage,
          };
          break;
        }
        case "volunteer": {
          const volunteerData = newPost.metadata as {
            volunteerRole: string;
            eventDate: string;
            location: string;
            eventImage?: string;
          };
          formattedPost = {
            ...basePost,
            volunteerRole: volunteerData.volunteerRole,
            eventDate: volunteerData.eventDate,
            location: volunteerData.location,
            eventImage: volunteerData.eventImage,
          };
          break;
        }
        case "new_profile": {
          const profileData = newPost.metadata as {
            petProfileId: string;
            petName: string;
            petBreed: string;
            petAvatar: string;
            petAge?: string;
          };
          formattedPost = {
            ...basePost,
            petProfileId: profileData.petProfileId,
            petName: profileData.petName,
            petBreed: profileData.petBreed,
            petAvatar: profileData.petAvatar,
            petAge: profileData.petAge,
          };
          break;
        }
        case "sponsored": {
          const sponsoredData = newPost.metadata as {
            sponsorName: string;
            sponsorLogo: string;
            adLink: string;
            adDescription?: string;
          };
          formattedPost = {
            ...basePost,
            sponsorName: sponsoredData.sponsorName,
            sponsorLogo: sponsoredData.sponsorLogo,
            adLink: sponsoredData.adLink,
            adDescription: sponsoredData.adDescription,
          };
          break;
        }
        case "emergency": {
          const emergencyData = newPost.metadata as {
            emergencyType: "pawwlice" | "medical";
            petName: string;
            lastSeen?: string;
            contactPhone: string;
            emergencyImage?: string;
            isCritical: boolean;
          };
          formattedPost = {
            ...basePost,
            emergencyType: emergencyData.emergencyType,
            petName: emergencyData.petName,
            lastSeen: emergencyData.lastSeen,
            contactPhone: emergencyData.contactPhone,
            emergencyImage: emergencyData.emergencyImage,
            isCritical: emergencyData.isCritical,
          };
          break;
        }
        default: {
          // Standard post.
          formattedPost = {
            ...basePost,
            mediaUrl: newPost.image?.[0],
            media: newPost.image?.[0]
              ? [
                  {
                    id: `m${newPost.id}`,
                    type: "image",
                    url: newPost.image[0],
                  },
                ]
              : undefined,
          };
        }
      }

      return formattedPost;
    } catch (error) {
      console.error("Error in FeedService.createPost:", error);
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

      const postsResult = await this.getPostQuery(userId)
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

  static async getPostById(postId: number, authorId: number): Promise<any> {
    try {
      const post = await this.getPostQuery(authorId)
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

  static async getCommentById(commentId: number, userId: number): Promise<any> {
    try {
      const comment = await postgreDb
        .select()
        .from(comments)
        .leftJoin(users, eq(comments.authorId, users.id))
        .where(and(eq(comments.authorId, userId), eq(comments.id, commentId)))
        .limit(1);

      if (comment.length === 0) {
        return null;
      }
      return comment[0];
    } catch (error) {
      console.error("Error fetching comment by ID:", error);
      throw new Error("Failed to fetch comment");
    }
  }

  static async togglePostLike(
    userId: number,
    postId: number,
  ): Promise<boolean> {
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
  static async toggleCommentLike(
    authorId: number,
    commentId: number,
  ): Promise<boolean> {
    try {
      const existingLike = await postgreDb
        .select()
        .from(postLikes)
        .where(
          and(
            eq(postLikes.userId, authorId),
            eq(postLikes.commentId, commentId),
          ),
        )
        .limit(1);

      if (existingLike.length > 0) {
        await postgreDb
          .delete(postLikes)
          .where(
            and(
              eq(postLikes.userId, authorId),
              eq(postLikes.commentId, commentId),
            ),
          );
        return false;
      } else {
        await postgreDb.insert(postLikes).values({
          userId: authorId,
          commentId,
        });
        return true;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("Failed to toggle like");
    }
  }

  static async addCommentByPostId(
    authorId: number,
    postId: number,
    content: string,
  ): Promise<any> {
    try {
      // Insert the new comment
      const [insertedComment] = await postgreDb
        .insert(comments)
        .values({
          authorId,
          postId,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as typeof comments.$inferInsert)
        .returning();

      // Fetch the full comment details with author info, likes count, and isLiked status
      const [fullComment] = await postgreDb
        .select({
          id: sql<string>`${comments.id}::text`.as("id"), // Cast id to text
          postId: sql<string>`${comments.postId}::text`.as("postId"), // Cast postId to text
          authorId: sql<string>`${comments.authorId}::text`.as("authorId"), // Cast authorId to text
          content: comments.content,
          createdAt:
            sql<string>`to_char(${comments.createdAt}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
              "createdAt",
            ), // Format as ISO string
          authorName: users.name,
          authorAvatar: users.profileImageUrl,
          likesCount: sql<number>`COALESCE(COUNT(${postLikes.id}), 0)`.as(
            "likesCount",
          ), // Ensure 0 if no likes
          isLiked:
            sql<boolean>`COALESCE(BOOL_OR(${postLikes.userId} = ${authorId}), FALSE)`.as(
              "isLiked",
            ), // Ensure FALSE if no likes
        })
        .from(comments)
        .innerJoin(posts, eq(comments.postId, posts.id)) // Join with posts
        .leftJoin(users, eq(comments.authorId, users.id)) // Join with users for author info
        .leftJoin(postLikes, eq(postLikes.postId, posts.id)) // Join with postLikes through posts
        .where(eq(comments.id, insertedComment.id))
        .groupBy(
          comments.id,
          comments.postId,
          comments.authorId,
          comments.content,
          comments.createdAt,
          users.name,
          users.profileImageUrl,
          posts.id, // Include posts.id in groupBy to avoid aggregation issues
        );

      return fullComment;
    } catch (error: any) {
      console.error("Error adding comment:", error);
      throw new Error("Failed to add comment");
    }
  }

  static async getAllCommentsByPostId(
    postId: number,
    authorId: number,
  ): Promise<any> {
    const userId = authorId; // Use the provided authorId as userId

    try {
      const commentsResult = await postgreDb
        .select({
          id: sql<string>`${comments.id}::text`.as("id"), // Cast id to text
          postId: sql<string>`${comments.postId}::text`.as("postId"), // Cast postId to text
          authorId: sql<string>`${comments.authorId}::text`.as("authorId"), // Cast authorId to text
          content: comments.content,
          createdAt:
            sql<string>`to_char(${comments.createdAt}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
              "createdAt",
            ), // Format as ISO string
          authorName: users.name,
          authorAvatar: users.profileImageUrl,
          likesCount: sql<number>`COALESCE(COUNT(${postLikes.id}), 0)`.as(
            "likesCount",
          ), // Count post likes
          isLiked: userId
            ? sql<boolean>`COALESCE(BOOL_OR(${postLikes.userId} = ${userId}), FALSE)`.as(
                "isLiked",
              ) // Check if user liked the post
            : sql<boolean>`FALSE`.as("isLiked"), // Default to FALSE if no userId
        })
        .from(comments)
        .innerJoin(posts, eq(comments.postId, posts.id)) // Join with posts
        .leftJoin(users, eq(comments.authorId, users.id)) // Join with users for author info
        .leftJoin(postLikes, eq(postLikes.commentId, comments.id)) // Join with postLikes for likes
        .where(eq(comments.postId, postId))
        .groupBy(
          comments.id,
          comments.postId,
          comments.authorId,
          comments.content,
          comments.createdAt,
          users.name,
          users.profileImageUrl,
          posts.id, // Include posts.id in groupBy to avoid aggregation issues
        )
        .orderBy(desc(comments.createdAt));

      return commentsResult;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to fetch comments");
    }
  }
}
