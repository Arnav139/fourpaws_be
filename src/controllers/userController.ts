import { FeedService, UserService } from "../services/index";
import cloudinary from "../config/cloudinary";
import express, { Response, Request } from "express";

export default class userController {
  static getUser = async (req: any, res: any) => {
    try {
      const user = req["user"]["email"];
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }
      const userExists = await UserService.getUser(user);
      return res.status(200).json({
        success: true,
        user: { ...userExists, profileImage: userExists.profileImageUrl },
      });
    } catch (error) {
      console.error("Error in getUser:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  };

  static updateUser = async (req: any, res: any) => {
    try {
      const email = req.user?.email;
      const userId = req.user?.userId;

      if (!email) {
        return res
          .status(401)
          .json({ success: false, message: "User not authenticated" });
      }
      const userExists = await UserService.getUser(email);
      if (!userExists) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const { name, bio } = req.body;

      let profileImageUrl: string | undefined;
      if (req.files?.profileImage?.length) {
        const profileImage = req.files.profileImage[0];
        const mainImageDataUri = `data:${
          profileImage.mimetype
        };base64,${profileImage.buffer.toString("base64")}`;
        const mainImageUpload = await cloudinary.uploader.upload(
          mainImageDataUri,
          {
            folder: "pets",
          }
        );
        profileImageUrl = mainImageUpload.secure_url;
      }
      if (!name && !bio && !profileImageUrl) {
        return res
          .status(400)
          .json({ success: false, message: "No fields provided to update" });
      }
      const updatedUser = await UserService.updateUser(
        userId,
        name,
        bio,
        profileImageUrl
      );
      return res.status(200).json({
        success: true,
        user: { ...updatedUser, profileImage: updatedUser.profileImageUrl },
      });
    } catch (error) {
      console.error("Error in updateUser:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  };

static getUserByPostId = async (req: Request, res: Response): Promise<any> => {
    const { postId } = req.params;

    // Validate postId
    if (!postId || isNaN(Number(postId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid Post ID is required',
      });
    }

    try {
      const userData = await FeedService.getUserByPostId(Number(postId));

      if (!userData || userData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found for the given post ID',
        });
      }

      // Transform flat data into nested format
      const row = userData[0]; // Single row due to LIMIT 1
      const transformedData = {
        user_id: row.user_id,
        user_name: row.user_name,
        email: row.email,
        wallet_address: row.wallet_address,
        phone_number: row.phone_number,
        profile_image_url: row.profile_image_url,
        location: row.location,
        bio: row.bio,
        joined_at: row.joined_at,
        auth_method: row.auth_method,
        role: row.role,
        updated_at: row.updated_at,
        collectibles: row.collectible_id ? [{
          collectible_id: row.collectible_id,
          collectible_name: row.collectible_name,
          collectible_description: row.collectible_description,
          collectible_price: row.collectible_price,
          collectible_rarity: row.collectible_rarity,
          collectible_category: row.collectible_category,
          collectible_count: row.collectible_count,
          collectible_created_at: row.collectible_created_at,
          collectible_updated_at: row.collectible_updated_at,
        }] : [],
        pets: row.pet_id ? [{
          pet_id: row.pet_id,
          registration_number: row.registration_number,
          government_registered: row.government_registered,
          pet_name: row.pet_name,
          guardian_name: row.guardian_name,
          species: row.species,
          breed: row.breed,
          gender: row.gender,
          sterilized: row.sterilized,
          pet_bio: row.pet_bio,
          pet_image: row.pet_image,
          additional_images: row.additional_images,
          date_of_birth: row.date_of_birth,
          allergies: row.allergies,
          medications: row.medications,
          pet_created_at: row.pet_created_at,
          documents: row.documents,
        }] : [],
        posts: row.post_id ? [{
          post_id: row.post_id,
          post_content: row.post_content,
          post_media: row.post_media,
          post_type: row.post_type,
          post_metadata: row.post_metadata,
          post_created_at: row.post_created_at,
          post_updated_at: row.post_updated_at,
        }] : [],
      };

      return res.status(200).json({
        success: true,
        message: 'User fetched by post ID',
        data: transformedData,
      });
    } catch (error) {
      console.error('Error fetching user by post ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}
