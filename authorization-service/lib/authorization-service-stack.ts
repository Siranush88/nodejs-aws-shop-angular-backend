import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new lambda.Function(this, "BasicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "basicAuthorizer.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        Siranush88: "TEST_PASSWORD",
      },
    });

    new cdk.CfnOutput(this, "BasicAuthorizerLambda", {
      value: basicAuthorizer.functionArn,
      exportName: "BasicAuthorizerArn",
    });
  }
}
