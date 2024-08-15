#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkMediapackageCloudfrontStack } from '../lib/cdk-mediapackage-cloudfront-stack';
import { Aws} from "aws-cdk-lib";



const app = new cdk.App();

const stackName = app.node.tryGetContext('stackName') || 'DefaultStackName';
//const stackName='Live-Test-Event'
const description='Deploying CDK with EMP'

new CdkMediapackageCloudfrontStack(app, 'CdkMediapackageCloudfrontStack', {
  stackName: stackName,
  env: {
    region: `${Aws.REGION}`,
    account: `${Aws.ACCOUNT_ID}`,
  },
  description
});