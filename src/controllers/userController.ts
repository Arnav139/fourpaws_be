
import { UserService } from "../services/index";
import  cloudinary  from "../config/cloudinary";

export default class userController{
    static getUser = async (req: any, res: any) => {
        try {
            const user = req['user']['userId'];
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            const userExists = await UserService.getUser("",user);
            return res.status(200).json({ success: true, userExists });
        } catch (error) {
            console.error("Error in getUser:", error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    static updateUser = async (req: any, res: any) => {
        try {
            const userId = req.user?.userId;
    
            if (!userId) {
                return res.status(401).json({ success: false, message: "User not authenticated" });
            }
    
            const userExists = await UserService.getUser("", userId);
            if (!userExists) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
    
            const { userName, bio } = req.body;
    
            let profileImageUrl: string | undefined;
    
            if (req.files?.profileImage?.length) {
                const profileImage = req.files.profileImage[0];
                const mainImageDataUri = `data:${profileImage.mimetype};base64,${profileImage.buffer.toString("base64")}`;
                const mainImageUpload = await cloudinary.uploader.upload(mainImageDataUri, {
                    folder: "pets",
                });
                profileImageUrl = mainImageUpload.secure_url;
            }
    
            if (!userName && !bio && !profileImageUrl) {
                return res.status(400).json({ success: false, message: "No fields provided to update" });
            }
    
            const updatedUser = await UserService.updateUser(userId, userName, bio, profileImageUrl);
    
            return res.status(200).json({ success: true, updatedUser });
    
        } catch (error) {
            console.error("Error in updateUser:", error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    };
    
}