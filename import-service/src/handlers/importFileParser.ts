import { S3Event } from "aws-lambda";
import { S3 } from "aws-sdk";
import csv from "csv-parser";
import stream from "stream";

const s3 = new S3();

export const handler = async (event: S3Event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    const s3Object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const csvContent = s3Object.Body!.toString();

    const records: any[] = [];
    const parser = csv()
      .on("data", (data: any) => {
        records.push(data);
        console.log("Parsed Record:", data);
      })
      .on("end", () => {
        console.log("CSV parsing completed successfully");
      });

    const readableStream = new stream.Readable();
    readableStream.push(csvContent);
    readableStream.push(null);

    readableStream.pipe(parser);

    return { statusCode: 200, body: "CSV parsing completed successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
