import { DocumentClient } from "aws-sdk/clients/dynamodb";

const dynamoDb = new DocumentClient();

const tableName = "products";

export const getProductsList = async () => {
  const params = {
    TableName: tableName,
  };

  try {
    const result = await dynamoDb.scan(params).promise();

    return result.Items;
  } catch (error) {
    console.error("Error retrieving products list:", error);
    throw new Error("Error retrieving products list");
  }
};
