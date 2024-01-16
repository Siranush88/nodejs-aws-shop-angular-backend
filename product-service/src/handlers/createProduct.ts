import { createProduct } from "../utils/createProduct";
import { buildResponse } from "./shared";

export const handler = async (event: any) => {
  try {
    const requestBody = JSON.parse(event.body);

    if (!requestBody.title || !requestBody.price) {
      return buildResponse(400, {
        message: "Title and price are required fields.",
      });
    }

    const newProduct = await createProduct({
      title: requestBody.title,
      description: requestBody.description || "",
      price: requestBody.price,
    });

    return buildResponse(201, newProduct);
  } catch (err: any) {
    return buildResponse(500, {
      message: err.message,
    });
  }
};
