
import { UserService } from "../services/index";

export default class userController{
    static getUser = async (req: any, res: any) => {
        try {
            const user = req['user']['email'];
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            const userExists = await UserService.getUser(user);
            return res.status(200).json({ success: true, userExists });
        } catch (error) {
            console.error("Error in getUser:", error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
}