#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkMediapackageCloudfrontStack } from '../lib/cdk-mediapackage-cloudfront-stack';
import { Aws} from "aws-cdk-lib";
import { CodeBuildStack } from '../lib/codebuild-stack';
import { ApiStack } from '../lib/api-stack';


const app = new cdk.App();

const stackName = app.node.tryGetContext('stackName') || 'DefaultStackName';
if (!stackName) {
  throw new Error('Stack name must be provided via context. Use --context stack-name=<name>');
}
//const stackName='Live-Test-Event'
const description='Deploying CDK with EMP'

new ApiStack(app, 'ApiStack');
new CodeBuildStack(app, 'CodeBuildStack');

new CdkMediapackageCloudfrontStack(app, 'CdkMediapackageCloudfrontStack', {
  stackName: stackName,
  env: {
    region: `${Aws.REGION}`,
    account: `${Aws.ACCOUNT_ID}`,
  },
  description
});
