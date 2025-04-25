import { $Type, and, desc, eq, sql } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { comments, postLikes, posts, users } from "../models/schema";
import { TypeOf } from "zod";
import { alias } from "drizzle-orm/gel-core";

export default class FeedService {
  static createPost = async ({
    authorId,
    content,
    type,
    imageUrl,
    metadata,
  }: {
    authorId: number;
    content: string;
    type: string;
    imageUrl: string[];
    metadata: object;
  }) => {
    try {
      // Insert the new post
      const [newPost] = await postgreDb
        .insert(posts)
        .values({
          authorId,
          content,
          type,
          image: imageUrl,
          metadata,
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

      // Fetch author details
      const [author] = await postgreDb
        .select({
          name: users.name,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, authorId));

      // Base post structure
      const now = newPost.createdAt.toISOString();
      let formattedPost: any = {
        id: newPost.id.toString(),
        authorId: newPost.authorId.toString(),
        authorName: author.name,
        authorAvatar: author.profileImageUrl,
        content: newPost.content,
        createdAt: now,
        updatedAt: newPost.updatedAt.toISOString(),
        type: newPost.type,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };

      // Type-specific formatting
      switch (type) {
        case "poll":
          const pollMetadata = newPost.metadata as {
            pollOptions: { text: string }[];
            pollDuration: number;
          };
          formattedPost = {
            ...formattedPost,
            pollOptions: pollMetadata.pollOptions.map((opt, index) => ({
              id: `opt${index + 1}`,
              text: opt.text,
              votes: 0,
              percentage: 0,
            })),
            pollDuration: pollMetadata.pollDuration,
            expiresAt: new Date(
              Date.now() + pollMetadata.pollDuration * 3600000
            ).toISOString(),
            totalVotes: 0,
            userVoted: false,
          };
          break;
        case "link":
          const linkMetadata = newPost.metadata as { linkUrl: string };
          formattedPost = {
            ...formattedPost,
            linkUrl: linkMetadata.linkUrl,
            linkTitle: "Example Link Title", // Placeholder; implement link preview service in production
            linkDescription: "This is a placeholder for link description",
            linkImage: "https://via.placeholder.com/300",
          };
          break;
        case "campaign":
          const campaignMetadata = newPost.metadata as {
            campaignTitle: string;
            campaignGoal: number;
            deadline: string;
            campaignImage?: string;
          };
          formattedPost = {
            ...formattedPost,
            campaignTitle: campaignMetadata.campaignTitle,
            campaignGoal: campaignMetadata.campaignGoal,
            currentAmount: 0,
            deadline: campaignMetadata.deadline,
            campaignImage: campaignMetadata.campaignImage,
          };
          break;
        case "volunteer":
          const volunteerMetadata = newPost.metadata as {
            volunteerRole: string;
            eventDate: string;
            location: string;
            eventImage?: string;
          };
          formattedPost = {
            ...formattedPost,
            volunteerRole: volunteerMetadata.volunteerRole,
            eventDate: volunteerMetadata.eventDate,
            location: volunteerMetadata.location,
            eventImage: volunteerMetadata.eventImage,
          };
          break;
        case "new_profile":
          const profileMetadata = newPost.metadata as {
            petProfileId: string;
            petName: string;
            petBreed: string;
            petAvatar: string;
            petAge?: string;
          };
          formattedPost = {
            ...formattedPost,
            petProfileId: profileMetadata.petProfileId,
            petName: profileMetadata.petName,
            petBreed: profileMetadata.petBreed,
            petAvatar: profileMetadata.petAvatar,
            petAge: profileMetadata.petAge,
          };
          break;
        case "sponsored":
          const sponsoredMetadata = newPost.metadata as {
            sponsorName: string;
            sponsorLogo: string;
            adLink: string;
            adDescription?: string;
          };
          formattedPost = {
            ...formattedPost,
            sponsorName: sponsoredMetadata.sponsorName,
            sponsorLogo: sponsoredMetadata.sponsorLogo,
            adLink: sponsoredMetadata.adLink,
            adDescription: sponsoredMetadata.adDescription,
          };
          break;
        case "emergency":
          const emergencyMetadata = newPost.metadata as {
            emergencyType: "pawwlice" | "medical";
            petName: string;
            lastSeen?: string;
            contactPhone: string;
            emergencyImage?: string;
            isCritical: boolean;
          };
          formattedPost = {
            ...formattedPost,
            emergencyType: emergencyMetadata.emergencyType,
            petName: emergencyMetadata.petName,
            lastSeen: emergencyMetadata.lastSeen,
            contactPhone: emergencyMetadata.contactPhone,
            emergencyImage: emergencyMetadata.emergencyImage,
            isCritical: emergencyMetadata.isCritical,
          };
          break;
        default:
          // Standard post
          formattedPost = {
            ...formattedPost,
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

      return formattedPost;
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

  static async getPostById(postId: number, authorId: number): Promise<any> {
    try {
      const post = await postgreDb
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
                AND ${postLikes.userId} = ${authorId}
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
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(comments, eq(comments.authorId, comments.id))
        .leftJoin(postLikes, eq(postLikes.postId, posts.id))
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
        .leftJoin(postLikes, eq(postLikes.postId, posts.id)) // Join with postLikes for likes
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
