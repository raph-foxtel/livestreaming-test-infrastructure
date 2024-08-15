import { 
    custom_resources,
    Aws,
    CfnOutput,
    aws_iam as iam,
    aws_lambda as lambda} from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";

export interface IConfigProps {
  
  cmafEndpointId: string;
  channelId: string;
  
}

export class MediaPackageOutputValue extends Construct {
  public readonly myEMPUrl;
  //public readonly myEMPUrl: { [key: string]: string };

  public readonly myIngestUrl: string;
  public readonly myUsername: string;
  public readonly myPassword: string;
  
  constructor(scope: Construct, id: string, props: IConfigProps) {
    super(scope, id);
    // 👇 Create the Lambda to retrieve the CMAF endpoint URL
    const functionName=Aws.STACK_NAME + "_getUrl_EMP";
    const ssmName=Aws.STACK_NAME + "-EMP-url";
    const myLambdaFilePath = join(__dirname, "lambda","mediapackage_geturl_function");
    
    const getOutput = new lambda.Function(this, "GetUrlEMPLambda", {
        functionName:functionName ,
        runtime: lambda.Runtime.PYTHON_3_9,
        code: lambda.Code.fromAsset(myLambdaFilePath),
        handler: 'index.lambda_handler',
    });
    // add the policy to the Function's role
    const cmafLambdaPolicy = new iam.PolicyStatement({
            actions: ['mediapackage:*','ssm:PutParameter'],
            resources: ['*'],
            });

    getOutput.role?.attachInlinePolicy(
        new iam.Policy(this, 'mediaPackageAccess', {
            statements: [cmafLambdaPolicy],
        }));

    
    // 👇 Executing the Lambda to get the payload from the Lambda function
    const outputCR = new custom_resources.AwsCustomResource(this, "OutputEMP", {
      onCreate: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: functionName,
          Payload: `{
            "mediaPackageEndpointId": "${props.cmafEndpointId}",
            "mediaPackageChannelId": "${props.channelId}",
            "ssmName": "${ssmName}"
          }`
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of(
          "outputEMPResourceId"
        ),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["lambda:InvokeFunction"],
          resources: [getOutput.functionArn],
        }),
      ])
    });

    // Reading the ssm value and exporting the URLs
    const ssmFetchCustomResource = new custom_resources.AwsCustomResource(
      this,
      "SSMParameter",
      {
        onCreate: {
          service: "SSM",
          action: "getParameter",
          parameters: { Name: ssmName },
          region: Aws.REGION,
          physicalResourceId: custom_resources.PhysicalResourceId.of(
            `${ssmName}-${Aws.REGION}`
          ),
        },
        policy: custom_resources.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["ssm:GetParameter*"],
            resources: [
              `arn:aws:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/${ssmName}`,
            ],
          }),
        ]),
      }
    );

    // Wait for the lambda to be executed before reading the parameter
    ssmFetchCustomResource.node.addDependency(outputCR);
    // SSM parameter is a json
    const parameterValue = ssmFetchCustomResource.getResponseField("Parameter.Value");



    this.myEMPUrl = parameterValue;




  }

}
