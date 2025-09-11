import { Request, Response, NextFunction } from "express";
import HTTP_statusCode from "../enums/HttpStatusCode";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const createAuthMiddleware = (
  role: "user" | "tutor",
  service: {
    ensureUserActive?: (id: string) => Promise<void>;
    ensureTutorActive?: (id: string) => Promise<void>;
  }
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_statusCode.Unauthorized).json({
          message: "Unauthorized: Authentication required",
          shouldLogout: true
        });
        return;
      }

      const { id, role: userRole } = req.user;

      if (userRole !== role) {
        res.status(HTTP_statusCode.NoAccess).json({
          message: "Access denied: Invalid role",
          shouldLogout: true
        });
        return;
      }

      if (role === "user" && service.ensureUserActive) {
        await service.ensureUserActive(id);
      } else if (role === "tutor" && service.ensureTutorActive) {
        await service.ensureTutorActive(id);
      }

      next();
    } catch (error: any) {
      let statusCode = HTTP_statusCode.NoAccess;
      let shouldLogout = true;
      let message = error.message || "Access denied";

      if (error.message?.includes("not found")) {
        statusCode = HTTP_statusCode.NotFound;
        message = "Account not found";
      } else if (error.message?.includes("blocked")) {
        statusCode = HTTP_statusCode.NoAccess;
        message = "Your account has been blocked. Please contact support.";
      }

      res.status(statusCode).json({
        message,
        shouldLogout,
        reason: error.message?.includes("blocked") ? "blocked" : 
                error.message?.includes("not found") ? "not_found" : "access_denied"
      });
    }
  };
};