import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';

export const loginUser = async (email: string, password: string) => {

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("Email doesnot exists");
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
        throw new Error("Password deosnot match");
    }
    const token = generateToken(user.email, user.password);
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser }

} 
