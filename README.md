# Paratii-Db

**WORK IN PROGRESS**

The Mongodb mirror of the `paratii` smartcontract data. This is mainly used to
make it easier to index and search the video data and do all sorts of aggregations
that would be too hard to do on the blockchain data.

## Dependencies

This requires [`MongoDb`](https://www.mongodb.com/) to work. head over to the [download section](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu) and install the proper release for your system.

## Installation

```bash
$ git clone https://github.com/Paratii-Video/paratii-db.git
$ cd paratii-db
$ npm Install

# for development
$ npm run dev

# in production
$ npm start

# Note: You can also use yarn. I'm not gonna judge :)
```

## Documentation

TODO , But take a look at `src/server.js` and follow along the jsdocs and you should be able to get around the code.

In the meantime, if you have any question, head to our [gitter dev channel](https://gitter.im/Paratii-Video/dev) and feel free to use the issues section aswell :)
