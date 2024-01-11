import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListLambda = new lambda.Function(
      this,
      "GetProductsListLambda",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        code: lambda.Code.fromInline(`
  exports.handler = async () => {
    const mockProducts = [{"id":1,"name":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/YN8zNnV0sK8/default.jpg"},
    {"id":2,"title":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/k5E2AVpwsko/default.jpg"},
    {"id":3,"title":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/Rf54BH35yrY/default.jpg"},
    {"id":4,"title":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/m0yGx2MGZWg/default.jpg"},
    {"id":5,"title":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/VAkio68d51A/default.jpg"}]

    return {
      statusCode: 200,
      body: JSON.stringify(mockProducts),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://d1xdvo0sx4nur6.cloudfront.net',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
    };
  };
`),
      }
    );

    const getProductsByIdLambda = new lambda.Function(
      this,
      "GetProductsByIdLambda",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        code: lambda.Code.fromInline(`
  exports.handler = async (event) => {
    const mockProducts = [{"id":1,"name":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/YN8zNnV0sK8/mqdefault.jpg"},
    {"id":2,"name":"Angular tutorial","price":10.99, "url": "'https://i.ytimg.com/vi/Fdf5aTYRW0E/mqdefault.jpg'"},
    {"id":3,"name":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/YN8zNnV0sK8/mqdefault.jpg"},
    {"id":4,"name":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/k5E2AVpwsko/mqdefault.jpg"},
    {"id":5,"make":"Angular tutorial","price":10.99, "url": "https://i.ytimg.com/vi/Rf54BH35yrY/mqdefault.jpg"}]

    const productId = event.pathParameters.productId;
    const product = mockProducts.find(p => p.id === parseInt(productId));

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://d1xdvo0sx4nur6.cloudfront.net',
          'Access-Control-Allow-Methods': 'OPTIONS,GET',
        },
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://d1xdvo0sx4nur6.cloudfront.net',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
    };
  };
`),
      }
    );

    const api = new apigateway.RestApi(this, "ProductApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["https://d1xdvo0sx4nur6.cloudfront.net"],
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integration = new apigateway.LambdaIntegration(getProductsListLambda);

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", integration);

    const integrationById = new apigateway.LambdaIntegration(
      getProductsByIdLambda
    );
    const productsByIdResource = productsResource.addResource("{productId}");
    productsByIdResource.addMethod("GET", integrationById);

    new cdk.CfnOutput(this, "ProductApiUrl", {
      value: api.urlForPath(productsResource.path),
      description: "The endpoint for /products",
    });
  }
}

const app = new cdk.App();

new ProductServiceStack(app, "ProductServiceStack");
