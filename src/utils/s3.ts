import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
import * as crypto from 'crypto';
import * as path from "path";
dotenv.config();

export class S3Service {
    private s3: S3Client;
    private bucketName: string;

    constructor() {
        console.log("S3 config =>", {
  region: process.env.BUCKET_REGION,
  bucket: process.env.BUCKET_NAME,
  accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
});

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

    async uploadFile(folderPath: string, file: any) {
    const extension = path.extname(file.originalname); // get .png, .jpg etc.
    const uniqueId = crypto.randomBytes(16).toString("hex"); // 32-char random string
    const uniqueName = `${uniqueId}-avatar${extension}`; // e.g., 92fa1c...-avatar.png

    const params = {
        Bucket: this.bucketName,
        Key: `${folderPath}${uniqueName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        await this.s3.send(command);
        console.log(`File uploaded: ${folderPath}${uniqueName}`);
        return uniqueName; // Return the clean name
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

   
    async getFile(fileName: string, folder: string): Promise<string> {
        try {
            const options = {
                Bucket: this.bucketName,
                Key: `${folder}/${fileName}`,
            };
            const getCommand = new GetObjectCommand(options);
            const url = await getSignedUrl(this.s3, getCommand, { expiresIn: 60 * 60 });
            return url;
        } catch (error) {
            console.error("Error generating signed URL:", error);
            throw error;
        }
    }

    async deleteFile(key: string) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
        };

        try {
            const command = new DeleteObjectCommand(params);
            const data = await this.s3.send(command);
            console.log(`File deleted successfully from ${key}`);
            return data;
        } catch (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    }

    
    }