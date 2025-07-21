import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const secret_key = process.env.JWT_SECRET as string;

// Extend Request interface to include user info
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const createToken = (id: string, email: string, role: string): string => {
  return jwt.sign({ id, email, role }, secret_key, { expiresIn: "30m" });
};

const verifyToken = (requiredRole: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const accessToken: string = req.cookies.AccessToken;

      if (accessToken) {
        jwt.verify(accessToken, secret_key, async (err, decoded) => {
          if (err) {
            await handleRefreshToken(req, res, next);
          } else {
            const { id, email, role } = decoded as jwt.JwtPayload;

            if (role !== requiredRole) {
              return res.status(401).json({
                message: `Access denied. Insufficient role. Expected ${requiredRole}.`,
              });
            }

            // 🔥 ADD USER INFO TO REQUEST OBJECT
            req.user = {
              id: id,
              email: email,
              role: role
            };

            next();
          }
        });
      } else {
        await handleRefreshToken(req, res, next);
      }
    } catch (error) {
      res
        .status(401)
        .json({ message: "Access denied. Access token not valid." });
    }
  };
};

const handleRefreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const refreshToken: string = req.cookies.RefreshToken;
  if (refreshToken) {
    jwt.verify(refreshToken, secret_key, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Access denied. Refresh token not valid." });
      } else {
        const { id, email, role } = decoded as jwt.JwtPayload;
        if (!id || !role) {
          return res
            .status(401)
            .json({ message: "Access denied. Token payload invalid." });
        } else {
          const newAccessToken = createToken(id, email, role);
          res.cookie("AccessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
          });

          
          req.user = {
            id: id,
            email: email,
            role: role
          };

          next();
        }
      }
    });
  } else {
    return res
      .status(401)
      .json({ message: "Access denied. Refresh token not provided." });
  }
};

export { createToken, verifyToken };