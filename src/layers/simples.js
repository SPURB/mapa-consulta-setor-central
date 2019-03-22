import { setLayer } from './helpers'
import { parseNameToNumericalId } from '../domRenderers'

/**
* Create all layers for app
* @param { Object } projetos The projetos.json tree of /data-src/projetos/
* @param { Object } simples The simples.json data
* @param { String } app_url Url of this app (not attached to this app)
* @return { Array } Array of new Layers's (from Open Layers) to create de base
*/
function returnSimples(projetos, simples, app_url){
	let kmlLayers = []
	
	let ids = []
	Object.values(simples).forEach(value => { if(value.ID) ids.push(value.ID) }) //set valid ids

	const idsAndFiles = projetos
		.map(projeto => {
			return { 
				id: parseNameToNumericalId(projeto.name),
				files: projeto.children,
				name: projeto.INDICADOR
			}
		})
		.filter(projeto => ids.includes(projeto.id))

	idsAndFiles.forEach(projeto => {

// 		let customDistritosStyle = projeto.id === 202 ?
// 			{ color: [0, 0, 0, 0.1] } :
// 			false

		projeto.files.forEach(file => {
			const url = app_url + file.path
				if(file.extension === '.kml'){
					kmlLayers.push({
						layer: setLayer(file.name, url, projeto.id)
					})
				}
		})
	})
	const layers = kmlLayers.map(vector => vector.layer)
	return layers
}


// /**
// * @return { Object } Setted by setRandomColor(id) to associate id and random colors
// */
// let simpleLayersColors = {}

/**
* Set layerColors
* @param { Number } id Project id
* @param { Array } rgb Numbers representing the rgb value. Ex -> [red, green, blue]
* @param { Number } alpha Float number representing the opacity
* @return { Object } { "id": [r, g, b, a]}
*/
// function setLayerColors( id, rgb, alpha) {
// 	layerColors[id] = [ rgb[0], rgb[1], rgb[2], alpha ]
// }

export { returnSimples } //simpleLayersColors }