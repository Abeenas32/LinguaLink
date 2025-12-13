import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { RegisterInput } from "../validators/user.schema";
import sanitize from "sanitize-html";

export const createUser = async (input: RegisterInput) => {
    try {
        const firstName = sanitize(input.firstName);
        const lastName = sanitize(input.lastName);
        const email = sanitize(input.email);
        const language = sanitize(input.language);
        const hasedPassword = await bcrypt.hash(input.password, 12);

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,  
         }});
                if(existingUser) {
                    throw new Error("User with this email already exists");
                }

       const user  = await prisma.user.create({
        data: {
             firstName,
             lastName,
             language,
             email,
             password: hasedPassword,
             username : email.split("@")[0],
        },
       });
       const { password, ...safeUser} = user;
       return safeUser;

    } catch (error: any) {
         throw new Error(error.message);
}
}