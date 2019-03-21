import {  Tile as TileLayer } from 'ol/layer'
import BingMaps from 'ol/source/BingMaps.js'
import { setLayer } from './helpers'
import { parseNameToNumericalId } from '../domRenderers'


/**
 * 
 */
function createBaseParams(projetos){
	console.log(projetos)
}

/**
* Create all layers for app
* @param { Object } projeto Base objects from projetos.json tree of /data-src/projetos/
* @param { Array } otherProjetos Bases objects from projetos.json (not the principal base)
* @param { String } app_url Url of this app (not attached to this app)
* @param { Boolean } bing True if render bingMaps
* @return { Array } Array of new Layers's (from Open Layers) to create de base	
*/
function returnBases(projeto, otherProjetos, app_url, bing){
	let kmlLayers = []
	const files = projeto.info.children

	files.forEach( file => {
		const path = app_url + file.path

		if(file.extension === '.kml'){
			kmlLayers.unshift({
				layer: setLayer(file, path, projeto.id, {
					lineDash: [5]
				})
			})
		}
	})

	otherProjetos
		.forEach(projeto => {
			console.log(projeto)
			let customDistritosStyle = projeto.id === 202 ?
				{ color: [0, 0, 0, 0.1] } :
				false

			projeto.info.children.forEach(file => {
				const url = app_url + file.path
				if(file.extension === '.kml'){
					kmlLayers.unshift({
						layer: setLayer(file, url, projeto.id, customDistritosStyle)
					})
				}
			})
		})

	const layers = kmlLayers.map(vector => vector.layer)

	if (bing) { // Base with Bing maps tile, set false to develop
		const bingMaps = new TileLayer({
			title:"Base Bing Maps",
			source: new BingMaps({
			imagerySet: 'CanvasGray',
			culture: 'pt-BR',
			key: process.env.BING_API_KEY,
			type: 'base'
			})
		})
		layers.unshift(bingMaps)
	}
	return layers
}

export { createBaseParams, returnBases }