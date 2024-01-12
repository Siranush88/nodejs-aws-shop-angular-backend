import { mockProducts } from "./mock-products";

export const getProductById = async (productId: string) => {
  const product = mockProducts.find((p) => p.id === parseInt(productId));

  return product;
};
