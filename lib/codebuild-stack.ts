// lib/codebuild-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CodeBuildStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a CodeCommit repository
    const repo = new codecommit.Repository(this, 'CDKRepo', {
      repositoryName: 'my-cdk-repo',
      description: 'Repository for CDK code',
    });

    const project = new codebuild.Project(this, 'CDKDeployProject', {
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
              'cdk deploy --context stack-name=$STACK_NAME --require-approval never',
            ],
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
      source: codebuild.Source.codeCommit({ repository: repo }),
    });

    // Grant permissions to deploy CloudFormation stacks
    project.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'cloudformation:*',
        's3:*',
        'iam:*',
        'ec2:*',
        'ssm:*',
        'logs:*',
        'lambda:*',
        // Add any other necessary permissions based on the resources your stack is creating
      ],
      resources: ['*'],
    }));
    

    // Output the CodeCommit repository URL
    new cdk.CfnOutput(this, 'RepositoryCloneUrlHttp', {
      value: repo.repositoryCloneUrlHttp,
      description: 'CodeCommit Repository Clone URL (HTTPS)',
    });
  }
}
