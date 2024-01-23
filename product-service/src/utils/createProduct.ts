import {
  AttributeValue,
  DocumentClient,
  PutItemInput,
} from "aws-sdk/clients/dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DocumentClient();
const tableName = "products";

export const createProduct = async (productData: any) => {
  const productId = uuidv4();

  const params: PutItemInput = {
    TableName: tableName!,
    Item: {
      id: productId as AttributeValue,
      title: productData.title,
      description: productData.description,
      price: productData.price.toString(),
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 201,
      body: { id: productId, message: "Product created successfully" },
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { statusCode: 500, body: { error: "Internal Server Error" } };
  }
};
