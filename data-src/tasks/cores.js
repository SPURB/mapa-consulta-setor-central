global.fetch = require('node-fetch')
const config = require('../config.json')
import * as GetSheetDone from 'get-sheet-done'
import { createFile } from './helpers'

function cores(){
	let outputColors = {}
	const tables =[3, 4] // 3 -> KML_simples; 4-> Complexo
	let counter = 0

	tables.forEach(table => {
		GetSheetDone.labeledCols(config.google_sheet_id, table)
			.then((data) => {
				data.data
					.forEach(projeto => {
						let id = Number(projeto.iddokml)
						const colors = projeto.rgba
						const rgba = colors.split(',').map(color => Number(color))
						// if(table === 3) outputColors[id] = rgba
						// if(table === 4) {
							const indicador = projeto.indicador 
							outputColors[indicador] = rgba
						// }
					})
				counter++ 
			})
			.then( () => { if(counter === 2) createFile(outputColors, './data-src/json/cores.json') })
			.catch(err => console.error(err)
		)
	})

}
cores()
