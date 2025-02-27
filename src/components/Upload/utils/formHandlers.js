import axios from "axios";
import { createHash } from "crypto";
import SparkMD5 from 'spark-md5';

export async function initiateUpload(fileName, fileSize) {
  const { data } = await axios.post("/api/upload-zip", {
    action: "initiate",
    fileName,
    fileSize,
  });
  console.log("Initiate upload response:", data);
  return data;
}

export async function getPresignedUrls(uploadId, key, partNumbers) {
  const { data } = await axios.post("/api/upload-zip", {
    action: "getUrls",
    uploadId,
    key,
    partNumbers,
  });
  console.log("Presigned URLs response:", data);
  return data.signedUrls;
}

export async function finalizeMultipartUpload(uploadId, key, parts) {
  console.log("Finalizing upload with parts:", parts);
  const { data } = await axios.post("/api/upload-zip", {
    action: "finalize",
    uploadId,
    key,
    parts,
  });
  console.log("Finalize upload response:", data);
  return data;
}

export async function uploadPart(presignedUrl, part, partNumber, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Uploading part ${partNumber}, attempt ${i + 1}`);
      const response = await axios.put(presignedUrl, part, {
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      console.log(`Part ${partNumber} uploaded successfully, Response:`, response);
      
      // Generate ETag locally
      const spark = new SparkMD5.ArrayBuffer();
      const arrayBuffer = await part.arrayBuffer();
      spark.append(arrayBuffer);
      const md5 = spark.end();
      const localETag = `"${md5}"`;
      console.log(`Generated local ETag for part ${partNumber}:`, localETag);
      
      return localETag;
    } catch (error) {
      console.error(`Error uploading part ${partNumber}, attempt ${i + 1}:`, error);
      if (i === retries - 1) throw error;
    }
  }
}
