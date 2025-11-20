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
        const hasedPassword = await bcrypt.hash(input.password, 12);

       const user  = await prisma.user.create({
        data: {
             firstName,
             lastName,
             email,
             password: hasedPassword,
             username : email.split("@")[0],
        },
       });
       const { password, ...safeUser} = user;
       return safeUser;

    } catch (error: any) {
        if(error instanceof Prisma.PrismaClientKnownRequestError) {
           throw error;
           
    }
}
}