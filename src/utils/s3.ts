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

        console.log("S3 Service initialized with bucket:", bucketName);
    }

    /**
     * Upload a file to S3
     * @param folderPath - The folder path in S3 (e.g., "user_avatars/", "tutor-documents/userId/")
     * @param file - The file object from multer
     * @returns The complete S3 key path (folder + filename)
     */
    async uploadFile(folderPath: string, file: any): Promise<string> {
        const extension = path.extname(file.originalname);
        const uniqueId = crypto.randomBytes(16).toString("hex");
        const uniqueName = `${uniqueId}${extension}`;

        // Ensure folderPath ends with a slash
        const normalizedFolderPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
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
            console.log(`File uploaded: ${fullKey}`);
            return fullKey; // Return the complete key path
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }

    /**
     * Get a signed URL for a file - handles both full paths and filename+folder combinations
     * @param filePathOrName - Either full S3 key path or just filename
     * @param folder - Optional folder path (used only if filePathOrName is just a filename)
     * @param expiresIn - URL expiration time in seconds (default: 1 hour)
     * @returns A signed URL for the file
     */
    async getFile(filePathOrName: string, folder?: string, expiresIn: number = 3600): Promise<string> {
        try {
            let fullKey: string;

            // If folder is provided, treat filePathOrName as just the filename
            if (folder) {
                const normalizedFolder = folder.endsWith('/') ? folder : `${folder}/`;
                fullKey = `${normalizedFolder}${filePathOrName}`;
            } else {
                // Otherwise, treat filePathOrName as the complete S3 key
                fullKey = filePathOrName;
            }
            
            const params = {
                Bucket: this.bucketName,
                Key: fullKey,
            };
            
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(this.s3, command, { expiresIn });
            
            console.log(`Generated signed URL for: ${fullKey}`);
            return url;
        } catch (error) {
            console.error("Error generating signed URL:", error);
            throw error;
        }
    }

    /**
     * Delete a file from S3 - handles both full paths and filename+folder combinations
     * @param filePathOrName - Either full S3 key path or just filename
     * @param folder - Optional folder path (used only if filePathOrName is just a filename)
     * @returns Deletion response
     */
    async deleteFile(filePathOrName: string, folder?: string): Promise<any> {
        try {
            let fullKey: string;

            // If folder is provided, treat filePathOrName as just the filename
            if (folder) {
                const normalizedFolder = folder.endsWith('/') ? folder : `${folder}/`;
                fullKey = `${normalizedFolder}${filePathOrName}`;
            } else {
                // Otherwise, treat filePathOrName as the complete S3 key
                fullKey = filePathOrName;
            }
            
            const params = {
                Bucket: this.bucketName,
                Key: fullKey,
            };

            const command = new DeleteObjectCommand(params);
            const result = await this.s3.send(command);
            
            console.log(`File deleted successfully: ${fullKey}`);
            return result;
        } catch (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    }

    /**
     * Extract filename from a full S3 key path
     * @param fullPath - Complete S3 key path
     * @returns Just the filename
     */
    public extractFileName(fullPath: string): string {
        return fullPath.split('/').pop() || '';
    }

    /**
     * Extract folder path from a full S3 key path
     * @param fullPath - Complete S3 key path
     * @returns The folder path without filename
     */
    public extractFolderPath(fullPath: string): string {
        const parts = fullPath.split('/');
        return parts.slice(0, -1).join('/');
    }
}