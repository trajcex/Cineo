import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class CognitoStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

        const client = pool.addClient("app-client", {
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
        });
    }
}
