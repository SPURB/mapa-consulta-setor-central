"use strict"
import {  Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import BingMaps from 'ol/source/BingMaps.js'
import VectorSource from 'ol/source/Vector.js'
import KML from 'ol/format/KML'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'

/**
* Create all layers for app
* @param { Object } projeto Base objects from projetos.json 
* @param { String } app_url Url of this app (not attached to this app)
* @param { Boolean } bing True if render bingMaps
* @return { Array } Array of new Layers's (from Open Layers) to create de base	
*/
function returnBases(projeto, app_url, bing){
	try{
		let kmlLayers = []
		const files = projeto.children
		files.forEach( file => {
			if(file.extension === '.kml'){
				const source = new VectorSource({
					url: app_url + file.path,
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

				kmlLayers.unshift({
					layer: new VectorLayer({
						title: file.name,
						source: source,
						style: style,
						projectId: 0 // 0 => base
					})
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
	catch (error) { console.error(error) } 
}

export { returnBases }