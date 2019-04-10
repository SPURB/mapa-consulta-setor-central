import {  Tile as TileLayer } from 'ol/layer'
import BingMaps from 'ol/source/BingMaps.js'
import { setLayer } from './helpers'
import { parseNameToNumericalId } from '../domRenderers'


/**
 * Return projeto from projetos.json ({info}) -> main base
 * and collection of projetos from json - other bases
 */
function createBaseInfos(projetos, id, ids){
	const info = projetos.find(projeto => parseNameToNumericalId(projeto.name) === id)

	let infos = []
	ids.forEach(item => {
		infos.push(projetos.find(projeto => parseNameToNumericalId(projeto.name) === item.id))
	})

	infos = infos.map(projeto => { 
		const id = parseNameToNumericalId(projeto.name) 
		const indicador = ids.find(item => item.id === id).indicador
		return { 
			info: projeto, 
			id: id,
			indicador: indicador
		}
	})

	return { 
		info: info,
		infos: infos
	}
}

/**
* Create all layers for app
* @param { Object } projeto Base objects from projetos.json tree of /data-src/projetos/
* @param { Array } otherProjetos Bases objects from projetos.json (not the principal base)
* @param { String } app_url Url of this app (not attached to this app)
* @param { Boolean } bing True if render bingMaps
* @return { Array } Array of new Layers's (from Open Layers) to create de base	
*/
function returnBases(projeto, otherProjetos, app_url, idColors, bing){
	let kmlLayers = []
	const files = projeto.info.children

	files.forEach( file => {
		const path = app_url + file.path
		const strId = projeto.id.toString()
		const color = idColors[strId]
	
		if(file.extension === '.kml'){
			kmlLayers.unshift({
				layer: setLayer(file, path, projeto, {
					lineDash: [5],
					color: color
				})
			})
		}
	})

	otherProjetos
		.forEach(projeto => {
			const strId = projeto.id.toString()
			const color = idColors[strId]

			projeto.info.children.forEach(file => {
				const url = app_url + file.path
				if(file.extension === '.kml'){
					kmlLayers.unshift({
						layer: setLayer(file, url, projeto, {
							color: color,
							width: 0.1
						})
					})
				}
			})
		})

	const layers = kmlLayers.map(vector => vector.layer)

	if (bing) { // Base with Bing maps tile, set false to develop
		const bingMaps = new TileLayer({
			title:"Base Bing Maps",
			source: new BingMaps({
			//https://docs.microsoft.com/en-us/bingmaps/rest-services/imagery/get-a-static-map
			imagerySet: 'CanvasGray', // Aerial, AerialWithLabels, AerialWithLabelsOnDemand, CanvasDark, CanvasLight, CanvasGray, Road, Streetside 
			culture: 'pt-BR',
			key: process.env.BING_API_KEY,
			type: 'base'
			})
		})
		layers.unshift(bingMaps)
	}
	return layers
}

export { createBaseInfos, returnBases }