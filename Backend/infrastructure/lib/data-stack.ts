import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';


interface DataProps extends cdk.StackProps {
    bucketName: string;
    bucketID: string;
}
export class DataStack extends cdk.Stack {
    public readonly movieBucket: s3.Bucket;
    public readonly bucketName: string;
    constructor(scope: Construct, id: string, props: DataProps) {
        super(scope, id, props);

        this.bucketName = props.bucketName;
        
        this.movieBucket = new s3.Bucket(this, props.bucketID, {
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

    }
}