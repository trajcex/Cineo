#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { CognitoStack } from "../lib/cognito-statck";
import { ContentTranscoderStack } from "../lib/contentTranscoder-stack";
import { DataStack } from "../lib/data-stack";

const app = new cdk.App();

const dataStack = new DataStack(app, "DataStack", {
    bucketName: "cineo-bucket-maric",
    bucketID: "Bucket",
});

const infrastractureStackMaric =  new InfrastructureStack(app, "InfrastractureStackMaric", {
    bucketName: "cineo-bucket-maric",
    dbName: "DBNAME",
    bucketID: "Bucket",
    movieBucket: dataStack.movieBucket
});

new ContentTranscoderStack(app, "ContentTranscoderStack", {
    uploadMovie: infrastractureStackMaric.uploadMovie,
    bucketName: dataStack.bucketName,
    movieBucket: dataStack.movieBucket
});

const infrastractureStackTrajce = new InfrastructureStack(app, "InfrastructureStackTrajce", {
    bucketName: "cineo-bucket-trajce",
    dbName: "DBNAMETrajce",
    bucketID: "BucketTrajce",
    movieBucket: dataStack.movieBucket
});

new CognitoStack(app, "CognitoStack", {
    api: infrastractureStackTrajce.api,
});

app.synth();
