import AWS from "aws-sdk";
import express from "express";
import serverless from "serverless-http";

const app = express();
const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/users/:userid", async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userid,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      const { userId, name, email } = Item;
      return res.json({ userId, name, email });
    } else {
      return res
        .status(404)
        .json({ error: 'Could not find user with id' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Could not get the user" });
  }
});

app.post("/users", async (req, res) => {
  const { userid, name, email, password } = req.body;

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userid,
      name,
      email,
      password
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    return res.json({ userid, name, email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
