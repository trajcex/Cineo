import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path = require("path");
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

interface CognitoStackProps extends cdk.StackProps {
    api: apigateway.RestApi;
}
export class CognitoStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CognitoStackProps) {
        super(scope, id, props);

        const pool = new cognito.UserPool(this, "Pool", {
            standardAttributes: {
                givenName: {
                    required: true,
                },
                familyName: {
                    required: true,
                },
                birthdate: {
                    required: true,
                },
                nickname: {
                    required: true,
                },
                email: {
                    required: true,
                },
            },
            passwordPolicy: {
                minLength: 12,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            selfSignUpEnabled: true,
            signInAliases: { username: true },
            autoVerify: { email: true },
            signInCaseSensitive: false,
        });
        const adminGroup = new cognito.CfnUserPoolGroup(this, "AdminGroup", {
            userPoolId: pool.userPoolId,
            groupName: "admin",
        });
        const guestGroup = new cognito.CfnUserPoolGroup(this, "GuestGroup", {
            userPoolId: pool.userPoolId,
            groupName: "guest",
        });

        const postConfirmationLambda = new lambda.Function(
            this,
            "PostConfirmationLambda",
            {
                runtime: lambda.Runtime.PYTHON_3_9,
                handler: "post-confirmation.handler",
                code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            }
        );

        pool.addTrigger(
            cognito.UserPoolOperation.POST_CONFIRMATION,
            postConfirmationLambda
        );

        postConfirmationLambda.role?.attachInlinePolicy(
            new iam.Policy(this, "userpool-policy", {
                statements: [
                    new iam.PolicyStatement({
                        actions: ["cognito-idp:AdminAddUserToGroup"],
                        resources: [pool.userPoolArn],
                    }),
                ],
            })
        );
        const client = pool.addClient("app-client", {
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
        });
        const authLambda = new lambda.Function(this, "AuthLambda", {
            code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
            handler: "auth.handler",
            runtime: lambda.Runtime.PYTHON_3_9,
        });
        // const authorizer = new apigateway.TokenAuthorizer(
        //     this,
        //     "awesome-api-authorizer",
        //     {
        //         handler: authLambda,
        //         identitySource:
        //             apigateway.IdentitySource.header("authorization"),
        //         resultsCacheTtl: cdk.Duration.seconds(0),
        //     }
        // );
    }
}
