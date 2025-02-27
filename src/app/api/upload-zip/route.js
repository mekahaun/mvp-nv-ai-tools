import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '1mb',
//     },
//   },
// };

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { action } = body;
  console.log("Received action:", action);

  switch (action) {
    case "initiate":
      return handleInitiate(body);
    case "getUrls":
      return handleGetUrls(body);
    case "finalize":
      return handleFinalize(body);
    default:
      console.error("Invalid action:", action);
      return Response.json({ error: "Invalid action" }, { status: 400 });
  }
}

async function handleInitiate({ fileName, fileSize }) {
  console.log("Initiating upload for:", fileName, "Size:", fileSize);
  const Key = `uploads/${uuidv4()}-${Date.now()}-${fileName}`;

  if (fileSize < CHUNK_SIZE) {
    console.log("Initiating single-part upload");
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      Key,
      ContentType: "application/pdf",
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      console.log("Single-part upload initiated, presigned URL generated");
      return Response.json({ key: Key, presignedUrl });
    } catch (error) {
      console.error("Error initiating single-part upload:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  } else {
    console.log("Initiating multipart upload");
    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      Key,
      ContentType: "application/pdf",
    });

    try {
      const { UploadId } = await s3Client.send(command);
      console.log("Multipart upload initiated, UploadId:", UploadId);
      return Response.json({ uploadId: UploadId, key: Key });
    } catch (error) {
      console.error("Error initiating multipart upload:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
}

async function handleGetUrls({ uploadId, key, partNumbers }) {
  console.log("Generating presigned URLs for parts:", partNumbers);
  try {
    const signedUrls = await Promise.all(
      partNumbers.map(async (partNumber) => {
        const command = new UploadPartCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        });
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
        console.log(`Generated presigned URL for part ${partNumber}`);
        return { partNumber, signedUrl };
      })
    );
    return Response.json({ signedUrls });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function handleFinalize({ uploadId, key, parts }) {
  console.log("Finalizing upload for key:", key, "UploadId:", uploadId);
  console.log("Parts to be finalized:", parts);

  // First, let's check what parts S3 actually has
  const listPartsCommand = new ListPartsCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
    Key: key,
    UploadId: uploadId,
  });

  try {
    const listedParts = await s3Client.send(listPartsCommand);
    console.log("Parts reported by S3:", listedParts.Parts);

    // Check if all parts are present
    const missingParts = parts.filter(
      (part) =>
        !listedParts.Parts.some(
          (listedPart) =>
            listedPart.PartNumber === part.PartNumber &&
            listedPart.ETag.replace(/"/g, "") === part.ETag.replace(/"/g, "")
        )
    );

    if (missingParts.length > 0) {
      console.error("Missing parts:", missingParts);
      return Response.json(
        { error: "Some parts are missing or have incorrect ETags" },
        { status: 400 }
      );
    }

    // If all parts are present, proceed with finalization
    const formattedParts = parts.map((part) => ({
      PartNumber: part.PartNumber,
      ETag: part.ETag,
    }));

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: formattedParts },
    });

    const data = await s3Client.send(command);
    console.log("Multipart upload finalized successfully:", data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Error finalizing multipart upload:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
