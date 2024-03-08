import { MongoClient } from "mongodb";

// Replace the following with your Atlas connection string
const url = "your-mongoDb-url or Mongo-atlas url";
// Connect to your Atlas cluster
const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to Atlas");
  } catch (err) {
    console.log(err.stack);
  }
}

// run().catch(console.dir);

export default run;
export { client };
