import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3 } from "aws-sdk";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing file name in the query parameters",
        }),
      };
    }

    const s3Key = `uploaded/${fileName}`;

    const s3 = new S3();
    const signedUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket: "siranush88-import-service-bucket",
      Key: s3Key,
      Expires: 120,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
    };
  } catch (error) {
    console.error("Error processing event:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
