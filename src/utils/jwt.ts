import jwt, { JwtPayload } from "jsonwebtoken";

const accessToken = process.env.ACCESS_TOKEN_SECRET!;
const expiresOn = "1h";


 export const generateToken = (userId: string, email: string) => {
    return jwt.sign({ userId, email }, accessToken, { algorithm: "HS256", expiresIn: expiresOn });
};
 
export const verifyToken = (token : string) : JwtPayload | null  =>  {
      try {
         return jwt.verify(token, accessToken) as JwtPayload;
      } catch (error) {
        return null ; 
      }
}

