import fs from 'fs';
import directoryTree from 'directory-tree';

const files = JSON.stringify( directoryTree('./data-src/projetos') )
const output= './data-src/projetos.json'

fs.writeFile(output, files, 'utf8', err => { 
    if(err) console.log(err)
    else console.log('created: ' + output)
} )
