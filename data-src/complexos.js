global.fetch = require('node-fetch')
const config = require('./config.json')
import * as GetSheetDone from 'get-sheet-done'
import fs from 'fs'

function complexo(){
	GetSheetDone.labeledCols(config.google_sheet_id, 4) // KML_complexo
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

			let outputIds = JSON.stringify({ ids: uniqueIds })

			fs.writeFile(`./data-src/json/complexosIds.json`, outputIds, err => {
				if(err) console.error(err)
				else{ console.log(`./data-src/json/complexosIds.json` + ' atualizado') }
			})

			fs.writeFile(`./data-src/json/complexos.json`, JSON.stringify(output), err => {
				if(err) console.error(err)
				else{ console.log(`./data-src/json/complexos.json` + ' atualizado') }
			})


			// uniqueIds.forEach(id => {
			// 		const projectPerId = output.filter(project => project.ID === id)
			// 		const json = JSON.stringify(projectPerId)
			// 		const filePath = `./data-src/json/${id}.json`

			// 		fs.writeFile(filePath, json, 'utf8', err => {
			// 			if(err){
			// 				console.error(err)
			// 			}
			// 			else{ console.log(filePath + ' atualizado') }
			// 		})
			// })

		}).catch(err => console.error(err)
	)
}
complexo()