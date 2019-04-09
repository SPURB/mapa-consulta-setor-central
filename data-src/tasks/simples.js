global.fetch = require('node-fetch')
const config = require('../config.json')
import * as GetSheetDone from 'get-sheet-done'
import { createFile } from './helpers'

function simples(){
	GetSheetDone.labeledCols(config.google_sheet_id, 2) // KML_simples
		.then((data) => {
			const simples = data.data
			let output = simples
			.map(projeto => {
				// const rgba = projeto.rgba.split(',').map(color => Number(color)) // normalize colors
				return {
					"ID": Number(projeto.iddokml),
					"INDICADOR": projeto.indicador,
					"NOME": projeto.titulodacamadanomapainterativo,
					"DESCRIÇÃO": projeto.descricaodacamada,
					// "CORES": rgba,
					"ANO": 2019, //fake input
					"SECRETARIA": "MSP", //fake input
					"STATUS": 0, //fake input
					"AUTOR": "SP Urbanismo", //fake input
					"FONTE": "SP Urbanismo" //fake input
				}
			})
			.filter(projeto => projeto["ID"] > 0)

			let basesOutput = []
			let simplesOutput = []

			const baseIds = config.baseIds //  [ 201, 202, 204, 203, 205 ]


			output.forEach(item => {
				// if(item.ID === 201 || item.ID === 202){ basesOutput.push(item) } // 201 e 202 base layers
				if (baseIds.includes(item.ID)) basesOutput.push(item)
				else { simplesOutput.push(item) }
			})

			createFile(basesOutput, './data-src/json/bases.json')
			createFile(simplesOutput, './data-src/json/simples.json')

		})
		.catch(err => console.error(err)
	)
}

simples()
