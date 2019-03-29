global.fetch = require('node-fetch')
const config = require('./config.json')
import * as GetSheetDone from 'get-sheet-done'
import { createFile, parseNameToNumericalId } from './helpers'

function mapas(){
	GetSheetDone.labeledCols(config.google_sheet_id, 5) // Mapas
		.then(data => {
			let output = []
			let raw = data.data
				.map(mapa => {
					return {
						"INDICADOR": mapa.indicador,
						"ID": Number(mapa.iddomapaqgis)
					}
				})
			
			const unique = raw
				.map(mapa => mapa.ID)
				.filter((value, id, array) => array.indexOf(value) === id && id)
			
			unique.forEach(id => {
				const layers = raw
					.filter(layer => layer.ID === id)
					.map(layer => layer.INDICADOR)
				output.push({
					//'nome': nome,
					'id': id,
					'layers': layers
				})
			})
			return output
		})
		.then( mapsArrayNoNames => {
			let outPutObject = {}
			let parsedResponse

			GetSheetDone.labeledCols(config.google_sheet_id, 6) // Mapas_nome
				.then(data => {
					data.data.forEach(item => {
						const idNumber = parseNameToNumericalId(item.iddomapaqgis)
						outPutObject[idNumber] = item.nome
					})
					// console.log(outPutObject)

					const mapsArrayWithNames = mapsArrayNoNames
						.map(item =>{
							item.name = outPutObject[item.id]
							return item
						})
					createFile(mapsArrayWithNames, './data-src/json/mapas.json')
				})
		})
		.catch(err => console.error(err)
	)
}

mapas()
