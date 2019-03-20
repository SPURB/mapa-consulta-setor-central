import {  Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import BingMaps from 'ol/source/BingMaps.js'
import VectorSource from 'ol/source/Vector.js'
import KML from 'ol/format/KML'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'


/**
* Create all layers for app
* @param { Object } projeto Base objects from projetos.json tree of /data-src/projetos/
* @param { Array } otherBaseInfos Bases objects from projetos.json (not the principal base)
* @param { String } app_url Url of this app (not attached to this app)
* @param { Boolean } bing True if render bingMaps
* @return { Array } Array of new Layers's (from Open Layers) to create de base	
*/
function returnBases(projeto, otherBaseInfos, app_url, bing){
	let kmlLayers = []

	const files = projeto.info.children
	files.forEach( file => {
		if(file.extension === '.kml'){
			kmlLayers.unshift({
				layer: setLayer(file, app_url + file.path, projeto.id)
			})
		}
	})

	console.log(otherBaseInfos)
	const otherBaseFiles = otherBaseInfos[0].children
	otherBaseFiles.forEach( file => {
		if(file.extension === '.kml'){
			kmlLayers.unshift({
				layer: setLayer(file, app_url + file.path, 202)
			})
		}
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

/**
 * Return open layer source and file from kml file
 * @param { Object } file projetos.json single object
 * @param { String } path kml file complete path
 * @returns { Object } Open Layer layer instance
 */
function setLayer(file, path, id){
	// console.log(file)
	// console.log(path)
	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	const style = new Style({
		stroke: new Stroke({
			color: [0, 0, 0, 1],
			width: 1,
			lineDash: [5]
		}),
		fill: new Fill({
			color: [255, 255, 255, 0]
		})
	})

	return new VectorLayer({
		title: file.name,
		source: source,
		style: style,
		projectId: id // 201 => base
	})
}

export { returnBases }