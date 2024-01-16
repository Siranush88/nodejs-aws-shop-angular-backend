import * as apigateway from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, "products", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const sharedLambdaProps: lambda.NodejsFunctionProps = {
      runtime: Runtime.NODEJS_14_X,
      handler: "handler",
      environment: {
        DYNAMODB_TABLE_NAME: productsTable.tableName,
      },
    };

    const getProductsList = new lambda.NodejsFunction(
      this,
      "GetProductsListLambda",
      {
        ...sharedLambdaProps,
        functionName: "getProductsList",
        entry: "src/handlers/getProductsList.ts",
      }
    );

    const getProductsById = new lambda.NodejsFunction(
      this,
      "GetProductsByIdLambda",
      {
        ...sharedLambdaProps,
        functionName: "getProductsById",
        entry: "src/handlers/getProductsById.ts",
      }
    );

    const createProduct = new lambda.NodejsFunction(
      this,
      "CreateProductLambda",
      {
        ...sharedLambdaProps,
        functionName: "createProduct",
        entry: "src/handlers/createProduct.ts",
      }
    );

    const api = new apigateway.RestApi(this, "ProductApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["https://d1xdvo0sx4nur6.cloudfront.net"],
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integrationList = new apigateway.LambdaIntegration(getProductsList);
    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", integrationList);

    const integrationById = new apigateway.LambdaIntegration(getProductsById);
    const productsByIdResource = productsResource.addResource("{productId}");
    productsByIdResource.addMethod("GET", integrationById);

    const integrationCreate = new apigateway.LambdaIntegration(createProduct);
    productsResource.addMethod("POST", integrationCreate);

    new cdk.CfnOutput(this, "ProductApiUrl", {
      value: api.urlForPath(productsResource.path),
      description: "The endpoint for /products",
    });
  }
}

const app = new cdk.App();

new ProductServiceStack(app, "ProductServiceStack");
