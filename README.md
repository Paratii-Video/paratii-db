[![CircleCI](https://circleci.com/gh/Paratii-Video/paratii-lib.svg?style=svg)](https://circleci.com/gh/Paratii-Video/paratii-db)


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
$ npm install

# for development (needs Parity node running) & .env with LOCAL_IP
$ npm run dev

# for production against Paratii Chain
$ npm run start

# Note: You can also use yarn. I'm not gonna judge :)
```

## Testing

The tests expect a locally running parity node, so first start that:

```bash
$ npm run parity

```
And now run the tests in another terminal:
```bash
$ npm run test
```

## Documentation


### API

Api are available on db.paratii.video wuith rescricted cors origin.
You can use API also using paratii-lib nad paratii.core features, check the docs at:

https://github.com/Paratii-Video/paratii-lib/blob/dev/docs/paratii-core.md

#### Videos

Get all videos collection:


```bash
GET /api/v1/videos
```

Search in videos collections:

```bash
keyword=<keyword>
```

available indexed (and full text searchable) fields:

* video
* description
* owner
* uploader.name
* uplaoder.address
* tags

Mixed search:
```bash
keyword=<keyword>&owner=<address>
```

Get single video document:

```bash
GET /api/v1/videos/<id>
```

Get related videos collection (TBD):

```bash
GET /api/v1/videos/<id>/related
```
#### Users


Search in users collection:

```bash
GET /api/v1/users
```

available indexed (and full text searchable) fields:

* name
* email

Mixed search (quiet useless at the moment):
```bash
keyword=<keyword>&email=<email>
```

Get user document:

```bash
GET /api/v1/users/<id>
```
#### Transactions

Search in transactions collection:

```bash
GET /api/v1/transactions
```
available indexed (and full text searchable) fields:

* from
* to
* description

Mixed search:
```bash
keyword=<keyword>&description=<description>
```


Get transaction document:

```bash
GET /api/v1/transactions/<id>
```


### Overlooking Blockchain obSERVER

Currently obSERVER is configure to listen to:

```
module.videoObserver = require('./video')(paratii)
module.userObserver = require('./user')(paratii)
module.transactionObserver = require('./transaction')(paratii)

```

### Collection Model

Transaction:
```
{
_id: String,
blockNumber: Number,
event: String,
description: String,
from: String,
logIndex: Number,
nonce: Number,
source: String,
to: String,
value: Number
}
```

Video:
```
{
_id: String,
title: {type: String},
description: {type: String},
price: Number, // FIXME this should be bignumber.js
src: String,
mimetype: String,
owner: {type: String},
stats: {
likes: Number,
dislikes: Number,
likers: Array,
dislikers: Array
},
uploader: {
name: {type: String},
address: {type: String}
},
tags: {type: [String]}
}
```

User:
```
{
_id: {type: String},
name: {type: String},
email: {type: String},
ipfsData: String
}
```

### Mongo indexing

Transaction:

```
{from: 'text', to: 'text', description: 'text'}
```


Video:
```
{title: 'text', description: 'text', owner: 'text', 'uploader.name': 'text', 'uploader.address': 'text', tags: 'text'}
```

User:
```
{name: 'text', email: 'text'}
```

## Request cors access

Currently our API have limited cors access.
Want to develop a project that use Paratii API?
Write us on our beloved telegram channel =)

https://t.me/joinchat/EWZMBQ9mnqJ1--NKHpyF8A

## Troubleshooting

If you get an error like `MongoError: exception: Unrecognized pipeline stage name: '$sample'`, you may have a Mongo version < `3.2`, and you need to upgrade.

Check the version with `mongo --version`, and follow the instructions here https://docs.mongodb.com/manual/release-notes/3.2-upgrade/
