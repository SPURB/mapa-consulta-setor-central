import fs from 'fs'
import directoryTree from 'directory-tree'

/**
* Create .data-src/json/projetos.json a tree of directories and files of data-src/projetos
* @param { String } input The folder to crawl
* @param { String } output The json file location
* @return { File } A json file from the folders directory tree 
*/
function createProjetosFromFolder(input, output){
	const files = JSON.stringify( directoryTree(input, { normalizePath: true, extensions: /\.(jpg|gif|png|svg|kml)$/ }) )
	
	fs.writeFile(output, files, 'utf8', err => { 
		if(err) console.error(err)
		else console.log(output, 'atualizado')
	})
}

createProjetosFromFolder('./data-src/projetos', './data-src/json/projetos.json')
