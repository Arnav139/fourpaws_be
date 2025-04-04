import express from "express"
import { getPosts, getStories,getCommentsByPostId} from "../controllers/feedController";

const router = express.Router();

router.get("/posts", getPosts)
router.get("/stories", getStories)
router.get("/posts/:postId/comments", getCommentsByPostId)

export default router;