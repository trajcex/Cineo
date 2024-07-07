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

const dataStackMaric = new DataStack(app, "DataStackMaric", {
    bucketName: "cineo-bucket-maric",
    bucketID: "Bucket",
});
const cognito = new CognitoStack(app, "CognitoStack", {});

const infrastractureStackMaric = new InfrastructureStack(app, "InfrastractureStackMaric", {
    bucketName: "cineo-bucket-maric",
    dbName: "DBNAME",
    bucketID: "Bucket",
    movieBucket: dataStackMaric.movieBucket,
    userPoolID: cognito.userPoolID,
    clientID: cognito.clientID,
});

new ContentTranscoderStack(app, "ContentTranscoderStack", {
    uploadMovie: infrastractureStackMaric.uploadMovie,
    bucketName: dataStackMaric.bucketName,
    movieBucket: dataStackMaric.movieBucket,
});

const dataStackTrajce = new DataStack(app, "DataStackTrajce", {
    bucketName: "cineo-bucket-trajce",
    bucketID: "BucketTrajce",
});
const infrastractureStackTrajce = new InfrastructureStack(app, "InfrastructureStackTrajce", {
    bucketName: "cineo-bucket-trajce",
    dbName: "DBNAMETrajce",
    bucketID: "BucketTrajce",
    movieBucket: dataStackTrajce.movieBucket,
    userPoolID: cognito.userPoolID,
    clientID: cognito.clientID,
});

const dataStackStefan= new DataStack(app, "DataStackStefan", {
    bucketName: "cineo-bucket-stefan",
    bucketID: "Bucket",
});
const infrastractureStackStefan = new InfrastructureStack(app, "InfrastractureStackStefan", {
    bucketName: "cineo-bucket-stefan",
    dbName: "DBNAME",
    bucketID: "Bucket",
    movieBucket: dataStackStefan.movieBucket,
    userPoolID: cognito.userPoolID,
    clientID: cognito.clientID,
});

new ContentTranscoderStack(app, "ContentTranscoderStackStefan", {
    uploadMovie: infrastractureStackStefan.uploadMovie,
    bucketName: dataStackStefan.bucketName,
    movieBucket: dataStackStefan.movieBucket,
});

app.synth();
