import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3 } from "aws-sdk";
import { buildResponse } from "./shared";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
      return buildResponse(400, {
        message: "Missing file name in the query parameters",
      });
    }

    const s3Key = `uploaded/${fileName}`;

    const s3 = new S3();
    const signedUrl = s3.getSignedUrl("putObject", {
      Bucket: "siranush88-import-service-bucket",
      ContentType: "text/csv",
      Key: s3Key,
      Expires: 120,
    });

    return buildResponse(200, signedUrl);
  } catch (error) {
    console.error("Error processing event:", error);

    return buildResponse(500, { message: "Internal server error" });
  }
};
