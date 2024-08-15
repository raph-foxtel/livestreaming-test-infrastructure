 import {
  Aws,
  CfnOutput,
  aws_secretsmanager as secretsmanager,
} from "aws-cdk-lib";
import { Construct } from "constructs";


export class Secrets extends Construct {
  public readonly cdnSecret: secretsmanager.ISecret;
 
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const cdnSecret = new secretsmanager.Secret(this, "CdnSecret", {
      secretName: "MediaPackage/"+Aws.STACK_NAME,
      description: "Secret for Secure Resilient Live Streaming Delivery",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ MediaPackageCDNIdentifier: "" }),
        generateStringKey: "MediaPackageCDNIdentifier", //MUST keep this StringKey to use with EMP
      },
    });
    this.cdnSecret = cdnSecret;

    new CfnOutput(this, "cdnSecret", {
      value: cdnSecret.secretName,
      exportName: Aws.STACK_NAME + "cdnSecret",
      description: "The name of the cdnSecret",
    });


  }
}
