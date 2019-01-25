import { isNumber } from 'util'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { projetos, colocalizados  } from './model'
import {  returnLayers,  getProjectName, smallerExtent } from './controllers'

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


docReady(() => {
	const thisMapLayers = returnLayers(projetos, process.env.APP_URL)

	let view = new View({
		center: [ -5190695.271418285, -2696956.332871481 ],
		projection: 'EPSG:3857',
		zoom: 13
	})

	let map = new Map({
		layers: thisMapLayers,
		loadTilesWhileAnimating: true,
		target: document.getElementById('map'),
		view: view
	})

	/*
	render map
	*/
	map.on('singleclick', evt => {
		let extents = []
		map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
			const projectjId = layer.values_.projectId  
			if(projectjId !== 0) { // exclui a base
				extents.push(layer.getSource().getExtent())
			}
		})
		view.fit(smallerExtent(extents), { // fit to smaller extent 
			duration: 1000
		})
	})

	/*
	after render, initiate app
	*/
	let fitToBaseLayer = new Promise( (resolve) => {
		setTimeout(() => {
			fitToId(view, thisMapLayers, 0)
		}, 1500 )
	})

	Promise.all([
		createList(colocalizados), 
		getFromSelect(document.getElementById("projetos"), view, thisMapLayers)
	])
	.then( () => fitToBaseLayer )
	.catch( error => console.error(error) )
})
