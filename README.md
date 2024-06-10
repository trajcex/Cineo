# Cineo

AWS CLI

```shell
# Check if aws cli is installed
aws --version
# Configure aws cli
aws configure
```

AWS CDK Create

```shell
# Install aws cdk
npm install -g aws-cdk
# Create an empty directory for infrastructure
mkdir infrastructure-name
cd infrastructure-name
# Installs the cdk typescript project
cdk init app --language typescript
```

**CDK needs to be updated each time a deployment has to be made.**

```shell
# Check for outdated files
npm outdated
# Update npm
npm update
# aws cdk global update
npm install -g aws-cdk
```

Infrastructure has to be bootstraped and uploaded to shared S3 bucket

```shell
cdk bootstrap
# For defining a specific profile
cdk bootstrap --profile default
```

Synthesize and deploy the stack

```shell
# StackName is the string id passed trough *-stack.ts constructor
cdk synth StackName
cdk deploy StackName
```

Destroying the stack

```shell
cdk destroy StackName
```

## Crash course

[AWS CDK Crash Course for Beginners](https://www.youtube.com/watch?v=D4Asp5g4fp8)

## Stacks

Containers of related constructs. Organizing code into more intuitive way. Comunication between stacks is possible.

# Best practices

CDK apps should be organised into logical units:

-   infrastructure (S3, RDS, VPC)
-   runtime code (Lambda)
-   configuration code
-   optional pipeline for automated deployment
    Stacks define the deployment model of these logical units.
    [official best practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
