import { Request, Response, NextFunction } from "express";

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
        res.status(401).json({
          message: "Unauthorized: Authentication required",
          shouldLogout: true
        });
        return;
      }

      const { id, role: userRole } = req.user;

      if (userRole !== role) {
        res.status(403).json({
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
      let statusCode = 403;
      let shouldLogout = true;
      let message = error.message || "Access denied";

      if (error.message?.includes("not found")) {
        statusCode = 404;
        message = "Account not found";
      } else if (error.message?.includes("blocked")) {
        statusCode = 403;
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