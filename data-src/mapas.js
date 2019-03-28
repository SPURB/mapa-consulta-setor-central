global.fetch = require('node-fetch')
const config = require('./config.json')
import * as GetSheetDone from 'get-sheet-done'
import { createFile } from './helpers'

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

			createFile(output, './data-src/json/mapas.json')
		})
		.catch(err => console.error(err)
	)
}

mapas()
