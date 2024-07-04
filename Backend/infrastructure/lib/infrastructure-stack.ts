import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from 'aws-cdk-lib/aws-iam';


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
        const searchMovies = new lambda.Function(this, "SearchMovie", {
          runtime: lambda.Runtime.PYTHON_3_9,
          handler: "searchMovie.handler",
          code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
          environment: {
              TABLE_NAME: props.dbName, // Assuming props.dbName is the DynamoDB table name
          },
          timeout: cdk.Duration.seconds(30),
      });
      
        // const movieBucket = new s3.Bucket(this, "Movie", {
        //     removalPolicy: cdk.RemovalPolicy.DESTROY,
        //     publicReadAccess: true,
        //     blockPublicAccess: {
        //         blockPublicPolicy: false,
        //         blockPublicAcls: false,
        //         ignorePublicAcls: false,
        //         restrictPublicBuckets: false,
        //     },
        //     bucketName: "cineo-movie-bucket",
        //     versioned: true,
        //     cors: [
        //         {
        //             allowedOrigins: ["*"],
        //             allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST],
        //             allowedHeaders: ["*"],
        //         },
        //     ],
        // });
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

        const getPostPresignedUrl = this.api.root.addResource("getPostUrl");
        const preSignedUrlIntegration = new apigateway.LambdaIntegration(
            getPostUrl
        );
        getPostPresignedUrl.addMethod("GET", preSignedUrlIntegration);

        const getMoviePresignedUrl = this.api.root.addResource("getMovieUrl");
        const preSignedMovieUrlIntegration = new apigateway.LambdaIntegration(
            getMovieUrl
        );
        getMoviePresignedUrl.addMethod("GET", preSignedMovieUrlIntegration);

        const getMovieWatch = this.api.root.addResource("getUrl");
        const getMovieWatchIntegration = new apigateway.LambdaIntegration(
            getMovie
        );
        getMovieWatch.addMethod("GET", getMovieWatchIntegration);

        const searchResource = this.api.root.addResource("search");
        const searchIntegration = new apigateway.LambdaIntegration(searchMovies);
        searchResource.addMethod("GET", searchIntegration);

        const table = new dynamodb.Table(this, props.dbName, {
            partitionKey: {
                name: "fileName",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
        });

        table.addGlobalSecondaryIndex({
          indexName: 'GSI1',
          partitionKey: { name: 'title', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
          indexName: 'GSI2',
          partitionKey: { name: 'actors', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'title', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        });
        
        table.addGlobalSecondaryIndex({
          indexName: 'GSI3',
          partitionKey: { name: 'directors', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'title', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
          indexName: 'GSI4',
          partitionKey: { name: 'genres', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'title', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
          indexName: 'GSI5',
          partitionKey: { name: 'description', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'title', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        });


        table.grantFullAccess(searchMovies);
        table.grantWriteData(uploadMovie);

        uploadMovie.addEnvironment("TABLE_NAME", table.tableName);
        searchMovies.addEnvironment("TABLE_NAME", table.tableName);
    }
}