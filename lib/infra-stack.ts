import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import {Aws} from "aws-cdk-lib";
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'DeploymentApi');
    const deployment = api.root.addResource('deployment');

    // Create the Lambda Function
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
    deployment.addMethod('POST', new apigateway.LambdaIntegration(deploymentFunction));
    
    new cdk.CfnOutput(this, "MyLiveStreamingTestPlatformAPI", {
        value: api.url,
        exportName: Aws.STACK_NAME + "api-url",
        description: "API URL to start a new stack for LiveStreaming Test Infrastructure",
      })

    // Create API Gateway methods
    //const stacks = api.root.addResource('stacks');
    //stacks.addMethod('POST', new apigateway.LambdaIntegration(deploymentFunction));
    //stacks.addMethod('DELETE', new apigateway.LambdaIntegration(deploymentFunction));

    // Create CodeBuild project
    const cdkDeployProject = new codebuild.Project(this, 'CDKDeployProject', {
      projectName: 'CDKDeployProject',
      source: codebuild.Source.gitHub({
        owner: 'raph-foxtel',
        repo: 'livestreaming-test-infrastructure',
        webhook: false, // This sets up a webhook to trigger builds on push
      }),
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'npm install -g aws-cdk',
              'npm install',
            ],
          },
          build: {
            commands: [
              'cdk deploy CdkMediapackageCloudfrontStack --context stackName=$STACK_NAME --require-approval never',
            ],
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });

    // Grant CodeBuild permissions to deploy CloudFormation stacks

    cdkDeployProject.addToRolePolicy(new iam.PolicyStatement({
        actions: [
          'cloudformation:*',
          's3:*',
          'iam:*',
          'ec2:*',
          'ssm:*',
          'logs:*',
          'lambda:*',
        ],
        resources: ['*'],
      }));
  }
}
