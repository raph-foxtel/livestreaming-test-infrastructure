#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkMediapackageCloudfrontStack } from '../lib/livestreaming-test-infrastructure-stack';
import { Aws} from "aws-cdk-lib";
import {InfraStack} from "../lib/infra-stack";

const app = new cdk.App();

const stackName = app.node.tryGetContext('stackName') || 'DefaultStackName';
if (!stackName) {
  throw new Error('Stack name must be provided via context. Use --context stackName=<name>');
}
const description='Deploying Live stream on the go using CDK for deploying test Live stream on demand'

new InfraStack(app, 'InfraStack');

new CdkMediapackageCloudfrontStack(app, 'CdkMediapackageCloudfrontStack', {
  stackName: stackName,
  env: {
    region: `${Aws.REGION}`,
    account: `${Aws.ACCOUNT_ID}`,
  },
  description
});
