import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as s3 from "aws-cdk-lib/aws-s3";



interface ContentTranscoderProps extends cdk.StackProps {
    uploadMovie: lambda.Function;
    bucketName: string; 
    movieBucket: s3.Bucket;
}

export class ContentTranscoderStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ContentTranscoderProps) {
        super(scope, id, props);

        const ffmpegLayer = new lambda.LayerVersion(
            this,
            "FfmpegLayer",
            {
                code: lambda.Code.fromAsset(
                    path.join(__dirname, "../layer", "ffmpeg.zip")
                ),
                compatibleArchitectures: [lambda.Architecture.ARM_64],
            }
        );

        const transcodeContent = new lambda.Function(this, "TranscodeContent", {
            runtime: lambda.Runtime.PYTHON_3_11,
            architecture: lambda.Architecture.ARM_64,
            handler: "transcodeContent.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            timeout: cdk.Duration.seconds(600),
            layers: [ffmpegLayer],
            environment: {PATH: "bin"}
        });

        const map = new sfn.Map(this, 'Map State', {
            maxConcurrency: 3,
            itemsPath: sfn.JsonPath.stringAt('$.inputForMap'),
        });

        const lambdaInvoke = new sfnTasks.LambdaInvoke(this, 'Invoke Lambda', {
            lambdaFunction: transcodeContent,
            timeout: cdk.Duration.seconds(600),
        });

        map.itemProcessor(lambdaInvoke);

        const startState = new sfn.Pass(this, 'Start State');

        const definition = startState.next(map);

        const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
            definition: definition,
            timeout: cdk.Duration.minutes(5),
        });
        
        stateMachine.grantStartExecution(props.uploadMovie);
        props.movieBucket.grantRead(transcodeContent);
        props.movieBucket.grantPut(transcodeContent);

        props.uploadMovie.addEnvironment('STEP_FUNCTION_ARN', stateMachine.stateMachineArn);
        transcodeContent.addEnvironment("BUCKET_NAME", props.bucketName);
    }
}