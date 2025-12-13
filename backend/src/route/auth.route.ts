import { Router } from "express"; 
import { login } from "../controller/login.controller";
import { loginSchema } from "../validators/login.schema";
import { validate } from "../middleware/validator";

const router = Router ();

router.post("/login",validate(loginSchema), login);

export default router ;