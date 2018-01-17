/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const Paratii = require('paratii-lib').Paratii
const accounts = require('./data/accounts')
const assert = chai.assert

// const assert = chai.assert
// const expect = chai.expect
chai.use(dirtyChai)

describe('# Paratii-db Observer', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('paratii lib okness', async function () {
    assert.isOk(paratii)
  })
})
