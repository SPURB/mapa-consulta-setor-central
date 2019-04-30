global.fetch = require('node-fetch')
const config = require('../config.json')
import * as GetSheetDone from 'get-sheet-done'
import { createFile, parseNameToNumericalId } from './helpers'

function mapas(){
	GetSheetDone.labeledCols(config.google_sheet_id, 4) // Mapas
		.then(data => {
			let output = []
			let raw = data.data
				.map(mapa => {
					return {
						"INDICADOR": mapa.indicador,
						"ID": Number(mapa.idmapaqgis)
					}
				})

			const unique = [...new Set(raw.map(mapa => mapa.ID))] // return unique ids
				// .map((value, id, array) => console.log(array.indexOf(value)))
				// .filter((value, id, array) => array.indexOf(value) === id && id)
				

			// console.log(raw)
			// console.log()

			unique.forEach(id => {
				const layers = raw
					.filter(layer => layer.ID === id)
					.map(layer => layer.INDICADOR)
				output.push({
					'id': id,
					'layers': layers
				})
			})

			return output
		})
		.then(mapsArrayNoNames => {
			let outPutObject = {}

			GetSheetDone.labeledCols(config.google_sheet_id, 5) // Mapas_nome
				.then(data => {
					data.data.forEach(item => {
						const idNumber = parseNameToNumericalId(item.idmapaqgis)
						outPutObject[idNumber] = {
							name: item.nome,
							legenda: item.legenda
						}
					})

					const mapsArrayWithNames = mapsArrayNoNames
						.map(item =>{
							item.name = outPutObject[item.id].name
							item.legenda = 'data-src/legendas/' + outPutObject[item.id].legenda
							return item
						})
					return mapsArrayWithNames
				})
				.then(maps => createFile(maps, './data-src/json/mapas.json'))
		})
		.catch(err => console.error(err)
	)
}

mapas()
