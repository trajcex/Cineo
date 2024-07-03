#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { CognitoStack } from "../lib/cognito-statck";

const app = new cdk.App();

new InfrastructureStack(app, "InfrastructureStack", {
    bucketName: "cineo-bucket-maric",
    dbName: "DBNAME",
    bucketID: "Bucket",
});

const nesto = new InfrastructureStack(app, "InfrastructureStackTrajce", {
    bucketID: "BucketTrajce",
    dbName: "DBNAMETrajce",
    bucketName: "cineo-bucket-trajce",
});

new CognitoStack(app, "CognitoStack", {
    api: nesto.api,
});

app.synth();
