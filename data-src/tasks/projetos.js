global.fetch = require('node-fetch')
const config = require('../config.json')
import * as GetSheetDone from 'get-sheet-done'
import directoryTree from 'directory-tree'
import { parseNameToNumericalId, createFile } from './helpers'

/**
* Create .data-src/json/projetos.json a tree of directories and files of data-src/projetos
* @param { String } input The folder to crawl
* @param { String } output The json file location
* @return { File } A json file from the folders directory tree 
*/
function getTree(input){
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
}


/**
 * Return { indicador: id }
 * @param {Array} tables [Number, Number]
 */
function createProjetos(tables, input){ //[2, 3] // 2 -> KML_simples; 3 -> Complexo
	let ids = []
	let indicadores = {}
	let counter = 0
	tables.forEach(table => {
		GetSheetDone.labeledCols(config.google_sheet_id, table)
			.then((data) => {
				data.data
					.forEach(projeto => {
						let obj = {}
						obj[Number(projeto.iddokml)] = projeto.indicador

						if(Object.values(obj)) { 
							indicadores[projeto.indicador] = Number(projeto.iddokml)
							ids.push(obj)
						}

					})
				counter++ 
				if(counter === tables.length){
					createFile(indicadores, './data-src/json/indicadores.json')
					return ids
				}
				else false
			})

			.then( ids => {
				if (ids) {
					const tree = getTree(input)
					const outputTree = tree.map(directory => {
						const dirId = directory.id.toString()

						const filteredIds = ids.filter(id => Object.keys(id)[0] === dirId)
						let indicadores

						if(filteredIds.length > 0) {
							indicadores = filteredIds.map(obj => Object.values(obj)[0])
						}
						else indicadores = false

						return {
							id: directory.id,
							indicadores: indicadores,
							name: directory.name,
							path: directory.path,
							children: directory.children,
							type: directory.type
						}
					})
					return outputTree
				}
			})
			.then(output => createFile(output, './data-src/json/projetos.json'))
			.catch(err => console.error(err)
		)
	})
}

createProjetos([2,3], './data-src/projetos')