import express, { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { FeedService, UserService } from "../services/index";
import { number } from "zod";
import { numeric } from "drizzle-orm/pg-core";
import { formatPost } from "../utils/helpers";
import { uploadVideoToCloudinary } from "../utils/uploadVideotoCloudinary";

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  media?: { id: string; type: string; url: string }[];
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  type: string;
  pollOptions?: {
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }[];
  pollDuration?: number;
  expiresAt?: string;
  totalVotes?: number;
  userVoted?: boolean;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  emergencyType?: string;
  petName?: string;
  lastSeen?: string;
  contactPhone?: string;
  emergencyImage?: string;
  isCritical?: boolean;
  campaignTitle?: string;
  campaignGoal?: number;
  currentAmount?: number;
  deadline?: string;
  campaignImage?: string;
  sponsorName?: string;
  sponsorLogo?: string;
  adLink?: string;
  adDescription?: string;
  volunteerRole?: string;
  eventDate?: string;
  location?: string;
  eventImage?: string;
}

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  nextCursor?: string;
}

export default class FeedController {
  static getCommentsByPostId = async (req: Request, res: any) => {
    try {
      const { postId } = req.params;
      const authorId = req["user"]["userId"] as any;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;

      const allCommentsOfPost = await FeedService.getAllCommentsByPostId(
        parseInt(postId),
        authorId
      );

      const postComments = allCommentsOfPost.filter((c) => c.postId === postId);

      if (postComments.length === 0) {
        return res.status(200).json({
          comments: [],
          hasMore: false,
          nextCursor: undefined,
        });
      }

      postComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const startIndex = cursor ? parseInt(cursor) : 0;
      const endIndex = startIndex + limit;
      const paginatedComments = postComments.slice(startIndex, endIndex);
      const hasMore = endIndex < postComments.length;
      const nextCursor = hasMore ? endIndex.toString() : undefined;

      // Send the response
      const response: CommentsResponse = {
        comments: paginatedComments,
        hasMore,
        nextCursor,
      };
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static getPosts = async (req: Request, res: any) => {
    try {
      const email = req["user"]["userId"] as any;
      const userId = req["user"]["userId"] as any;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized user" });
      }

      const cursor = parseInt(req.query.cursor as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;

      const { posts, totalPosts } = await FeedService.getAllPosts(
        userId,
        cursor,
        limit
      );

      const formattedPosts = await Promise.all(posts.map(formatPost));

      const hasMore = cursor + limit < totalPosts;
      const nextCursor = hasMore ? cursor + limit : undefined;

      // Response
      res.status(200).json({
        success: true,
        posts: formattedPosts,
        hasMore,
        nextCursor,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static getAllStories = async (req: Request, res: Response) => {
    try {
      const userId = req["user"]?.userId as number;
      const storiesResult = await FeedService.getAllStories(userId);

      res.status(200).json({
        success: true,
        message: "Stories fetched successfully",
        stories: storiesResult,
      });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static createPost = async (req: Request, res: Response): Promise<any> => {
    try {
      // Ensure authentication – we assume middleware has set req.user.
      const email = req["user"]?.email as string;
      const authorId = req["user"]?.userId as number;
      if (!email || !authorId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized user" });
      }
      console.log(req.files, "req.files");
      // Verify the user exists.
      const user = await UserService.getUser(email);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Destructure common properties.
      const { content = "", type = "standard", ...typeSpecificData } = req.body;
      console.log(content, type, typeSpecificData, "req.body");

      // Validate common fields for a standard post.
      const postImageFile = (req.files as { postImage: Express.Multer.File[] })
        ?.postImage?.[0];
      if (type === "standard" && !content.trim() && !postImageFile) {
        return res.status(400).json({
          success: false,
          message: "Content or media is required for a standard/story post",
        });
      }

      const postVideoFile = (req.files as { postVideo: Express.Multer.File[] })
        ?.postVideo?.[0];
      if (type === "story" && !postImageFile && !postVideoFile) {
        return res.status(400).json({
          success: false,
          message: "Content or media is required for a story post",
        });
      }

      // Validate type-specific fields.
      switch (type) {
        case "poll": {
          const { pollOptions, pollDuration } = typeSpecificData;
          if (
            !pollOptions ||
            pollOptions.length < 2 ||
            !pollDuration ||
            pollDuration <= 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Poll posts require at least 2 options and a valid duration",
            });
          }
          break;
        }
        case "link": {
          const { linkUrl } = typeSpecificData;
          if (!linkUrl) {
            return res.status(400).json({
              success: false,
              message: "Link URL is required",
            });
          }
          break;
        }
        case "campaign": {
          const { campaignTitle, campaignGoal, deadline } = typeSpecificData;
          if (
            !campaignTitle ||
            !campaignGoal ||
            Number(campaignGoal) <= 0 ||
            !deadline
          ) {
            return res.status(400).json({
              success: false,
              message: "Campaign title, goal, and deadline are required",
            });
          }
          break;
        }
        case "volunteer": {
          const { volunteerRole, eventDate, location } = typeSpecificData;
          if (!volunteerRole || !eventDate || !location) {
            return res.status(400).json({
              success: false,
              message: "Volunteer role, event date, and location are required",
            });
          }
          break;
        }
        case "new_profile": {
          const { petProfileId, petName, petBreed, petAvatar } =
            typeSpecificData;
          if (!petProfileId || !petName || !petBreed || !petAvatar) {
            return res.status(400).json({
              success: false,
              message: "Pet profile ID, name, breed, and avatar are required",
            });
          }
          break;
        }
        case "sponsored": {
          const { sponsorName, sponsorLogo, adLink } = typeSpecificData;
          if (!sponsorName || !sponsorLogo || !adLink) {
            return res.status(400).json({
              success: false,
              message: "Sponsor name, logo, and ad link are required",
            });
          }
          break;
        }
        case "emergency": {
          const { emergencyType, petName, contactPhone } = typeSpecificData;
          if (!emergencyType || !petName || !contactPhone) {
            return res.status(400).json({
              success: false,
              message:
                "Emergency type, pet name, and contact phone are required",
            });
          }
          break;
        }
        case "story": {
          const { authorId, type, imageUrl, videoUrl, metadata } =
            typeSpecificData;
        }
        // No additional checks for “standard” type.
        default:
          break;
      }

      // Process file upload if present.
      let imageUrl: string = undefined;
      if (postImageFile) {
        // Convert image buffer to data URI.
        const mainImageDataUri = `data:${
          postImageFile.mimetype
        };base64,${postImageFile.buffer.toString("base64")}`;
        const mainImageUpload = await cloudinary.uploader.upload(
          mainImageDataUri,
          {
            folder: "feed",
          }
        );
        imageUrl = mainImageUpload.secure_url;
      }

      let videoUrl: string = undefined;
      if (postVideoFile) {
        const videoUpload = await uploadVideoToCloudinary(postVideoFile.buffer);
        console.log(videoUpload, "videoUpload");
        videoUrl = videoUpload.secure_url;
      }
      // Prepare metadata from type-specific fields.
      const metadata: Record<string, any> = {};
      switch (type) {
        case "poll":
          metadata.pollOptions = Array.isArray(typeSpecificData.pollOptions)
            ? typeSpecificData.pollOptions
            : JSON.parse(typeSpecificData.pollOptions);
          metadata.pollDuration = typeSpecificData.pollDuration;
          break;
        case "link":
          metadata.linkUrl = typeSpecificData.linkUrl;
          break;
        case "campaign":
          metadata.campaignTitle = typeSpecificData.campaignTitle;
          metadata.campaignGoal = typeSpecificData.campaignGoal;
          metadata.deadline = typeSpecificData.deadline;
          metadata.campaignImage = imageUrl;
          // metadata.campaignImage = typeSpecificData.campaignImage;
          break;
        case "volunteer":
          metadata.volunteerRole = typeSpecificData.volunteerRole;
          metadata.eventDate = typeSpecificData.eventDate;
          metadata.location = typeSpecificData.location;
          metadata.eventImage = imageUrl;
          // metadata.eventImage = typeSpecificData.eventImage;
          break;
        case "new_profile":
          metadata.petProfileId = typeSpecificData.petProfileId;
          metadata.petName = typeSpecificData.petName;
          metadata.petBreed = typeSpecificData.petBreed;
          metadata.petAvatar = typeSpecificData.petAvatar;
          metadata.petAge = typeSpecificData.petAge;
          break;
        case "sponsored":
          metadata.sponsorName = typeSpecificData.sponsorName;
          metadata.sponsorLogo = typeSpecificData.sponsorLogo;
          metadata.adLink = typeSpecificData.adLink;
          metadata.adDescription = typeSpecificData.adDescription;
          break;
        case "emergency":
          metadata.emergencyType = typeSpecificData.emergencyType;
          metadata.petName = typeSpecificData.petName;
          metadata.lastSeen = typeSpecificData.lastSeen;
          metadata.contactPhone = typeSpecificData.contactPhone;
          metadata.emergencyImage = imageUrl;
          // metadata.emergencyImage = typeSpecificData.emergencyImage;
          metadata.isCritical = typeSpecificData.isCritical;
          break;
        default:
          // For standard posts, you might simply include any media URL.
          break;
      }

      const id = Math.random().toString(36).substring(2, 9);

      // Build the service payload (notice that we include content, type, any image URL, and metadata)
      const postPayload = {
        authorId,
        content: content || "",
        type,
        media: [
          ...(imageUrl
            ? [{ id, type: "image", url: imageUrl }]
            : videoUrl
            ? [{ id, type: "video", url: videoUrl }]
            : []),
        ],
        metadata,
      };

      const newPost = await FeedService.createPost(postPayload);

      if (!newPost) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to create post" });
      }

      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: {
          ...newPost,
          authorName: user.name,
          authorAvatar: user.profileImageUrl,
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
        },
      });
    } catch (error) {
      console.error("Create Post Error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  static togglePostLike = async (req: Request, res: any) => {
    try {
      const userId = req["user"]?.userId;
      const { postId } = req.params;
      console.log(userId,"userId", postId,  "postId")
      if (!userId || !postId) {
        return res.status(400).json({
          success: false,
          error: "User ID and Post ID are required",
        });
      }

      const post = await FeedService.getPostById(Number(postId), userId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }

      const isLiked = await FeedService.togglePostLike(
        Number(userId),
        Number(postId)
      );

      res.status(200).json({
        success: true,
        message: isLiked
          ? "Post liked successfully"
          : "Post unliked successfully",
        isLiked,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  static toggleCommentLike = async (req: Request, res: any) => {
    try {
      const userId = req["user"]?.userId;
      const { commentId } = req.params;

      if (!userId || !commentId) {
        return res.status(400).json({
          success: false,
          error: "User ID and Post ID are required",
        });
      }

      const post = await FeedService.getCommentById(Number(commentId), userId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }

      const isLiked = await FeedService.toggleCommentLike(
        Number(userId),
        Number(commentId)
      );

      res.status(200).json({
        success: true,
        message: isLiked
          ? "comment liked successfully"
          : "comment unliked successfully",
        isLiked,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  static getPostById = async (req: Request, res: any) => {
    try {
      const authorId = req["user"]?.userId;
      const { postId } = req.params;
      const post = await FeedService.getPostById(
        Number(postId),
        Number(authorId)
      );
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }
      const formattedPost = await formatPost(post);
      res.status(200).json({ success: true, post: formattedPost });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  static addCommentByPostId = async (req: Request, res: any) => {
    try {
      const authorId = req["user"]["userId"] as any;
      const { postId } = req.params;
      const { content } = req.body;

      if (!authorId || !postId || !content) {
        return res.status(400).json({
          success: false,
          error: "Author ID, Post ID, and content are required",
        });
      }
      const newComment = await FeedService.addCommentByPostId(
        authorId,
        parseInt(postId),
        content
      );
      if (!newComment) {
        return res.status(500).json({
          success: false,
          error: "Failed to add comment",
        });
      }
      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comment: newComment,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
}
