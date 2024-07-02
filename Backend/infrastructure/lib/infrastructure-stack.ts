import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class InfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const uploadMovie = new lambda.Function(this, "PutMovie", {
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "uploadMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });

        const getMovie = new lambda.Function(this, "GetMovie", {
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "getMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
        });
        const movieBucket = new s3.Bucket(this, "Movie", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            publicReadAccess: true,
            blockPublicAccess: {
                blockPublicPolicy: false,
                blockPublicAcls: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
            },
            bucketName: "cineo-movie-bucket",
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
        movieBucket.grantPut(uploadMovie);
        movieBucket.grantRead(getMovie);
        movieBucket.grantPublicAccess();

        const api = new apigateway.RestApi(this, "CineoApi", {
            restApiName: "Video Service",
            binaryMediaTypes: ["*/*"],
        });

        const uploadResource = api.root.addResource("upload");
        const uploadIntegration = new apigateway.LambdaIntegration(uploadMovie);
        uploadResource.addMethod("POST", uploadIntegration);

        const downloadResource = api.root.addResource("download");
        const downloadIntegration = new apigateway.LambdaIntegration(getMovie);
        downloadResource.addMethod("GET", downloadIntegration);

        const table = new dynamodb.Table(this, "MoviesTable", {
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
