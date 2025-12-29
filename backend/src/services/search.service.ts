import { prisma } from "../utils/prisma";

export const findUser = async (userName: string) => {
    try {
        if (userName.trim() === "") {
            throw new Error("Please provide the userName");

        }
        const user = await prisma.user.findMany({
            where: {
                username: {
                    contains: userName,
                    mode: "insensitive",
                },
            },
            select: {username: true, id: true},
            take: 4,
        })
        console.log(user);
        return user;
    } catch (error: any) {
        console.log("errr is", error.message);
        throw new Error(error.message);

    }

}