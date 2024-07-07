# Cineo

## Introduction

<p style="margin-left: 20px; font-size: 0.9em;">
Cineo is an advanced web application developed using the Angular framework, designed for storing and managing movie content. The application is built following the principles of Infrastructure as Code (IaC) and embraces a cloud-native architecture. This approach ensures high scalability, flexibility, and resilience of the application by leveraging AWS cloud services.
</p>

<p style="margin-left: 20px; font-size: 0.9em;">
Cineo utilizes a wide range of AWS services to implement various functionalities, including data storage, user authentication, and infrastructure management. By using AWS CDK (Cloud Development Kit), the project maintains a robust and efficient infrastructure, making the deployment and management of resources seamless and automated.

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

