import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { LoginInput } from '../validators/login.schema';

export const loginUser = async (input:LoginInput) => {
  const {email, password } = input;
    const user = await prisma.user.findUnique({
        where: {email}
    });

    if (!user) {
        throw new Error("Email doesnot exists");
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
        throw new Error("Password deosnot match");
    }
    const token = generateToken(user.id,user.email);
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser }

} 
