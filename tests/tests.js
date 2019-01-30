import { projetos, colocalizados  } from '../src/model'

import { returnLayers, layerColors } from '../src/presenter'

returnLayers(projetos, process.env.APP_URL)

console.log(layerColors)

// console.log(projetos)
// console.log(colocalizados)

// for (let prj in colocalizados) {
// 	// console.log(colocalizados[prj].ID)
// 	const found = projetos.find( projeto => {
// 		// console.log(parseInt(projeto.name.substring(0,3).replace(/[^\d]/g, '')))
// 		colocalizados[prj].ID === parseInt(projeto.name.substring(0,3).replace(/[^\d]/g, ''))
// 	})
// 	console.log(found)
// }