"use strict";
import { isNumber } from 'util'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { projetos, colocalizados  } from './model'
import {  returnLayers,  layerColors } from './presenter'
import { containsExtent } from 'ol/extent'

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
	let list = ""

	for (let projeto of Object.values(obj)){ 
		if(isNumber(projeto.ID)){
			cleanList.push(projeto)
		}
	}
	cleanList.forEach( item => {
		if(layerColors[item.ID] === undefined){
			list += '<li '+">" + "<input type='button' value='" + item.NOME +"' inputid=" + item.ID + ">" + '</li>'
		}
		else{
			list += '<li style="border-color:'+ layerColors[item.ID] +'">' + "<input type='button' value='" + item.NOME +"' inputid=" + item.ID + ">" + '</li>'
		}
	})
	renderElement(list, '#projetos')
}

/**
* Set eventLestener to run fitToId for menu list items
* @param { Node } element to watch changes
* @param { Object } view an instance of View (new View) from open layers
* @param { Array } layers an instance of layers (new Layers) from open layers
*/
function setListActions(element, view, layers){ 
	const parseHTMLlist = Array.from(element.children)
	parseHTMLlist.forEach( item => {
		const idprojeto = parseInt(item.firstChild.getAttribute("inputid"))

		item.firstChild.onclick = () => {
			fitToId(view, layers, idprojeto)
			parseHTMLlist.forEach(item=> item.classList.remove("clicked")) // Reset all itens
			item.classList.add('clicked')
		}
	})
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
		console.log(id)
	}
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


/**
* Add event listeners to toggle 'open' class to an element to hide 
* @param { Node } triggers The element from DOM to listen event click
* @param { Node } toHide The element to hide 
*/ 
function menuEvents (triggers, toHide){
	const normalizedHTMLArr = Array.from(triggers)
	normalizedHTMLArr[0].addEventListener('click', event =>{
		toHide.classList.toggle('open')
		normalizedHTMLArr[1].classList.remove('hide')
		event.target.classList.add('hide')
	})
	normalizedHTMLArr[1].addEventListener('click', event =>{
		toHide.classList.toggle('open')
		normalizedHTMLArr[0].classList.remove('hide')
		event.target.classList.add('hide')
	})

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
		if(extents.length >= 1) {
			view.fit(smallerExtent(extents), { // fit to smaller extent 
				duration: 1000
			})
		}
	})

	/*
	after render, initiate app
	*/
	let fitToBaseLayer = new Promise( (resolve) => {
		setTimeout(() => {
			fitToId(view, thisMapLayers, 0)
		}, 1500 )
	})

	const panel = document.getElementById("panel")

	Promise.all([
		createList(colocalizados),
		setListActions(document.getElementById("projetos"), view, thisMapLayers),
		menuEvents(document.getElementsByClassName('menu-display'), panel)
	])
	.then( () => fitToBaseLayer )
	.catch( error => console.error(error) )
})
