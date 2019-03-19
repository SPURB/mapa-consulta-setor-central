// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require('babel-register')({
	presets: [ 'env' ]
})

// Import the rest of our application.
// module.exports = require('./tree.js')
module.exports = require('./mapas.js')
module.exports = require('./simples.js')
module.exports = require('./complexos.js')
