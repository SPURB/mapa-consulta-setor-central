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
	
	let validObjs = []
	Object.values(simples).forEach(value => { if(value.ID) { 
		validObjs.push({ 
			id: value.ID,
			name: value.NOME,
			indicador: value.INDICADOR
		})
	} }) 

	validObjs.forEach(valid => {
		const files = projetos.find(obj => parseNameToNumericalId(obj.name) === valid.id).children
		files.forEach(file => {
			if(file.extension === '.kml') {
				const url = app_url + file.path
				kmlLayers.push({
					layer: setLayer(valid.name, url, {id: valid.id, indicador: valid.indicador})
				})
			}
		})
	})
	const layers = kmlLayers.map(vector => vector.layer)
	return layers
}

export { returnSimples }