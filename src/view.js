"use strict";
import { isNumber } from 'util'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { projetos, colocalizados  } from './model'
import { returnLayers, layerColors, getProjectData } from './presenter'
import { containsExtent } from 'ol/extent'

/**
* Render a template to the DOM
* @param { String } template The element
* @param { String } selector The element to inject
*/
function renderElement(template, selector) {
	var node = document.querySelector(selector);
	if (!node) return
	node.innerHTML = template
}

/**
* Create navigation options from data source (colocalizados.json)
* @param { Object } colocalizados The colocalizados.json data
* @returns { Node } the <options> rendered in "#projetos"
*/
function createList(colocalizados){
	let cleanList = [] 
	let list = ""

	for (let projeto of Object.values(colocalizados)){ 
		if(isNumber(projeto.ID)){
			cleanList.push(projeto)
		}
	}
	cleanList.forEach( item => {
		if(layerColors[item.ID] === undefined){
			list += '<li '+">" + "<input type='button' value='" + item.NOME +"' inputid=" + item.ID + " disabled>" + '</li>'
		}
		else{
			list += '<li style="background-color:rgba('
				+ layerColors[item.ID][0]+','
				+layerColors[item.ID][1]+','
				+layerColors[item.ID][2]+','
				+layerColors[item.ID][3]
				+')">' + "<input type='button' value='" + item.NOME +"' inputid=" + item.ID + ">" + '</li>'
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

			// !!!CLEAN THIS FUNCTION!!!
			const data = getProjectData(idprojeto, colocalizados)
			const images = getFiles(idprojeto, projetos)
			createInfo(data, layerColors[idprojeto], images)
			document.getElementById("info").classList.remove("hidden")
			document.getElementById('baseInfo').classList.add('hidden')
			document.getElementById('gohome').classList.remove('hidden')
			document.getElementById('panel').classList.toggle('open')
			if (window.innerHeight > window.innerWidth) {
				document.getElementById('infowrap').classList.remove('hidden')
				document.getElementById('toggleHidden').classList.add('rotate')
			}
			else {
				document.getElementById('infowrap').classList.add('hidden')
				document.getElementById('toggleHidden').classList.remove('rotate')
			}
			// !!!CLEAN THIS FUNCTION!!!

			parseHTMLlist.forEach(item => item.classList.remove("clicked")) // Reset all itens
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
		// event.target.classList.add('hide')
	})
	normalizedHTMLArr[1].addEventListener('click', event =>{
		toHide.classList.toggle('open')
		normalizedHTMLArr[0].classList.remove('hide')
		// event.target.classList.add('hide')
	})

}

/**
* Return the files from each projetos.json
* @param { Number } id The prject id
* @param { Object } projetos The projetos.json data
* @return { Object } { hero, images }
*/
function getFiles(id, projetos){
	if (id === 'BASE') {
		/* "'ID':'BASE'" in colocalizados relates to "id: 0" in projetos */
		let baseproject = projetos.filter(projeto => parseInt(projeto.name.substring(0,3).replace(/[^\d]/g, '')) === 0)
		return baseproject
	}
	else {
		const idsFromNames = projetos.filter(projeto => {
			let substId =  projeto.name.substring(0,3) 
			substId = substId.replace(/[^\d]/g, '') 
			substId = parseInt(substId)
			if(substId !== 0 && substId === id){
				return projeto
			}
		})
		const files = idsFromNames[0].children
		const images = files.filter( file => file.extension === '.png' || file.extension === '.png' || file.extension === '.jpg' || file.extension === '.svg' )
		const hero = files.filter( hero => hero.name.slice(-8) === "hero" + hero.extension)

		if(images.length > 0 && hero){
			return {
				images: images.map(image => { return {"path": image.path, extension: image.extension} }),
				hero: hero[0].path
			}
		}
		else return false
	}
}

/**
* Create info box
* @param { Object } data colocalizados.json item 
* @param { String } projectColor rgba color string
*/ 
function createInfo(data, projectColor, images){

	// images ? console.log(images) : null

	const concatColor = 'background-color: rgba(' + projectColor[0] +', ' + projectColor[1] +',' + projectColor[2] +','+ projectColor[3] +')'
	let contatenation = ''
	if (images.images) {
		contatenation += "<div class='coverSec' style='background-image: url(" + process.env.APP_URL + images.images[0].path + ")'></div>"
	}
	else {
		contatenation = ''
	}
	contatenation += "<div class='info-legend' style='"+ concatColor +"'></div>"

	for(let val in data){
		switch(val) {
			case 'NOME': contatenation += "<h4 class='project-title'>" +  data[val] + "</h4>"; break
			case 'DESCRIÇÃO': contatenation += "<p class='description'>" +  data[val] + "</p>"; break
			case 'ANO': contatenation += "<p class='ano'>Início <span>" +  data[val] + "</span></p>"; break
			case 'SECRETARIA': contatenation += "<p class='secretaria'>Responsável <span>" +  data[val] + "</span></p>"; break
			case 'STATUS': contatenation += "<p class='status'>Status <span>" +  data[val] + "</span></p>"; break
		}
	}
	renderElement(contatenation, "#info") // render DOM
}

/**
* Create initial info (images, strings) box with data from the larger project
* @param { Object } data colocalizados.json item (return from getProjectData())
*/
function createBaseInfo(data) {
	let contatenation = ''

	contatenation += "<h1 class='baseInfo-title'>" + data.NOME + "</h1>"

	contatenation += "<div class='cover' style='background-image: url(" + process.env.APP_URL + getFiles('BASE', projetos)[0].children[0].path + ");'></div>"

	if (data.ANO || data.SECRETARIA || data.STATUS) {
		contatenation += "<div class='dados'>"
		for (let val in data) {
			switch (val) {
				case 'ANO': contatenation += "<p class='ano'>Início <span>" +  data[val] + "</span></p>"; break
				case 'SECRETARIA': contatenation += "<p class='secretaria'>Responsável <span>" +  data[val] + "</span></p>"; break
				case 'STATUS': contatenation += "<p class='status'>Status <span>" +  data[val] + "</span></p>"; break
			}
		}
		contatenation += "</div>"
	}

	contatenation += "<p class='description'>" + data.DESCRIÇÃO + "</p>"

	renderElement(contatenation, "#baseInfo")
}


docReady(() => {
	const thisMapLayers = returnLayers(projetos, process.env.APP_URL)

	let view = new View({
		center: [ -5190695.271418285, -2696956.332871481 ],
		projection: 'EPSG:3857',
		zoom: 13,
		minZoom: 12.7,
		maxZoom: 28
	})

	let map = new Map({
		layers: thisMapLayers,
		loadTilesWhileAnimating: true,
		target: document.getElementById('map'),
		view: view
	})

	/*
	* map events
	*/
	map.on('singleclick', evt => {
		let idAndextents = []
		map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
			const projectjId = layer.values_.projectId
			if(projectjId !== 0) { // exclui a base
				idAndextents.push(
				{
					id: projectjId,
					extent: layer.getSource().getExtent()
				})
			}
		})
		if(idAndextents.length >= 1) {
			const smaller = smallerExtent(idAndextents)
			view.fit(smaller.extent, { // fit to smaller extent 
				duration: 1000
			})

			const info = document.getElementById("info")
			info.classList.remove("hidden")

			if(getProjectData(smaller.id, colocalizados)){
				const data = getProjectData(smaller.id, colocalizados) // get data from colocalizados.json
				const images = getFiles(smaller.id, projetos)

				createInfo(data, layerColors[smaller.id], images)
				document.getElementById('baseInfo').classList.add('hidden') // classes' changes for clicks on map
				document.getElementById('gohome').classList.remove('hidden')
				if (window.innerHeight > window.innerWidth) {
					document.getElementById('infowrap').classList.remove('hidden')
					document.getElementById('toggleHidden').classList.add('rotate')
				}
				else {
					document.getElementById('infowrap').classList.add('hidden')
					document.getElementById('toggleHidden').classList.remove('rotate')
				}
			}
			else { renderElement("<div class='erro'>Algo deu errado... <p class='info'>Projeto ID <span>" + smaller.id + "</span></p></div>", "#info") }
		}
	})

	/*
	* sidebar events
	*/
	createBaseInfo(getProjectData('BASE', colocalizados))

	/*
	* return to initial page - classes' changes
	*/
	let gohomeName = document.getElementById('gohomeName')
	gohomeName.innerText = getProjectData('BASE', colocalizados).NOME
	let gohome = document.getElementById('gohome')
	gohome.addEventListener('click', function() {
		document.getElementById('info').classList.add('hidden')
		document.getElementById('gohome').classList.add('hidden')
		document.getElementById('baseInfo').classList.remove('hidden')
		fitToId(view, thisMapLayers, 0)
	})

	/*
	* sidebar hiding - classes' changes
	*/
	let hideshow = document.getElementById('toggleHidden')
	hideshow.addEventListener('click', function(event) {
		document.getElementById('infowrap').classList.toggle('hidden')
		hideshow.classList.toggle('rotate')
	})

	/*
	* for landscape devices, resize map for sidebar hiding/showing
	*/
	if (window.innerHeight < window.innerWidth) {
		let sidebar = document.getElementById('infowrap')
		var observer = new MutationObserver(function(mutationsList) {
			for(var mutation of mutationsList) {
				if (mutation.type == 'attributes') {
					setTimeout(function() { map.updateSize() }, 200)
				}
				else { return false }
			}
		})
		observer.observe(sidebar, { attributes: true, childList: false, subtree: false })
	}

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
		setListActions(document.getElementById("projetos"), view, thisMapLayers),
		menuEvents(document.getElementsByClassName('menu-display'), document.getElementById("panel")),
		// menuEvents(document.getElementsByClassName('info-display'), document.getElementById("info"))
	])
	.then( () => fitToBaseLayer )
	.catch( error => console.error(error) )
})