import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

export async function getImages(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Retrieving images from Cosmos DB");

    try {
        const endpoint = process.env.COSMOS_ENDPOINT;
        const key = process.env.COSMOS_KEY;
        const databaseId = process.env.COSMOS_DATABASE;
        const containerId = process.env.COSMOS_CONTAINER;

        if (!endpoint || !key || !databaseId || !containerId) {
            return {
                status: 500,
                jsonBody: {
                    error: "Cosmos DB configuration is missing.",
                },
            };
        }

        const client = new CosmosClient({
            endpoint, 
            key,
        });

        const container = client.database(databaseId).container(containerId);

        const { resources } = await container.items.query({ query: `SELECT c.id, c.title, c.description, c.tags, c.category, c.imageURLs from c`,}).fetchAll();

        return {
            status: 200,
            jsonBody: resources,
        };
    } catch (error) {
        context.error("Failed to retrive images.", error);

        return {
            status: 500,
            jsonBody: {
                error: "Unable to retrive images.",
            },
        };
    }
}

app.http('getImages', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "images",
    handler: getImages
});
