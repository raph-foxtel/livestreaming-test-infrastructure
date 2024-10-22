// lib/codebuild-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CodeBuildStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const project = new codebuild.Project(this, 'CDKDeployProject', {
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
              'npm run build',
              'cdk deploy --all --require-approval never',
            ],
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });

    project.addToRolePolicy(new iam.PolicyStatement({
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

    new cdk.CfnOutput(this, 'CodeBuildProjectName', {
      value: project.projectName,
      description: 'CodeBuild Project Name',
    });
  }
}
