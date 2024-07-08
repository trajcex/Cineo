const { CognitoJwtVerifier } = require("aws-jwt-verify");

const mapGroupsToPaths = [
    { path: "GET /getMovieUrl", group: ["admin", "guest"]},
    { path: "GET /getPostUrl", group: ["admin"] },
    { path: "POST /upload", group: ["admin"] },
    { path: "GET /preview-url", group: ["admin"] },
    { path: "GET /download", group: ["admin", "guest"] },
    { path: "DELETE /delete", group: ["admin"] },
    { path: "GET /getMovie", group: ["admin", "guest"] },
    { path: "GET /getMovieUrl", group: ["admin", "guest"] },
    { path: "PUT /changeMovieData", group: ["admin"] },
    { path: "GET /getPossibleSubcription", group: ["guest"] },
    { path: "GET /getSubscription", group: ["guest"] },
    { path: "POST /unsubscribe", group: ["guest"] },
    { path: "PUT /subscribe", group: ["guest"] },
    { path: "GET /getAllMovies", group: ["admin", "guest"] },
    { path: "POST /likeMovie", group: ["guest"] },
    { path: "GET /getLikeForMovie", group: ["guest"] },
    { path: "GET /getMovieContentUrl", group: ["admin","guest"] },
    { path: "GET /getThumbnailUrl", group: ["admin"] },
    { path: "GET /getPersonalFeed", group: ["guest","admin"] },
];

function generatePolicy(principalId) {
    return {
        isAuthorized: true,
        context: { user: principalId },
    };
}

exports.handler = async function (event) {
    console.log("Event:", JSON.stringify(event));

    const requestPath = event.routeKey;
    console.log("Request path:", requestPath);

    const existingPaths = mapGroupsToPaths.map((config) => config.path);

    if (!existingPaths.includes(requestPath)) {
        console.log("Invalid path");
        return {
            statusCode: 403,
            isAuthorized: false,
            body: JSON.stringify({ message: "Invalid path" }),
        };
    }

    const authHeader = event.headers.authorization;
    console.log("Auth Header:", authHeader);

    if (!authHeader) {
        console.log("No auth header");
        return {
            statusCode: 401,
            isAuthorized: false,
            body: JSON.stringify({ message: "No authorization header found" }),
        };
    }

    const token = authHeader.split(" ")[1];

    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.CLIENT_ID;
    console.log("Token: ", token);
    const verifier = CognitoJwtVerifier.create({
        userPoolId: userPoolId,
        tokenUse: "access",
        clientId: clientId,
    });

    let payload;
    try {
        payload = await verifier.verify(token);
        console.log("Token is valid. Payload:", payload);
    } catch (error) {
        console.log("Token not valid!", error);
        return {
            statusCode: 401,
            isAuthorized: false,
            body: JSON.stringify({ message: "Invalid token" }),
        };
    }

    const matchingPathConfig = mapGroupsToPaths.find((config) => requestPath === config.path);
    const userGroups = payload["cognito:groups"];
    for (const element of userGroups) {
        for (const group of matchingPathConfig.group) {
            if (element == group) {
                return generatePolicy(payload.sub);
            }
        }
    }
    // if (userGroups.includes(matchingPathConfig.group)) {
    //     console.log(generatePolicy(payload.sub));
    //     return generatePolicy(payload.sub);
    // }

    return {
        statusCode: 403,
        isAuthorized: false,
        body: JSON.stringify({ message: "User not authorized" }),
    };
};
