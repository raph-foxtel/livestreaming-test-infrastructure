
// lib/api-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import {Aws,
CfnOutput,
aws_mediapackage as mediapackage,
} from "aws-cdk-lib";
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deploymentFunction = new lambda.Function(this, 'DeploymentFunction', {
        runtime: lambda.Runtime.PYTHON_3_9,  // Use Python 3.9 runtime
        handler: 'index.lambda_handler',
        code: lambda.Code.fromAsset(path.join(__dirname,  'lambda', 'ci-cd-start-stack')),
        timeout: cdk.Duration.minutes(5),
        environment: {
            "CODEBUILD_PROJECT_NAME": Aws.STACK_NAME
        }
    });
    // Grant permissions to start CodeBuild projects
    deploymentFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['codebuild:StartBuild'],
      resources: ['*'], // Restrict this to specific CodeBuild project ARN in production
    }));

    const api = new apigateway.RestApi(this, 'DeploymentApi');

    const deployment = api.root.addResource('deployment');
    deployment.addMethod('POST', new apigateway.LambdaIntegration(deploymentFunction));
    
    new CfnOutput(this, "MyAPI", {
        value: api.url,
        exportName: Aws.STACK_NAME + "api-url",
        description: "API URL to start stack",
      })
  }
}
