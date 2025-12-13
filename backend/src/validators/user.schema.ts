import z from "zod";

export const registerSchema = z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters long").max(50, "First name is too long"),
    lastName: z.string().trim().max(50, "Last Name is too long").min(2, "Last name must be at least 2 characters long"),
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(6, "Your password must be 6 character long").regex(/(?=.*[a-z])/, "Password must contain at least 1 lowercase letter")
        .regex(/(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter")
        .regex(/(?=.*\d)/, "Password must contain at least 1 number")
        .regex(
            /(?=.*[!@#$%^&*(),.?":{}|<>_\-\/\\])/,
            "Password must contain at least 1 special character"
        ),
     language: z.string().trim()
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>