"use server";
import { createClient } from "@/utils/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cypto from "crypto";

const uniqueFileName = (fileName: string): string => {
    const timestamp = Date.now();
    const hash = cypto.createHash("sha256").update(fileName + timestamp).digest("hex");
    return `${hash}-${timestamp}-${fileName}`;
}

const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ""
    }
}); 

const acceptedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxFileSize = 2 * 1024 * 1024; // 2 MB

export async function getSignedURL(type: string, size: number, checksum: string, company_name: string) {
    if (!acceptedFileTypes.includes(type)) {
        return {error: "Invalid file type"};
    }
    if (size > maxFileSize) {
        return {error: "File size exceeds the limit of 2 MB"};
    }
    const supabase = await createClient();
    const { data:{user} } = await supabase.auth.getUser();
    if (!user) {
        return {error: "User not authenticated"};
    }
    const key = `company_logo/${company_name}/${uniqueFileName(user.id)}`;
    const putObject = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || "",
        Key: key, 
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checksum,
        Metadata: {
            "user-id": user.id,
            "file-type": type
        }
    });

    const signedURL = await getSignedUrl(s3Client, putObject, {
        expiresIn: 3600 // URL valid for 1 hour
    });
    if (!signedURL) {
        return {error: "Failed to generate signed URL"};
    }
    return {success: {url: signedURL, key: key, userId: user.id}};
}



