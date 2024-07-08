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
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';


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
        const getMovieContentUrl = new lambda.Function(this, "GetMovieContentUrl", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getMovieContentUrl.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const getPostUrl = new lambda.Function(this, "GetPostUrl", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getPostUrl.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const changeMovieData = new lambda.Function(this, "ChangeMovieData", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "changeMovieData.handler",
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
        const getPossibleSubcription = new lambda.Function(this, "GetPossibleSubcription", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getPossibleSubscriptions.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const messageDispatcher = new lambda.Function(this, "MessageDispatcher", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "messageDispatcher.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const likeMovie = new lambda.Function(this, "LikeMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "likeMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const getLikeForMovie = new lambda.Function(this, "GetLikeForMovie", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getLikeForMovie.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const getPersonalFeed = new lambda.Function(this, "GetPersonalFeed", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getPersonalFeed.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const addFeedWeights = new lambda.Function(this, "AddFeedWeights", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "addFeedWeights.handler",
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
        const getAllMovies = new lambda.Function(this, "GetAllMovies", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "getAll.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
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
        messageDispatcher.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["sns:ListTopics", "sns:Publish"],
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
        getAllMovies.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        searchMovies.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        getPersonalFeed.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);
        getMovieContentUrl.addEnvironment("BUCKET_NAME", props.movieBucket.bucketName);

        props.movieBucket.grantPut(this.uploadMovie);
        props.movieBucket.grantPut(getPostUrl);
        props.movieBucket.grantRead(getMovie);
        props.movieBucket.grantRead(getMovieUrl);
        props.movieBucket.grantRead(getMovieContentUrl);
        props.movieBucket.grantRead(downloadMovie);
        props.movieBucket.grantRead(subscribeTopic);
        props.movieBucket.grantDelete(deleteMovie);
        props.movieBucket.grantRead(deleteMovie);
        props.movieBucket.grantPublicAccess();
        props.movieBucket.grantRead(getAllMovies);
        props.movieBucket.grantRead(searchMovies);
        props.movieBucket.grantRead(getPersonalFeed);

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
                allowOrigins: ["http://localhost:4200", "https://frontend-cineo.s3.eu-central-1.amazonaws.com"],
                allowHeaders: ["Content-Type", "Authorization"],
                allowCredentials: true,
                exposeHeaders: ["*"],
            },
        });

        const uploadIntegration = new HttpLambdaIntegration("UploadMovie", this.uploadMovie);
        const downloadIntegration = new HttpLambdaIntegration("DownloadMovie", downloadMovie);
        const preSignedUrlIntegration = new HttpLambdaIntegration("GetPostUrl", getPostUrl);
        const preSignedMovieUrlIntegration = new HttpLambdaIntegration("GetMovieUrl", getMovieUrl);
        const getMovieUrlIntegration = new HttpLambdaIntegration("GetMovieUrl", getMovieContentUrl);
        const getMovieWatchIntegration = new HttpLambdaIntegration("GetMovie", getMovie);
        const changeMovieDataIntegration = new HttpLambdaIntegration(
            "ChangeMovieDate",
            changeMovieData
        );
        const searchIntegration = new HttpLambdaIntegration("Search", searchMovies);
        const deleteMovieIntegration = new HttpLambdaIntegration("Delete", deleteMovie);
        const subscribeTopicIntegration = new HttpLambdaIntegration("Subscribe", subscribeTopic);
        const getAllMoviesIntegration = new HttpLambdaIntegration("GetAllMovies", getAllMovies);
        const likeMovieIntegration = new HttpLambdaIntegration("LikeMovie", likeMovie);
        const getLikeForMovieIntegration = new HttpLambdaIntegration(
            "GetLikeForMovie",
            getLikeForMovie
        );
        const getPersonalFeedIntegration = new HttpLambdaIntegration("GetPersonalFeed", getPersonalFeed);

        const unsubscribeTopicIntegration = new HttpLambdaIntegration(
            "Unsubscribe",
            unsubscribeTopic
        );
        const getSubscriptionIntegration = new HttpLambdaIntegration(
            "GetSubscription",
            getSubcription
        );
        const getPossibleSubcriptionIntegration = new HttpLambdaIntegration(
            "GetPossibleSubcription",
            getPossibleSubcription
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
            path: "/getMovieContentUrl",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getMovieUrlIntegration,
            authorizer: httpAuthorizer,
        });

        this.api.addRoutes({
            path: "/getMovie",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getMovieWatchIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getLikeForMovie",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getLikeForMovieIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/changeMovieData",
            methods: [apigatewayv2.HttpMethod.PUT],
            integration: changeMovieDataIntegration,
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
            path: "/likeMovie",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: likeMovieIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getPersonalFeed",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getPersonalFeedIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/unsubscribe",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: unsubscribeTopicIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getSubscription",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getSubscriptionIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getAllMovies",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getAllMoviesIntegration,
            authorizer: httpAuthorizer,
        });
        this.api.addRoutes({
            path: "/getPossibleSubcription",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: getPossibleSubcriptionIntegration,
            authorizer: httpAuthorizer,
        });
        const table = new dynamodb.Table(this, "MoviesTable", {
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            stream: dynamodb.StreamViewType.NEW_IMAGE,
        });

        table.grantWriteData(this.uploadMovie);
        table.grantFullAccess(deleteMovie);
        table.grantFullAccess(getAllMovies);
        table.grantReadData(getMovieContentUrl);

        this.uploadMovie.addEnvironment("TABLE_NAME", table.tableName);
        getAllMovies.addEnvironment("TABLE_NAME", table.tableName);
        deleteMovie.addEnvironment("TABLE_NAME", table.tableName);
        getPersonalFeed.addEnvironment("MOVIE_TABLE_NAME", table.tableName);
        getMovieContentUrl.addEnvironment("TABLE_NAME", table.tableName);

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
        table.grantReadData(getPersonalFeed);
        table.grantFullAccess(searchMovies);
        table.grantWriteData(this.uploadMovie);
        table.grantReadData(getMovie);
        table.grantReadData(getMovieUrl);
        table.grantStreamRead(messageDispatcher);
        table.grantReadWriteData(changeMovieData);
        table.grantReadData(getPossibleSubcription);

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
        getMovie.addEnvironment("TABLE_NAME", table.tableName);
        getMovieUrl.addEnvironment("TABLE_NAME", table.tableName);
        changeMovieData.addEnvironment("TABLE_NAME", table.tableName);
        getPossibleSubcription.addEnvironment("TABLE_NAME", table.tableName);

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

        const tableMovieLike = new dynamodb.Table(this, "MovieLikesTable", {
            partitionKey: { name: "userID", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "movieID", type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        likeMovie.addEnvironment("TABLE_NAME", tableMovieLike.tableName);
        getLikeForMovie.addEnvironment("TABLE_NAME", tableMovieLike.tableName);

        tableMovieLike.grantReadWriteData(likeMovie);


        const tableFeed = new dynamodb.Table(this, "Feed", {
            partitionKey: { name: "userID", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "type", type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        tableFeed.grantReadWriteData(getMovieUrl);
        tableFeed.grantReadWriteData(subscribeTopic);
        tableFeed.grantReadWriteData(unsubscribeTopic);
        tableFeed.grantReadWriteData(likeMovie);
        tableFeed.grantReadWriteData(addFeedWeights);

        getMovieUrl.addEnvironment("FEED_TABLE_NAME", tableFeed.tableName);
        subscribeTopic.addEnvironment("FEED_TABLE_NAME", tableFeed.tableName);
        unsubscribeTopic.addEnvironment("FEED_TABLE_NAME", tableFeed.tableName);
        likeMovie.addEnvironment("FEED_TABLE_NAME", tableFeed.tableName);
        tableMovieLike.grantReadData(getLikeForMovie);
        addFeedWeights.addEnvironment("FEED_TABLE_NAME", tableFeed.tableName);

        const map = new sfn.Map(this, 'Map State', {
            maxConcurrency: 3,
            itemsPath: sfn.JsonPath.stringAt('$.inputForMap'),
        });

        const lambdaInvoke = new sfnTasks.LambdaInvoke(this, 'Invoke Lambda ', {
            lambdaFunction: addFeedWeights,
            timeout: cdk.Duration.seconds(900),
        });

        map.itemProcessor(lambdaInvoke);

        const startState = new sfn.Pass(this, 'Start State ');

        const definition = startState.next(map);

        const stateMachine = new sfn.StateMachine(this, 'StateMachineForFeed', {
            definition: definition,
            timeout: cdk.Duration.minutes(5),
        });

        const stepFunctionForFeedInvoker = new lambda.Function(this, "StepFunctionForFeedInvoker", {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: "stepFunctionForFeedInvoker.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(30),
        });
        const sqsQueue = new sqs.Queue(this, "MyQueue");

        sqsQueue.grantSendMessages(subscribeTopic);
        subscribeTopic.addEnvironment("QUEUE_URL",sqsQueue.queueUrl);

        sqsQueue.grantSendMessages(unsubscribeTopic);
        unsubscribeTopic.addEnvironment("QUEUE_URL",sqsQueue.queueUrl);
        
        sqsQueue.grantSendMessages(likeMovie);
        likeMovie.addEnvironment("QUEUE_URL",sqsQueue.queueUrl);

        sqsQueue.grantSendMessages(getMovieUrl);
        getMovieUrl.addEnvironment("QUEUE_URL",sqsQueue.queueUrl);


        stepFunctionForFeedInvoker.addEnvironment("STATE_MACHINE_ARN", stateMachine.stateMachineArn);
        stateMachine.grantStartExecution(stepFunctionForFeedInvoker);

        stepFunctionForFeedInvoker.addEventSource(new lambdaEventSources.SqsEventSource(sqsQueue));


    }
}
