#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkMediapackageCloudfrontStack } from '../lib/livestreaming-test-infrastructure';
import { Aws} from "aws-cdk-lib";
import { CodeBuildStack } from '../lib/codebuild-stack';
import { ApiStack } from '../lib/api-stack';


const app = new cdk.App();

const stackName = app.node.tryGetContext('stackName') || 'DefaultStackName';
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