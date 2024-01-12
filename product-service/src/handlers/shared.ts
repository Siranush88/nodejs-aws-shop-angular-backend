export const buildResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://d1xdvo0sx4nur6.cloudfront.net",
      "Access-Control-Allow-Methods": "OPTIONS,GET",
    },
  };
};
