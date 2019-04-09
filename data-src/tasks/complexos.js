global.fetch = require('node-fetch')
const config = require('../config.json')
import * as GetSheetDone from 'get-sheet-done'
import { createFile } from './helpers'

function complexo(){
	GetSheetDone.labeledCols(config.google_sheet_id, 3) // KML_complexo
		.then((data) => {
			const output = data.data
			.map(projeto => {
				return {
					"ID": Number(projeto.iddokml),
					"INDICADOR": projeto.indicador,
					"NOME": projeto.titulodacamadanomapainterativo,
					"DESCRIÇÃO": projeto.descricaodacamada,
					"VALORES": [ projeto.nomedacoluna, projeto.valorvisivel ],
					"ANO": 2019, //fake input
					"SECRETARIA": "MSP", //fake input
					"STATUS": 0, //fake input
					"AUTOR": "SP Urbanismo", //fake input
					"FONTE": "SP Urbanismo" //fake input
				}
			})

			const uniqueIds = output
				.map(project => project.ID)
				.filter((value, id, array) => array.indexOf(value) === id)

			createFile({ ids: uniqueIds }, './data-src/json/complexosIds.json')
			createFile(output, './data-src/json/complexos.json')

		}).catch(err => console.error(err)
	)
}
complexo()