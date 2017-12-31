/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const assert = chai.assert
// const expect = chai.expect
chai.use(dirtyChai)
const Video = require('../src/models').video

const fixtures = [{
  '_id': 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ',
  'title': 'The mathematician who cracked Wall Street | Jim Simons',
  'description': 'Jim Simons was a mathematician and cryptographer who realized: the complex math he used to break codes could help explain patterns in the world of finance. Billions later, he’s working to support the next generation of math teachers and scholars. TED’s Chris Anderson sits down with Simons to talk about his extraordinary life in numbers.\n\nTEDTalks is a daily video podcast of the best talks and performances from the TED Conference, where the world\'sleading thinkers and doers give the talk of their lives in 18 minutes (or less). Look for talks on Technology, Entertainment and Design -- plus science, business, global issues, the arts and much more.\nFind closed captions and translated subtitles in many languages at http://www.ted.com/translate\n\nFollow TED news on Twitter: http://www.twitter.com/tednews\nLike TED on Facebook: https://www.facebook.com/TED\n\nSubscribe to our channel: http://www.youtube.com/user/TEDtalksD...',
  'price': 14,
  'src': '/ipfs/QmQvhvzMXKX71jLGjSfM9iKiWVKETXDmkPaQXhe4WrMmZ9',
  'mimetype': 'video/mp4',
  'thumb': '/ipfs/QmQvhvzMXKX71jLGjSfM9iKiWVKETXDmkPaQXhe4WrMmZ9/thumbnail-1280x720_2.png',
  'stats': {
    'likes': 0,
    'dislikes': 0
  },
  'uploader': {
    'address': '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
    'name': 'TED'
  },
  'tags': [
    'TEDTalk',
    'TEDTalks',
    'TED Talk',
    'TED Talks',
    'Jim Simons',
    'TED2015',
    'Human origins',
    'Investment',
    'Math',
    'Philanthropy',
    'Physics'
  ]
},{
  '_id': 'QmNhyQjsFW2Tvuz7CFwDTBPo3dfBQ3S4StEpfUZPSpK9FY',
  'title': 'Devcon2: Ethereum in 25 Minutes',
  'description': 'Presentation Slides Download: https://ethereumfoundation.org/devcon...\n\nDevcon2: Ethereum in 25 Minutes. Ethereum Foundation Chief Scientist, Vitalik Buterin, describes Ethereum.\nSpeakers: Vitalik Buterin\n\nEthereum Developer Conference, 2016 September 19 - 21,\nShanghai, China',
  'price': 0,
  'src': '/ipfs/QmU1f8mKebPzCHskk3DDsFUJLxFLVeCxJ1BqyhQvkV8FyJ',
  'mimetype': 'video/mp4',
  'thumb': '/ipfs/QmU1f8mKebPzCHskk3DDsFUJLxFLVeCxJ1BqyhQvkV8FyJ/thumbnail-1280x720_3.png',
  'stats': {
    'likes': 0,
    'dislikes': 0
  },
  'uploader': {
    'address': '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
    'name': 'Ethereum Foundation'
  },
  'tags': [
    'blockchain',
    'smart contracts',
    'distributed ledger',
    'Vitalik Buterin',
    'devcon2',
    'ethereum'
  ]
}]

describe('# Parartii-db Video Model Spec', function () {
  before((done) => {
    require('../src/server')
    setTimeout(() => {
      done()
    }, 1000)
  })

  it('should be able to insert 1 video and get it back.', (done) => {
    Video.upsert(fixtures[0], (err, vid) => {
      if (err) return done(err)
      assert.isOk(vid)
      done()
    })
  })

  it('should be able to insert multiple videos.', (done) => {
    Video.bulkUpsert(fixtures, (err, success) => {
      if (err) return done(err)
      assert.isOk(success)
      done()
    })
  })
})
