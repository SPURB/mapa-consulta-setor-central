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
				return {
					"ID": Number(projeto.iddokml),
					"INDICADOR": projeto.indicador,
					"NOME": projeto.titulodacamadanomapainterativo,
					"DESCRIÇÃO": projeto.descricaodacamada,
					"IMAGEM": projeto.iddaimagem
				}
			})
			.filter(projeto => projeto.ID > 0)

			let basesOutput = []
			let simplesOutput = []

			const baseIds = config.baseIds //  [ 201, 202, 204, 203, 205 ]

			output.forEach(item => {
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
