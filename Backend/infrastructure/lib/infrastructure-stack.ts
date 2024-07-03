import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface InfrastructureStackProps extends cdk.StackProps {
    bucketName: string;
    bucketID: string;
    dbName: string;
}

export class InfrastructureStack extends cdk.Stack {
    public readonly api: apigateway.RestApi;
    constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
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
        movieBucket.grantPut(uploadMovie);
        movieBucket.grantRead(getMovie);
        movieBucket.grantPublicAccess();

        this.api = new apigateway.RestApi(this, "CineoApi", {
            restApiName: "Video Service",
            binaryMediaTypes: ["*/*"],
        });

        const uploadResource = this.api.root.addResource("upload");
        const uploadIntegration = new apigateway.LambdaIntegration(uploadMovie);
        uploadResource.addMethod("POST", uploadIntegration);

        const downloadResource = this.api.root.addResource("download");
        const downloadIntegration = new apigateway.LambdaIntegration(getMovie);
        downloadResource.addMethod("GET", downloadIntegration);

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
