global.fetch = require('node-fetch')
const config = require('./config.json')
import * as GetSheetDone from 'get-sheet-done'
import fs from 'fs'

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

			const json = JSON.stringify(output)
			fs.writeFile(`./data-src/json/mapas.json`, json, err => {
				if (err) console.err(err)
				else console.log('./data-src/json/mapas.json atualizado')
			})
		})
		.catch(err => console.error(err)
	)


	// GetSheetDone.labeledCols(config.google_sheet_id, 6) // Mapas_nomes
	// 	.then(data => {
	// 		const nomes = data.data
	// 		.map(mapa => {
	// 			return {
	// 				"INDICADOR": mapa.indicador,
	// 				"ID": Number(mapa.iddomapaqgis)
	// 			}
	// 		})

	// 		const unique = raw
	// 			.map(mapa => mapa.ID)
	// 			.filter((value, id, array) => array.indexOf(value) === id && id)
	// 	})

}

mapas()
