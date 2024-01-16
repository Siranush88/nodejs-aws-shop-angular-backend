import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import IProduct from "./interface";

AWS.config.update({ region: "eu-west-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function insertItem(table: string, item: IProduct) {
  const params = {
    TableName: table,
    Item: item,
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`Item inserted into ${table}:`, item);
  } catch (error) {
    console.error(`Error inserting item into ${table}:`, error);
  }
}

const productData = [
  {
    id: uuidv4(),
    title: "Product 1",
    description: "Description 1",
    price: 10,
  },
  {
    id: uuidv4(),
    title: "Product 2",
    description: "Description 2",
    price: 20,
  },
  {
    id: uuidv4(),
    title: "Product 3",
    description: "Description 3",
    price: 20,
  },
  {
    id: uuidv4(),
    title: "Product 4",
    description: "Description 4",
    price: 20,
  },
  {
    id: uuidv4(),
    title: "Product 5",
    description: "Description 5",
    price: 15,
  },
];

const stockData = [
  { product_id: productData[0].id, count: 10 },
  { product_id: productData[1].id, count: 25 },
  { product_id: productData[2].id, count: 10 },
  { product_id: productData[3].id, count: 5 },
  { product_id: productData[4].id, count: 15 },
];

productData.forEach((product) => insertItem("products", product));

stockData.forEach((stock) => insertItem("stocks", stock));
