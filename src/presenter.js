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
* @param { Array } projetos Array of objects from projetos.json 
* @param { String } app_url Url of this app (not attached to this app)
* @return { Array } Array of New Layers's (from Open Layers) instances with idprojeto setted (layers[index].values_.projectId)
*/
function returnLayers(projetos, app_url){
	try{
		let kmlLayers = []
		projetos.forEach(projeto => { 
			const files = projeto.children

			let projectId = projeto.name.substring(0,3) // "1_a", "2_m", "05_"
			projectId = projectId.replace(/[^\d]/g, '')  // "1", "2", "5"
			projectId = parseInt(projectId) // 1, 2, 5

			if (projectId !== 0) { // not the base

				files.forEach( file => { // Create projeto's layer
					if(file.extension === '.kml'){
						const source = new VectorSource({
							url: app_url + file.path,
							format: new KML({ extractStyles: false })
						})

						const red = getRandomInt(0,255)
						const green = getRandomInt(0,255)
						const blue = getRandomInt(0,255)

						setLayerColors(projectId,[red, green, blue], .25)
						// const baseColor =  [ red, green, blue, .3 ] // setRandomColor(projectId)

						// const baseColor = setRandomColor(projectId)

						const style = new Style({
							stroke: new Stroke({
								color: [red, green, blue, 0.25],//baseColor,
								width: 2
							}),
							fill: new Fill({
								color: [red, green, blue, 0.25]
							})
						})

						kmlLayers.push({
							layer: new VectorLayer({
								source: source,
								style: style, 
								projectId: projectId // set id from the folder name 
							}) 
						})
					}
				})
			}

			// Create base layers
			else if (projectId === 0){ // 0 == base layer
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
								source: source,
								style: style,
								projectId: projectId // set id from the folder name 
							})
						})
					}
				})
			}
		})
		const layers = kmlLayers.map(vector => vector.layer)

		// Mapa base
		const bingMaps = new TileLayer({
			source: new BingMaps({
			imagerySet: 'CanvasGray',
			culture: 'pt-BR',
			key: process.env.BING_API_KEY
			})
		})
		layers.unshift(bingMaps)

		return layers
	}
	catch (error) { console.error(error) } 
}

/**
* @return { Object } Setted by setRandomColor(id) to associate id and random colors
*/
let layerColors = {}

/**
* Get random int number
* @param { Number } min Minimun value
* @param { Number } max Max value
* @return { Number } A random number between min and max 
*/
function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min)) + min
}

/**
* Set layerColors
* @param { Number } id Project id
* @param { Array } rgb Numbers representing the rgb value. Ex -> [red, green, blue]
* @param { Number } alpha Float number representing the opacity
* @return { Object } { "id": [r, g, b, a]}
*/
function setLayerColors( id, rgb, alpha) {
	layerColors[id] = [ rgb[0], rgb[1], rgb[2], alpha ]
}


/**
* Return the project data
* @param { Number } id The project id
* @param { Object } colocalizados  The colocalizados.json data
* @return { Object } The project data
*/
function getProjectData(id, colocalizados){
	let output = false
	for (let projeto in colocalizados){
		if (colocalizados[projeto].ID === id) { 
			output = colocalizados[projeto] 
		}
	}
	return output
}

export {
    returnLayers, 
	getProjectData,
	layerColors
}