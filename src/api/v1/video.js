'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Video = Models.video
const Challenge = Models.challenge
const Vote = Models.vote
const Json2csvParser = require('json2csv').Parser

router.get('/:id/related', (req, res, next) => {
  // get related videoss
  // res.json({status: 'not yet implemented'})
  Video.getRelated(req.params.id, (err, videos) => {
    if (err) {
      return res.send(err)
    }

    return res.json(videos)
  })
})

/**
 * get video by _id
 * @param {String}  id  video _id
 */

router.get('/:id', async (req, res, next) => {
  let video = await Video.findOne({_id: req.params.id})
  if (!video) {
    res.send({})
    return
  }
  let clonedVideo = JSON.parse(JSON.stringify(video))
  let clonedChallenge
  if (clonedVideo && clonedVideo.tcrStatus !== undefined) {
    clonedVideo.tcrStatus.name = 'appWasMade'
    let challenge = await Challenge.findOne({listingHash: clonedVideo.listingHash})
    if (challenge) {
      clonedChallenge = JSON.parse(JSON.stringify(challenge))

      clonedVideo.tcrStatus.data.challenge = clonedChallenge
      if (clonedVideo.tcrStatus.data.staked) {
        clonedVideo.tcrStatus.name = 'appWasMade'
      }
      let votes = await Vote.aggregate([
        {
          $match: {
            pollID: clonedChallenge.id,
            voteRevealed: {'$ne': null}
          }
        },
        {
          $group: {
            _id: '$pollID',
            votesFor: {$sum: '$choice'},
            totalVotes: {$sum: 1}
          }
        }
      ]
      )

      if (votes.length > 0) {
        let clonedVote = JSON.parse(JSON.stringify(votes[0]))
        delete clonedVote._id

        clonedVote.votesAgainst = clonedVote.totalVotes - clonedVote.votesFor
        clonedVideo.tcrStatus.data.challenge = Object.assign(clonedChallenge, clonedVote)
      }
    }
  } else {
    clonedVideo.tcrStatus = {}
    clonedVideo.tcrStatus.name = 'notInTcr'
  }

  res.json(clonedVideo)
})

/**
 * Get all video or seach
 */

router.get('/', (req, res, next) => {
  const cleanReq = JSON.parse(JSON.stringify(req.query))

  delete cleanReq.format
  delete cleanReq.download

  Video.search(cleanReq, (err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }
    // TODO: add query params, total, start, limit and results

    if (req.query.format === 'csv') {
      const fields = ['id', 'title', 'description', 'price', 'duration', 'author', 'createBlockNumber', 'filesize']
      const json2csvParser = new Json2csvParser({fields})

      const csv = json2csvParser.parse(result.results)
      if (req.query.download) {
        res.setHeader('Content-disposition', 'attachment; filename=data.csv')
        res.set('Content-Type', 'text/csv')
      }

      res.status(200).send(csv)
    } else {
      return res.json(result)
    }
  })
})

module.exports = router
