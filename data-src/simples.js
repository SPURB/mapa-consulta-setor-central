global.fetch = require('node-fetch')
const config = require('./config.json')
import * as GetSheetDone from 'get-sheet-done'
import fs from 'fs'

function simples(){
	GetSheetDone.labeledCols(config.google_sheet_id, 3) // KML_simples
		.then((data) => {
			const simples = data.data
			let output = simples
			.map(projeto => { 
				return {
					"ID": Number(projeto.iddokml),
					"INDICADOR": projeto.indicador,
					"NOME": projeto.titulodacamadanomapainterativo,
					"DESCRIÇÃO": projeto.descricaodacamada,
					"ANO": 2019, //fake input
					"SECRETARIA": "MSP", //fake input
					"STATUS": 0, //fake input
					"AUTOR": "SP Urbanismo", //fake input
					"FONTE": "SP Urbanismo" //fake input
				}
			})
			const json = JSON.stringify(output)
			const filePath = './data-src/json/simples.json'
			
			fs.writeFile( filePath, json, 'utf8', err => {
				if(err){
					console.log(err);
				}
			})
			console.log(filePath + ' atualizado')

		})
		.catch(err => console.error(err)
	)
}

simples()