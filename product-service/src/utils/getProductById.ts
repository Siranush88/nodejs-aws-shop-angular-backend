import { DocumentClient } from "aws-sdk/clients/dynamodb";

const dynamoDb = new DocumentClient();
const tableName = "products";

export const getProductById = async (productId: string) => {
  const params = {
    TableName: tableName,
    Key: {
      id: productId,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();

    return result.Item;
  } catch (error) {
    console.error("Error retrieving product by ID:", error);
    throw new Error("Error retrieving product by ID");
  }
};
