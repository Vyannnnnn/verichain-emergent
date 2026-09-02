import { MongoClient } from 'mongodb'

let clientPromise = null
let db = null

async function _connect() {
  const uri = process.env.MONGO_URL || 'mongodb://localhost:27017'
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
  await client.connect()
  const dbName = process.env.DB_NAME || 'verichain_academic'
  db = client.db(dbName)
  return db
}

export async function connectToMongo() {
  if (db) return db
  if (!clientPromise) {
    clientPromise = _connect().catch((err) => {
      // reset so subsequent requests can retry
      clientPromise = null
      throw err
    })
  }
  return clientPromise
}

export async function getCollection(collectionName) {
  const database = await connectToMongo()
  return database.collection(collectionName)
}
