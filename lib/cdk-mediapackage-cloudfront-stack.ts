import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MediaPackageCdnAuth } from './mediapackage';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkMediapackageCloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Read configuration to set all the parameters
    var configuration = require("./config.json")

    const mediaPackageChannel = new MediaPackageCdnAuth(
      this,
      "MyMediaPackageChannel",
      configuration.mediaPackage
    );
    

  }
}
