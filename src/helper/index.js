var prettyjson = require('prettyjson')

module.exports.log = function (args) {
  console.log(args)
}

module.exports.logEvents = function (log, message) {
  console.log('|      ' + message)
  console.log('|          ####### here the log: #######              ')
  console.log('|                                                     ')
  console.log(prettyjson.render(log))
  console.log('|                                                     ')
  console.log('|          ####### end of the log #######             ')
}

module.exports.wellcomeLogo = function (log, ipfsData) {
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                              0000  0000 ')
  console.log('      0x00                                                                                             00     xxxx  0xxxx')
  console.log('      0xxxxx00                                                                                       xxxx0               ')
  console.log('      0xxxxxxxx0                        0xxx00xxxxx00      00xxxx00xxxx  0000000x0   00xxxx000xxx  0xxxxxxxxxxxxxx0 0xxx0')
  console.log('      0xxxxx00           0xxx           0xxxxxxxxxxxxx0  0xxxxxxxxxxxxx  0xxxxxxx0 0xxxxxxxxxxxxx  xxxxxxxxxxxxxxx0 0xxx0')
  console.log('      0xx00          00xxxxxx           0xxxx0    0xxxx 0xxxx0    0xxxx  0xxxxx0000xxxx0    0xxxx    xxxx0    xxxx0 0xxx0')
  console.log('                  00xxxxxxxxx           0xxx0      xxxx00xxx0      xxxx  0xxx0    0xxx0      xxxx    xxxx0    0xxx0 0xxx0')
  console.log('              00xxxxxxxxxxxxx           0xxxx0    0xxxx 0xxxx0    0xxxx  0xxx0    0xxxx0    0xxxx    0xxx0    0xxx0 0xxx0')
  console.log('           00xxxxxxxxxxxxxxxx           0xxxxxxxxxxxxx0  0xxxxxxxxxxxxx  0xxx0     0xxxxxxxxxxxxx    0xxxxxx  0xxx0 0xxx0')
  console.log('       00xxxxxxxxxxxxxxxxxxxx           0xxxx00xxxx00      0xxxxxx0xxxx  0xxx0       00xxxxx0xxxx     00xxxx  0xxx0 0xxx0')
  console.log('      0xxxxxxxxxxxxxxxxxxxx0            0xxx0                                                                            ')
  console.log('      xxxxxxxxxxxxxxxxx00               0xxx0                                                                            ')
  console.log('      xxxxxxxxxxxxxx00                  00000                                                                            ')
  console.log('      xxxxxxxxxx00                                                                                                       ')
  console.log('      xxxxxxx00                                                                                                          ')
  console.log('      xxx00                                                                                                              ')
  console.log('      00                                                                                                                 ')
  console.log('                                                                                                                         ')
  console.log('            _    _____  _____  _____  _____  _____  _____                                                                ')
  console.log('       ___ | |_ |   __||   __|| __  ||  |  ||   __|| __  |                                                               ')
  console.log('      | . || . ||__   ||   __||    -||  |  ||   __||    -|                                                               ')
  console.log('      |___||___||_____||_____||__|__| \\___/ |_____||__|__|                                                              ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
}

module.exports.envParams = function (provider, registry, port) {
  console.log('|      Paratii obSERVER running in ' + process.env.NODE_ENV + ' mode')
  console.log('|      is obSERVING the current provider:' + provider)
  console.log('|      and the Paratii Registry at:' + registry)
  console.log('|      API rest interface available at ' + port)
}