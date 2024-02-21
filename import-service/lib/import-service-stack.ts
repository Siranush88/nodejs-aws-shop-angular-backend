import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";
import * as lambda_1 from "@aws-cdk/aws-lambda-nodejs";
import * as lambda_2 from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";
import { Runtime } from "@aws-cdk/aws-lambda";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "@aws-cdk/aws-iam";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBasicAuthorizer = cdk.Fn.importValue("BasicAuthorizerArn");

    const basicAuthorizer = lambda_2.Function.fromFunctionArn(
      this,
      "importBasicAuthorizer",
      importBasicAuthorizer
    );

    const invokeTokenAuthRole = new Role(this, "Role", {
      roleName: "InvokeTokenAuthRole",
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    const InvokeTokenPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      sid: "AllowInvokeLambda",
      resources: [basicAuthorizer.functionArn],
      actions: ["lambda:InvokeFunction"],
    });

    invokeTokenAuthRole.addToPolicy(InvokeTokenPolicyStatement);

    const existingBucketName = "siranush88-import-service-bucket";
    const importBucket: any = s3.Bucket.fromBucketName(
      this,
      "ImportBucket",
      existingBucketName
    );

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

    const importResource = api.root.addResource("import");

    importResource.addMethod("GET", importIntegration, {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: new apigateway.TokenAuthorizer(this, "MyLambdaAuthorizer", {
        handler: basicAuthorizer,
        assumeRole: invokeTokenAuthRole,
        resultsCacheTtl: cdk.Duration.seconds(0),
      }),
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
