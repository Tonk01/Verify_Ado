import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { randomUUID } from "node:crypto";
import { promises } from "node:dns";

type CreateImageRequest = {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
    imageURL: string;
};

export async function createImage(
    request: HttpRequest,
    context: InvocationContext,
): Promise<HttpResponseInit> {
    context.log("Creating image record in Cosmos DB");

    try {
        const endpoint = process.env.COSMOS_ENDPOINT;
        const key = process.env.COSMOS_KEY;
        const databaseId = process.env.COSMOS_DATABASE
        const containerId = process.env.COSMOS_CONTAINER

        if (!endpoint || !key || !databaseId || !containerId) {
            return {
                status: 500,
                jsonBody: {
                    error: "Cosmos DB configuration is missing.",
                },
            };
        }

        const body = (await request.json()) as CreateImageRequest;

        const title = body.title?.trim();
        const imageURL = body.imageURL?.trim();
        const category = body.category?.trim() || "uncategorized";

        if (!title || !imageURL) {
            return {
                status: 400,
                jsonBody: {
                    error: "Title and imageURL are required",
                },
            };
        }

        const newImage = {
            id: randomUUID(),
            title,
            description: body.description?.trim() || "",
            tags: Array.isArray(body.tags) ? body.tags.map((tag) => tag.trim()).filter(Boolean) : [],
            category,
            imageURL,
            createdAt: new Date().toISOString(),
        };

        const client = new CosmosClient({ endpoint, key });

        const container = client.database(databaseId).container(containerId);

        const { resource } = await container.items.create(newImage);

        return {
            status: 201,
            jsonBody: resource,
        };
    } catch (error) {
        context.error("Failed to create image record", error)

        return {
            status: 500,
            jsonBody: {
                error: "Unable to create image record",
            },
        };
    }
}

app.http("createImage", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "images",
    handler: createImage,
});