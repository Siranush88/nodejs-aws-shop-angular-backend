import { ApiGateway } from "aws-cdk-lib/aws-events-targets";

const basicAuthLambda = lambda.Function.fromFunctionARn(
  this,
  "BasicAuthorizer",
  process.env.AUTH_LAMBDA_ARN as string
);

const invokeTokenAuthoriserRole = new iam.Role(this, "Role", {
  roleName: "invokeTokenAuthoriserRole",
  assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
});

const invokeTokenAuthoriserPolicyStatement = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  sid: "AllowInvokeLambda",
  resources: [basicAuthLambda.functionArn],
  actions: ["lambda:InvokeFunction"],
});

const policy = new iam.Policy(this, "Policy", {
  policyName: "invokeTokenAuthoriserPolicy",
  roles: [invokeTokenAuthoriserRole],
  statements: [invokeTokenAuthoriserPolicyStatement],
});

const authorizer = new apiGateway.TokenAuthorizer(this, "TokenAuthoriser", {
  handler: basicAuthLambda,
  assumeRole: invokeTokenAuthoriserRole,
  resultsCacheTtl: cdk.Duration.seconds(0),
});

//========================================================================

import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";
import * as lambda_1 from "@aws-cdk/aws-lambda-nodejs";
import * as lambda_2 from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";
import { Runtime } from "@aws-cdk/aws-lambda";

// export class ImportServiceStack extends cdk.Stack {
//   constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     const existingBucketName = "siranush88-import-service-bucket";
//     const importBucket: any = s3.Bucket.fromBucketName(
//       this,
//       "ImportBucket",
//       existingBucketName
//     );

//     const importProductsFileLambda = new lambda_2.Function(
//       this,
//       "ImportProductsFileLambda",
//       {
//         runtime: lambda_2.Runtime.NODEJS_16_X,
//         handler: "handlers/import-handler.handler",
//         code: lambda_2.Code.fromAsset("src"),
//         environment: {
//           IMPORT_BUCKET_NAME: importBucket.bucketName,
//         },
//       }
//     );

//     importBucket.grantReadWrite(importProductsFileLambda);

//     const importFileParserLambda = new lambda_1.NodejsFunction(
//       this,
//       "ImportFileParserLambda",
//       {
//         runtime: Runtime.NODEJS_16_X,
//         handler: "handler",
//         entry: "src/handlers/importFileParser.ts",
//         environment: {
//           IMPORT_BUCKET_NAME: importBucket.bucketName,
//         },
//         bundling: {
//           externalModules: ["../../node_modules/csv-parser"],
//         },
//       }
//     );

//     importBucket.grantRead(importFileParserLambda);

//     importFileParserLambda.addEventSource(
//       new S3EventSource(importBucket, {
//         events: [s3.EventType.OBJECT_CREATED],
//         filters: [{ prefix: "uploaded/" }],
//       })
//     );

//     const api = new apigateway.RestApi(this, "ImportApi", {
//       restApiName: "Import API",
//       description: "API for importing products",
//       defaultCorsPreflightOptions: {
//         allowOrigins: ["*"],
//         allowMethods: ["*"],
//         allowHeaders: ["*"],
//         //allowCredentials: true,
//       },
//     });

//     const importIntegration = new apigateway.LambdaIntegration(
//       importProductsFileLambda
//     );

//     const importResource = api.root.addResource("import");
//     importResource.addMethod("GET", importIntegration);
//     //importResource.addMethod("PUT", importIntegration);

//     new cdk.CfnOutput(this, "ImportBucketOutput", {
//       value: importBucket.bucketName,
//       description: "Import S3 Bucket Name",
//     });

//     new cdk.CfnOutput(this, "ImportLambdaFunctionOutput", {
//       value: importProductsFileLambda.functionArn,
//       description: "Import Lambda Function ARN",
//     });

//     new cdk.CfnOutput(this, "ImportFileParserLambdaOutput", {
//       value: importFileParserLambda.functionArn,
//       description: "Import File Parser Lambda Function ARN",
//     });
//   }
// }

// const app = new cdk.App();
// new ImportServiceStack(app, "ImportServiceStack");

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const existingBucketName = "siranush88-import-service-bucket";
    const importBucket: any = s3.Bucket.fromBucketName(
      this,
      "ImportBucket",
      existingBucketName
    );

    const basicAuthorizer = new lambda_2.Function(this, "BasicAuthorizer", {
      runtime: lambda_2.Runtime.NODEJS_16_X,
      handler: "basicAuthorizer.handler",
      code: lambda_2.Code.fromAsset("../authorization-service/lambda"),
      environment: {
        Siranush88: "TEST_PASSWORD",
      },
    }); //

    importBucket.grantReadWrite(basicAuthorizer); //

    const importProductsFileLambda = new lambda_2.Function(
      this,
      "ImportProductsFileLambda",
      {
        runtime: lambda_2.Runtime.NODEJS_16_X,
        handler: "handlers/import-handler.handler",
        code: lambda_2.Code.fromAsset("src"),
        environment: {
          IMPORT_BUCKET_NAME: importBucket.bucketName,
        },
      }
    );

    importBucket.grantReadWrite(importProductsFileLambda);

    const importFileParserLambda = new lambda_1.NodejsFunction(
      this,
      "ImportFileParserLambda",
      {
        runtime: Runtime.NODEJS_16_X,
        handler: "handler",
        entry: "src/handlers/importFileParser.ts",
        environment: {
          IMPORT_BUCKET_NAME: importBucket.bucketName,
        },
        bundling: {
          externalModules: ["../../node_modules/csv-parser"],
        },
      }
    );

    importBucket.grantRead(importFileParserLambda);

    importFileParserLambda.addEventSource(
      new S3EventSource(importBucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "uploaded/" }],
      })
    );

    const api = new apigateway.RestApi(this, "ImportApi", {
      restApiName: "Import API",
      description: "API for importing products",
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["*"],
        allowHeaders: ["*"],
        allowCredentials: true,
      },
    });

    const importIntegration = new apigateway.LambdaIntegration(
      importProductsFileLambda
    );

    const tokenAuthorizer = new apigateway.TokenAuthorizer(
      this,
      "MyAuthorizer",
      {
        handler: basicAuthorizer,
        identitySource: "method.request.header.Authorization",
      }
    );

    import { ApiGateway } from "aws-cdk-lib/aws-events-targets";

    const basicAuthLambda = lambda.Function.fromFunctionARn(
      this,
      "BasicAuthorizer",
      process.env.AUTH_LAMBDA_ARN as string
    );

    const invokeTokenAuthoriserRole = new iam.Role(this, "Role", {
      roleName: "invokeTokenAuthoriserRole",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    const invokeTokenAuthoriserPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      sid: "AllowInvokeLambda",
      resources: [basicAuthLambda.functionArn],
      actions: ["lambda:InvokeFunction"],
    });

    const policy = new iam.Policy(this, "Policy", {
      policyName: "invokeTokenAuthoriserPolicy",
      roles: [invokeTokenAuthoriserRole],
      statements: [invokeTokenAuthoriserPolicyStatement],
    });

    const authorizer = new apiGateway.TokenAuthorizer(this, "TokenAuthoriser", {
      handler: basicAuthLambda,
      assumeRole: invokeTokenAuthoriserRole,
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    const importResource = api.root.addResource("import");

    //importResource.addMethod("GET", importIntegration);
    importResource.addMethod("GET", importIntegration, {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      //authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: tokenAuthorizer,
    });

    new cdk.CfnOutput(this, "ImportBucketOutput", {
      value: importBucket.bucketName,
      description: "Import S3 Bucket Name",
    });

    new cdk.CfnOutput(this, "ImportLambdaFunctionOutput", {
      value: importProductsFileLambda.functionArn,
      description: "Import Lambda Function ARN",
    });

    new cdk.CfnOutput(this, "ImportFileParserLambdaOutput", {
      value: importFileParserLambda.functionArn,
      description: "Import File Parser Lambda Function ARN",
    });
  }
}

const app = new cdk.App();
new ImportServiceStack(app, "ImportServiceStack");
