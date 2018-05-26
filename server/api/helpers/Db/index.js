'use strict'

import MongoClient from 'mongodb'

var db = null

const getClient = () => {
  return new Promise(function(resolve, reject) {
    if (db !== null) resolve(db)
    else {
      MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT, function(err, client) {
        if (err) reject(err)
        else {
          try {
            console.log("Connected successfully to MongoDB server");
            db = client.db(process.env.MONGO_DB);
            resolve(db)
          } catch (err) {
            reject(err)
          }
        }
      })
    }
  })
}

const Db = {
  getClient
}

export default Db
