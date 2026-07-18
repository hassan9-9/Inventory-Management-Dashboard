import { Router } from "express";
import { getUsers, deleteUser, updateUser } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router;
