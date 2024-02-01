import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  const authorizationToken = event.authorizationToken;

  if (!authorizationToken) {
    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        key: "value",
      },
    };
  }

  const [username, password] = Buffer.from(authorizationToken, "base64")
    .toString("utf-8")
    .split(":");

  const envPassword = process.env[username];

  if (!envPassword || envPassword !== password) {
    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        key: "value",
      },
    };
  }

  return {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn,
        },
      ],
    },
    context: {
      key: "value",
    },
  };
};
