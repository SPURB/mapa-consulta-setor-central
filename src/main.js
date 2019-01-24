import docReady from 'document-ready'
import { isNumber } from 'util'

import Map from 'ol/Map'
import View from 'ol/View'
import KML from 'ol/format/KML'
import {  Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js'
// import BingMaps from 'ol/source/BingMaps.js'
import VectorSource from 'ol/source/Vector.js'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import { containsExtent } from 'ol/extent'

/**
* content from data-src
*/
import { children as projetos } from '../data-src/projetos' // para atualizar data-src/projetos.jso e colocalizados.json -> 'npm run files'
import * as colocalizados from  '../data-src/colocalizados'

/**
* Render a template to the DOM
* @param {Node} template The element
* @param {Node} selector The element to inject
*/
function renderElement(template, selector) {
	var node = document.querySelector(selector);
	if (!node) return
	node.innerHTML = template
}

/**
* Create navigation options from data source (colocalizados.json)
* @param { Object } obj The colocalizados.json data
* @returns { Node } the <options> rendered in "#projetos"
*/
function createList(obj){
	let cleanList = [] 
	let list = "<option value='0'>-- Escolha --</option>"

	for (let projeto of Object.values(obj)){ 
		if(isNumber(projeto.id)){
			cleanList.push(projeto)
		}
	}
	cleanList.forEach( item => {
		list += '<option '+ "class='nav-projeto' " +"value='" +  item.id + "'>" + item.nome + '</option>'
	})
	renderElement(list, '#projetos')
}

/**
* Set id from choosed option and call fitToId()
* @param { Node } element to watch changes
* @param { Object } view an instance of View (new View) from open layers
* @param { Array } layers an array of layers (new Layer's) from open layers
*/
function getFromSelect(element, view, layers){
	element.onchange = () => {
		let idprojeto = element.options[element.selectedIndex].value	 // value tag from the DOM
		idprojeto = parseInt(idprojeto)

		try {
			fitToId(view, layers, idprojeto)
		}
		catch {
			return idprojeto + 'sem arquivos'
		} 
	}
}


/** 
Fit to id. Change current view fitting to a id
* @param { Object } view Instance of View (new View) from open layers
* @param  { Array } layers An array of layers (new Layer's) from open layers
* @param { Number } id An project id to fit in (injected in returnLayers() as projectId)
*/
function fitToId(view, layers, id){
	try {
		const layerToFit = layers.find( layer => layer.values_.projectId === id) 

		view.fit(layerToFit.getSource().getExtent(), {
			duration: 1500
		})
	}
	catch (error) {
		console.error(error)
	}
}

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

			if (projeto.name !== '00_base') {

				// Create projeto's layer
				files.forEach( file => {
					if(file.extension === '.kml'){
						const source = new VectorSource({
							url: app_url + file.path,
							format: new KML({ extractStyles: false })
						})

						const style = new Style({
							stroke: new Stroke({
								color: setRandomColor(),
								width: 2
							}),
							fill: new Fill({
								color: [255, 255, 255, 0]
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
			else if (projeto.name === '00_base'){
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

		// // Mapa base
		// const bingMaps = new TileLayer({
		// 	source: new BingMaps({
		// 	imagerySet: 'CanvasGray',
		// 	culture: 'pt-BR',
		// 	key: process.env.BING_API_KEY
		// 	})
		// })
		// layers.unshift(bingMaps)

		return layers
	}
	catch (error) { console.error(error) } 
}

/**
* Random color
* @return { String } A random HEX string 
*/
function setRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
		return color
}

/**
* Return the project name
* @param { Number } id The project id
* @param { Object } colocalizados  The colocalizados.json data
* @return { String } The project name
*/
function getProjectName(id, colocalizados){
	let output = false
	for (let projeto in colocalizados){
		if (colocalizados[projeto].id === id) { 
			output = colocalizados[projeto].nome 
		}
	}
	return output
}

/**
* Return the smaller extent from a Array of extents
* @param { Array } extents An array of coordinates arrays. Ex. -> [[x, y], [x1, y1]]
* @return { Array } Single array
*/
function smallerExtent(extents) {
	let dontContain = extents[0]
	extents.forEach( extent => {
		if( dontContain !== extent ) { 
			containsExtent(dontContain, extent) 
			if (containsExtent(dontContain, extent)) { dontContain = extent }
		}
	})
	return dontContain
}


docReady(() => {
	/*
	render map
	*/
	const thisMapLayers = returnLayers(projetos, process.env.APP_URL)

	let view = new View({
		center: [ -5193050.487352, -2693402.011056 ],
		projection: 'EPSG:3857',
		zoom: 13
	})


	let map = new Map({
		layers: thisMapLayers,
		loadTilesWhileAnimating: true,
		target: document.getElementById('map'),
		view: view
	})

 	map.on('singleclick', evt => {
		let extents = []
		map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
			const projectjId = layer.values_.projectId  
			if(projectjId !== 0) { // exclui a base
				extents.push(layer.getSource().getExtent())
			}
		})
		view.fit(smallerExtent(extents), {
			duration: 1000
		})
	})


	/*
	init app
	*/
	let fitToBaseLayer = new Promise( (resolve) => {
		// map.on('postrender', evt => {
			setTimeout(() => fitToId(view, thisMapLayers, 0), 1500 )
		// })
	})

	Promise.all([
		createList(colocalizados), 
		getFromSelect(document.getElementById("projetos"), view, thisMapLayers)
	])
	.then( () => fitToBaseLayer )
	.catch( erro => console.error(error) ) 
})
