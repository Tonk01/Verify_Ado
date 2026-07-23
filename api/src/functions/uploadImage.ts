import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "node:crypto";

export async function uploadImage(
    request: HttpRequest,
    context: InvocationContext,
): Promise<HttpResponseInit> {
    context.log("Uploading image to Azure Blob Storage");

    try {
        const connectionString = process.env.STORAGE_CONNECTION_STRING?.trim();
        const containerName = process.env.STORAGE_CONTAINER;

        if (!connectionString || !containerName) {
            return {
            status: 500, 
            jsonBody: {
                error: "Blob Storage configuration is missing",
            },
        };
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("image");

    if (!(uploadedFile instanceof File)) {
        return {
            status: 400,
            jsonBody: {
                error: "An image file is required",
            },
        };
    }

    if (!uploadedFile.type.startsWith("image/")) {
        return {
            status: 400,
            jsonBody: {
                error: "Only image files are allowed.",
            },
        };
    }

    const maximumFileSize = 10 * 1024 * 1024;

    if (uploadedFile.size > maximumFileSize) {
        return {
            status: 400,
            jsonBody: {
                error: "Image must be smaller than 10 MB",
            },
        };
    }

    const extension = uploadedFile.name.includes(".") ? uploadedFile.name.split(".").pop() : "jpg";

    const blobName = `${randomUUID()}.${extension}`;
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName); 
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
            blobContentType: uploadedFile.type,
        },
    });

    return {
        status: 201,
        jsonBody: {
            imageURL: blockBlobClient.url, blobName,
        },
    }; 
    } catch (error) {
        context.error("Image upload failed", error);

        return {
            status: 500, 
            jsonBody: {
            error: "Unable to upload image",
            },
        };
    }
}

app.http("uploadImage", {
    methods: ["POST"],
    authLevel: "anonymous", 
    route: "images/upload",
    handler: uploadImage,
});