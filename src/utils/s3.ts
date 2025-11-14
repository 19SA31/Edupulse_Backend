import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import * as crypto from "crypto";
import * as path from "path";

dotenv.config();

export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor() {
    const bucketName = process.env.BUCKET_NAME!;
    const bucketRegion = process.env.BUCKET_REGION!;
    const accessKeyId = process.env.BUCKET_ACCESS_KEY_ID!;
    const secretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY!;

    if (!bucketName || !bucketRegion || !accessKeyId || !secretAccessKey) {
      throw new Error("Missing required environment variables for AWS S3.");
    }

    this.bucketName = bucketName;

    this.s3 = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: bucketRegion,
    });
  }

  async uploadFile(folderPath: string, file: any): Promise<string> {
    const extension = path.extname(file.originalname);
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const uniqueName = `${uniqueId}${extension}`;

    const normalizedFolderPath = folderPath.endsWith("/")
      ? folderPath
      : `${folderPath}/`;
    const fullKey = `${normalizedFolderPath}${uniqueName}`;

    const params = {
      Bucket: this.bucketName,
      Key: fullKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3.send(command);
      return fullKey;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async getFile(
    filePathOrName: string,
    folder?: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      let fullKey: string;

      if (folder) {
        const normalizedFolder = folder.endsWith("/") ? folder : `${folder}/`;
        fullKey = `${normalizedFolder}${filePathOrName}`;
      } else {
        fullKey = filePathOrName;
      }

      const params = {
        Bucket: this.bucketName,
        Key: fullKey,
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3, command, { expiresIn });

      return url;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }

  async deleteFile(filePathOrName: string, folder?: string): Promise<any> {
    try {
      let fullKey: string;

      if (folder) {
        const normalizedFolder = folder.endsWith("/") ? folder : `${folder}/`;
        fullKey = `${normalizedFolder}${filePathOrName}`;
      } else {
        fullKey = filePathOrName;
      }

      const params = {
        Bucket: this.bucketName,
        Key: fullKey,
      };

      const command = new DeleteObjectCommand(params);
      const result = await this.s3.send(command);

      return result;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  public extractFileName(fullPath: string): string {
    return fullPath.split("/").pop() || "";
  }

  public extractFolderPath(fullPath: string): string {
    const parts = fullPath.split("/");
    return parts.slice(0, -1).join("/");
  }
}
