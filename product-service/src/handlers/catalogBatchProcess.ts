import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
const sns = new AWS.SNS();

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: { Records: any }) => {
  for (const record of event.Records) {
    const messageBody = JSON.parse(record.body);

    await dynamoDB
      .put({
        TableName: "products",
        Item: {
          id: uuidv4(),
          title: messageBody.title,
          description: messageBody.description,
          price: messageBody.price,
        },
      })
      .promise();

    await sns
      .publish({
        TopicArn:
          "arn:aws:sns:eu-west-1:449355255930:ProductServiceStack-createProductTopic05C0E62B-tFetdLh8FhlL",
        Message: "New product created: " + messageBody.title,
        Subject: "New Product Created",
      })
      .promise();
  }

  return "Processing complete";
};
