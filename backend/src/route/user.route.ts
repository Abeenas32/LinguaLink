import { RegisterInput, registerSchema } from './../validators/user.schema';
import { registerUser } from '../controller/user.controller';
import { Router } from "express";
import { validate } from '../middleware/validator';

 

const router = Router();
router.post("/register",validate(registerSchema),registerUser)
export default router;