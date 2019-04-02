import fs from 'fs'

function setup(dir) { !fs.existsSync(dir) && fs.mkdirSync(dir) }

setup('./data-src/json/')