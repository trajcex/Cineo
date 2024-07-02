#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { CognitoStack } from "../lib/cognito-statck";

const app = new cdk.App();

new InfrastructureStack(app, "InfrastructureStack");

new CognitoStack(app, "CognitoStack");

app.synth();
