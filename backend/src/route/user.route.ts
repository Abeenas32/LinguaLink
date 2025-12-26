import { RegisterInput, registerSchema } from './../validators/user.schema';
import { registerUser } from '../controller/user.controller';
import { Router } from "express";
import { validate } from '../middleware/validator';
import { getUsers } from '../controller/search.controller';

 

const router = Router();
router.post("/register",validate(registerSchema),registerUser);
router.get("/search",getUsers);
export default router;