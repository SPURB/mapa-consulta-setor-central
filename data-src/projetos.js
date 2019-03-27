global.fetch = require('node-fetch')
const config = require('./config.json')
import * as GetSheetDone from 'get-sheet-done'

import fs from 'fs'
import directoryTree from 'directory-tree'
import { parseNameToNumericalId } from './helpers'

/**
* Create .data-src/json/projetos.json a tree of directories and files of data-src/projetos
* @param { String } input The folder to crawl
* @param { String } output The json file location
* @return { File } A json file from the folders directory tree 
*/
function getTree(input){
	// const files = JSON.stringify( directoryTree(input, { normalizePath: true, extensions: /\.(jpg|gif|png|svg|kml)$/ }) )
	const tree = directoryTree(input, { normalizePath: true, extensions: /\.(jpg|gif|png|svg|kml)$/ })
	let files = tree.children.map(file => {
		return { 
			id: parseNameToNumericalId(file.name),
			name: file.name,
			path: file.path,
			children: file.children,
			type: file.type
		}
	})
	return files
	// console.log(files)

	// console.log(files)

	// for (let file in protoFiles) {
	// 	console.log(file)
	// 	// console.log(parseNameToNumericalId(file.name))
	// }

	// fs.writeFile(output, files, 'utf8', err => {
	// 	if(err) console.error(err)
	// 	else console.log(output, 'atualizado')
	// })
}


/**
 * Return { indicador: id }
 * @param {Array} tables [Number, Number]
 */
function idsAndIndicadores(tables, input){ //[3, 4] // 3 -> KML_simples; 4-> Complexo
	let output = []
	let counter = 0
	tables.forEach(table => {
		GetSheetDone.labeledCols(config.google_sheet_id, table)
			.then((data) => {
				data.data
					.forEach(projeto => {
						// output[projeto.indicador] = Number(projeto.iddokml)
						let obj = {}
						obj[projeto.indicador] = Number(projeto.iddokml)
						output.push(obj)
					})
				counter++ 
				if(counter === tables.length){
					return output
				}
			})

			.then( output => {
				console.log(output)
				// const tree = getTree(input)
				// tree.map(directory => {
					


				// 	// return {
				// 	// 	id: directory.id,
				// 	// 	name: directory.name,
				// 	// 	path: directory.path,
				// 	// 	children: directory.children,
				// 	// 	type: directory.type
				// 	// }
				// })

			})
			.catch(err => console.error(err)
		)
	})
}

idsAndIndicadores([3,4], './data-src/projetos')

// console.log(getTree('./data-src/projetos'))
//output , './data-src/json/projetos.json'