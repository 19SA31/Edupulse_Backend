import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

export const uploadDocumentsConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      const error = new Error("Only image and PDF files are allowed") as any;
      error.code = "LIMIT_FILE_TYPE";
      cb(error, false);
    }
  },
});


export const uploadAvatarConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const error = new Error("Only image files are allowed") as any;
      error.code = "LIMIT_FILE_TYPE";
      cb(error, false);
    }
  },
});

export const uploadCourseConfig = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      const error = new Error("Invalid file type for course materials") as any;
      error.code = "LIMIT_FILE_TYPE";
      cb(error, false);
    }
  },
});


export const uploadCourseFiles = (req: Request, res: Response, next: NextFunction) => {
  uploadCourseConfig.any()(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    if (Array.isArray(req.files)) {
      const fileArray = req.files as Express.Multer.File[];
      const filesObject: { [fieldname: string]: Express.Multer.File[] } = {};
      
      fileArray.forEach((file) => {
        if (!filesObject[file.fieldname]) {
          filesObject[file.fieldname] = [];
        }
        filesObject[file.fieldname].push(file);
      });
      
      req.files = filesObject;
    }
    
    next();
  });
};

export const uploadDocuments = uploadDocumentsConfig.fields([
  { name: "avatar", maxCount: 1 },
  { name: "degree", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
]);

export const uploadAvatar = uploadAvatarConfig.single("avatar");