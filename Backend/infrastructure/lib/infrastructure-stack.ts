import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambdaAuthorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as iam from "aws-cdk-lib/aws-iam";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";

interface InfrastructureStackProps extends cdk.StackProps {
    bucketName: string;
    bucketID: string;
    dbName: string;
    userPoolID: string;
    clientID: string;
    movieBucket: s3.Bucket;
}

export class InfrastructureStack extends cdk.Stack {
    public readonly api: apigatewayv2.HttpApi;
    public readonly uploadMovie: lambda.Function;
    constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
        super(scope, id, props);

        this.uploadMovie = new lambda.Function(this, "PutMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "uploadMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(300),
        });

        const getMovie = new lambda.Function(this, "GetMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const downloadMovie = new lambda.Function(this, "DownloadMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "downloadMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const getMovieUrl = new lambda.Function(this, "GetMovieUrl", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getMovieUrl.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const getPostUrl = new lambda.Function(this, "GetPostUrl", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getPostUrl.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const deleteMovie = new lambda.Function(this, "DeleteMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "deleteMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const subscribeTopic = new lambda.Function(this, "SubscribeTopic", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "subscribeTopic.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const unsubscribeTopic = new lambda.Function(this, "UnsubscribeTopic", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "unsubscribeTopic.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const getSubcription = new lambda.Function(this, "GetSubcriptionTopic", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getSubscription.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const messageDispatcher = new lambda.Function(this, "MessageDispatcher", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "messageDispatcher.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const searchMovies = new lambda.Function(this, "SearchMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "searchMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            environment: {
                TABLE_NAME: props.dbName,
            },
            timeout: cdk.Duration.seconds(30),
        });

        subscribeTopic.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["sns:CreateTopic", "sns:ListTopics", "SNS:Subscribe"],
                resources: ["*"],
            })
        );
        unsubscribeTopic.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    "sns:CreateTopic",
                    "sns:ListTopics",
                    "SNS:Unsubscribe",
                    "sns:ListSubscriptionsByTopic",
                ],
                resources: ["*"],
            })
        );

        this.uploadMovie.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        getMovie.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        getPostUrl.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        getMovieUrl.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        downloadMovie.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        deleteMovie.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        subscribeTopic.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);

        props.movieBucket.grantPut(this.uploadMovie);
        props.movieBucket.grantPut(getPostUrl);
        props.movieBucket.grantRead(getMovie);
        props.movieBucket.grantRead(getMovieUrl);
        props.movieBucket.grantRead(downloadMovie);
        props.movieBucket.grantRead(subscribeTopic);
        props.movieBucket.grantDelete(deleteMovie);
        props.movieBucket.grantPublicAccess();

        const authorizerLayer = new lambda.LayerVersion(this, "AuthorizerLayer", {
            code: lambda.Code.fromAsset(path.join(__dirname, "../layer", "authorizer.zip")),
            compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
        });
        const authLambda = new lambda.Function(this, "AuthLambda", {
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            handler: "auth.handler",
            runtime: lambda.Runtime.NODEJS_18_X,
            layers: [authorizerLayer],
            environment: {
                USER_POOL_ID: props.userPoolID,
                CLIENT_ID: props.clientID,
            },
        });
        const httpAuthorizer = new lambdaAuthorizers.HttpLambdaAuthorizer(
            "HttpLambdaAuthorizer",
            authLambda,
            {
                responseTypes: [lambdaAuthorizers.HttpLambdaResponseType.SIMPLE],
            }
        );

        this.api = new apigatewayv2.HttpApi(this, "MoviesApi", {
            apiName: "MoviesApi",
            corsPreflight: {
                allowMethods: [
                    apigatewayv2.CorsHttpMethod.GET,
                    apigatewayv2.CorsHttpMethod.DELETE,
                    apigatewayv2.CorsHttpMethod.PUT,
                    apigatewayv2.CorsHttpMethod.POST,
                    apigatewayv2.CorsHttpMethod.OPTIONS,
                ],
                allowOrigins: ["http://localhost:4200"],
                allowHeaders: ["Content-Type", "Authorization"],
                allowCredentials: true,
                exposeHeaders: ["*"],
            },
        });

        const uploadIntegration = new HttpLambdaIntegration("UploadMovie", this.uploadMovie);
        const downloadIntegration = new HttpLambdaIntegration("DownloadMovie", downloadMovie);
        const preSignedUrlIntegration = new HttpLambdaIntegration("GetPostUrl", getPostUrl);
        const preSignedMovieUrlIntegration = new HttpLambdaIntegration("GetMovieUrl", getMovieUrl);
        const getMovieWatchIntegration = new HttpLambdaIntegration("GetMovie", getMovie);
        const searchIntegration = new HttpLambdaIntegration("Search", searchMovies);
        const deleteMovieIntegration = new HttpLambdaIntegration("Delete", deleteMovie);
        const subscribeTopicIntegration = new HttpLambdaIntegration("Subscribe", subscribeTopic);
        const unsubscribeTopicIntegration = new HttpLambdaIntegration(
            "Unsubscribe",
            unsubscribeTopic
        );
        const getSubscriptionIntegration = new HttpLambdaIntegration(
            "GetSubscription",
            getSubcription
        );

        this.api.addRoutes({
            path: "/upload",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: uploadIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/download",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: downloadIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getPostUrl",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: preSignedUrlIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getMovieUrl",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: preSignedMovieUrlIntegration,
            authorizer: httpAuthorizer,
        });

        this.api.addRoutes({
            path: "/getMovie",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getMovieWatchIntegration,
            authorizer: httpAuthorizer,
        });

        this.api.addRoutes({
            path: "/search",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: searchIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/delete",
            methods: [apigatewayv2.HttpMethod.DELETE],
            integration: deleteMovieIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/subscribe",
            methods: [apigatewayv2.HttpMethod.PUT],
            integration: subscribeTopicIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/unsubscribe",
            methods: [apigatewayv2.HttpMethod.DELETE],
            integration: unsubscribeTopicIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getSubscription",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getSubscriptionIntegration,
            authorizer: httpAuthorizer,
        });
        const table = new dynamodb.Table(this, "MoviesTable", {
            partitionKey: {
                name: "fileName",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            stream: dynamodb.StreamViewType.NEW_IMAGE,
        });

        table.grantWriteData(this.uploadMovie);
        table.grantFullAccess(deleteMovie);

        this.uploadMovie.addEnvironment("TABLE_NAME", table.tableName);
        deleteMovie.addEnvironment("TABLE_NAME", table.tableName);

        table.addGlobalSecondaryIndex({
            indexName: "GSI1",
            partitionKey: { name: "title", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
            indexName: "GSI2",
            partitionKey: { name: "actors", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "title", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
            indexName: "GSI3",
            partitionKey: { name: "directors", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "title", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
            indexName: "GSI4",
            partitionKey: { name: "genres", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "title", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
            indexName: "GSI5",
            partitionKey: { name: "description", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "title", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        table.grantFullAccess(searchMovies);
        table.grantWriteData(this.uploadMovie);
        table.grantStreamRead(messageDispatcher);

        messageDispatcher.addEventSource(
            new eventsources.DynamoEventSource(table, {
                startingPosition: lambda.StartingPosition.TRIM_HORIZON,
                batchSize: 5,
                bisectBatchOnError: true,
                retryAttempts: 10,
            })
        );

        this.uploadMovie.addEnvironment("TABLE_NAME", table.tableName);
        searchMovies.addEnvironment("TABLE_NAME", table.tableName);

        const tableSubscribeTopic = new dynamodb.Table(this, "SubscribeTable", {
            partitionKey: { name: "userID", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "email", type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        subscribeTopic.addEnvironment("TABLE_NAME", tableSubscribeTopic.tableName);
        unsubscribeTopic.addEnvironment("TABLE_NAME", tableSubscribeTopic.tableName);
        getSubcription.addEnvironment("TABLE_NAME", tableSubscribeTopic.tableName);
        messageDispatcher.addEnvironment("TABLE_NAME", tableSubscribeTopic.tableName);
        tableSubscribeTopic.grantReadData(messageDispatcher);
        tableSubscribeTopic.grantReadWriteData(subscribeTopic);
        tableSubscribeTopic.grantReadWriteData(unsubscribeTopic);
        tableSubscribeTopic.grantReadData(getSubcription);
    }
}
