'use strict'
import Db from '../../Db'

const writeLastLogin = (sub, ip, agent, data) => {
  return new Promise(function(resolve, reject) {
    Db.getClient().then(dbClient => {
      const collection = dbClient.collection('lastLogin')
      collection.insert({
        sub: sub,
        created: new Date().getTime(),
        ip: ip,
        agent: agent,
        data: data
      },(err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  })
}

const LastLogin = {
  writeLastLogin

}

export default LastLogin
