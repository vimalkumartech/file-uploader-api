import type { NextApiRequest, NextApiResponse } from "next";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import multer from "multer";
import intoStream from "into-stream";

// Constants for multer buffer size configurations
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = {
  bufferSize: 4 * ONE_MEGABYTE, // Size of buffer for each uploaded chunk
  maxBuffers: 20, // Maximum number of buffers used during upload
};

// Configure multer for in-memory storage, which stores files as buffers
const upload = multer({ storage: multer.memoryStorage() });
// Multer middleware to handle 'files' array with up to 10 files
const uploadHandler = upload.array("files", 10);

// Disable the default Next.js body parser to allow multer to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export const getBlobService = async (): Promise<
  BlobServiceClient | undefined
> => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;

  if (!accountName || !accountKey) {
    console.error(`Azure storage account information is not set.`);
    return;
  }

  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    return new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
  } catch (error) {
    console.error(`Failed to create BlobServiceClient. Error: ${error}`);
    return;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return new Promise<void>((resolve) => {
      uploadHandler(req as any, res as any, async (err: any) => {
        if (err) {
          res.status(500).json({ error: "File upload error." });
          return resolve();
        }

        const containerName = process.env
          .AZURE_STORAGE_CONTAINER_NAME as string;

        if (!containerName) {
          res.status(500).json({
            message: `Azure storage container name is not set.`,
          });
          return resolve();
        }

        const files = (req as any).files as Express.Multer.File[];
        if (!files || files.length === 0) {
          res.status(400).json({ error: "No files provided." });
          return resolve();
        }

        // Get the blob service
        const blobService = await getBlobService();

        if (!blobService) {
          res.status(500).json({
            message: `Failed to get blob service`,
          });
          return resolve();
        }

        // Get the container client
        const containerClient = blobService.getContainerClient(containerName);

        // Upload files one by one or in parallel using Promise.all
        const uploadPromises = files.map((file) => {
          const blobName = file.originalname;
          const stream = intoStream(file.buffer);
          console.log(`Uploading ${blobName} to Azure Blob storage...`);

          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          return blockBlobClient.uploadStream(
            stream,
            uploadOptions.bufferSize,
            uploadOptions.maxBuffers,
            {
              blobHTTPHeaders: { blobContentType: file.mimetype },
            }
          );
        });

        try {
          await Promise.all(uploadPromises);
          res.status(200).json({
            message: `${files.length} files uploaded to Azure Blob storage.`,
          });
          return resolve();
        } catch (uploadError: any) {
          res.status(500).json({ error: uploadError.message });
          return resolve();
        }
      });
    });
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
