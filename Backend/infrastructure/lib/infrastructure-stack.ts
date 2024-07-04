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

interface InfrastructureStackProps extends cdk.StackProps {
    bucketName: string;
    bucketID: string;
    dbName: string;
    userPoolID: string;
    clientID: string;
}

export class InfrastructureStack extends cdk.Stack {
    public readonly api: apigatewayv2.HttpApi;

    constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
        super(scope, id, props);

        const uploadMovie = new lambda.Function(this, "PutMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "uploadMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
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

        const movieBucket = new s3.Bucket(this, props.bucketID, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            publicReadAccess: true,
            blockPublicAccess: {
                blockPublicPolicy: false,
                blockPublicAcls: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
            },
            bucketName: props.bucketName,
            versioned: true,
            cors: [
                {
                    allowedOrigins: ["*"],
                    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST],
                    allowedHeaders: ["*"],
                },
            ],
        });

        uploadMovie.addEnvironment("BUCKET_NAME", movieBucket.bucketName);
        getMovie.addEnvironment("BUCKET_NAME", movieBucket.bucketName);
        getPostUrl.addEnvironment("BUCKET_NAME", movieBucket.bucketName);
        getMovieUrl.addEnvironment("BUCKET_NAME", movieBucket.bucketName);
        downloadMovie.addEnvironment("BUCKET_NAME", movieBucket.bucketName);

        movieBucket.grantPut(uploadMovie);
        movieBucket.grantPut(getPostUrl);
        movieBucket.grantRead(getMovie);
        movieBucket.grantRead(getMovieUrl);
        movieBucket.grantRead(downloadMovie);
        movieBucket.grantPublicAccess();

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

        const uploadIntegration = new HttpLambdaIntegration("UploadMovie", uploadMovie);
        const downloadIntegration = new HttpLambdaIntegration("DownloadMovie", downloadMovie);
        const preSignedUrlIntegration = new HttpLambdaIntegration("GetPostUrl", getPostUrl);
        const preSignedMovieUrlIntegration = new HttpLambdaIntegration("GetMovieUrl", getMovieUrl);
        const getMovieWatchIntegration = new HttpLambdaIntegration("GetMovie", getMovie);

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

        const table = new dynamodb.Table(this, props.dbName, {
            partitionKey: {
                name: "fileName",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        table.grantWriteData(uploadMovie);
        uploadMovie.addEnvironment("TABLE_NAME", table.tableName);
    }
}
