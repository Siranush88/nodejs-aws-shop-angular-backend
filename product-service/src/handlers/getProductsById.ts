import { getProductById } from "../utils/getProductById";
import { buildResponse } from "./shared";

export const handler = async (event: any) => {
  try {
    const productId = event.pathParameters.productId;
    const product = await getProductById(productId);

    if (!product) {
      return buildResponse(404, { error: "Product not found" });
    }

    return buildResponse(200, product);
  } catch (err: any) {
    return buildResponse(500, {
      message: err.message,
    });
  }
};
