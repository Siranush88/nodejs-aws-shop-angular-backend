import { getProductsList } from "../utils/getProductsList";
import { buildResponse } from "./shared";

export const handler = async () => {
  try {
    const products = await getProductsList();

    return buildResponse(200, products);
  } catch (err: any) {
    return buildResponse(500, {
      message: err.message,
    });
  }
};
