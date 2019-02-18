"use strict";
import { isNumber } from 'util'
import { projetos, colocalizados  } from './model'
import { layerColors, getProjectData } from './layers/projectsKmls'
import { containsExtent } from 'ol/extent'

/**
* Reduce projetos to single Base object
* @param { Array } projetos The projetos from './model'
* @return { Object } The base folder example { children: [ {…}, {…} ], name: "00_base", path: "data-src/projetos/00_base", size: 1, type: "directory"}
*/
function baseObject (projetos) {
	return projetos.reduce( projeto =>{ 
		const projectId = parseNameToNumericalId(projeto.name)
		return projectId === 0 ? projeto : 'no base folder 00_project-name/'
	})
}

/**
* Filter projetos removing base layers
* @param { Array } projetos The projetos from './model'
* @return { Array } The filtered projetos
*/
function noBaseProjetos(projetos){
	return projetos.filter( projeto =>{
		return parseNameToNumericalId(projeto.name) > 0 ? projeto : null
	})
}

/**
* Filter projetos removing base layers
* @param { String } name Some string to parse. The pattern expected is '00_project-name'
* @return { Number } The project id
*/
function parseNameToNumericalId(name){
	let projectId = name.substring(0,3) // "1_a", "2_m", "05_"
	projectId = projectId.replace(/[^\d]/g, '')  // "1", "2", "5"
	projectId = parseInt(projectId) // 1, 2, 5
	if (Number.isInteger(projectId)) return projectId
	else { throw console.error('projectId must to be a Number') }
}

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
				+layerColors[item.ID][0]+','
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

	// let infoCont = document.getElementById('infoCont')
	let coverImg = document.getElementById('coverSec')
	// let autor = document.getElementById('fonteAutor')
	// let fonte = document.getElementById('fonteFonte')

	const concatColor = 'background-color: rgba(' + projectColor[0] +', ' + projectColor[1] +',' + projectColor[2] +','+ projectColor[3] +')'
	let concatenation = ''

	if (images.images) {
		coverImg.style.backgroundImage = 'url("' + process.env.APP_URL + images.images[0].path + '")'
		let autorStr = 'Autor <b>' + data.AUTOR + '</b>'
		let fonteStr = ''
		if (data.FONTE.substring(0,4) === 'http') {
			fonteStr += "Fonte <b><a href='" + data.FONTE + "' title='" + data.FONTE + "' target='_blank'>" + data.FONTE + "</a></b>"
		}
		else {
			fonteStr += "Fonte <b>" + data.FONTE + "</b>"
		}
		renderElement(autorStr, '#fonteAutor')
		renderElement(fonteStr, '#fonteFonte')
	}

	concatenation += "<div class='info-legend' style='"+ concatColor +"'></div>"
	concatenation += "<div class='data' id='projectData'>"

	for(let val in data){
		switch(val) {
			case 'NOME': concatenation += "<h4 class='project-title'>" +  data[val] + "</h4>"; break
			case 'DESCRIÇÃO': concatenation += "<p class='description'>" +  data[val] + "</p>"; break
			case 'ANO': concatenation += "<p class='ano'>Início <span>" +  data[val] + "</span></p>"; break
			case 'SECRETARIA': concatenation += "<p class='secretaria'>Responsável <span>" +  data[val] + "</span></p>"; break
			case 'STATUS': concatenation += "<p class='status'>Status <span>" +  data[val] + "</span></p>"; break
		}
		concatenation += "</div>"
	}

	concatenation += "</div>"

	renderElement(concatenation, "#infoCont") // render DOM
}

/**
* Create initial info (images, strings) box with data from the larger project
* @param { Object } data colocalizados.json item (return from getProjectData())
*/
function createBaseInfo(data) {
	let concatenation = ''

	concatenation += "<h1 class='baseInfo-title'>" + data.NOME + "</h1>"

	concatenation += "<div class='cover' style='background-image: url(" + process.env.APP_URL + getFiles('BASE', projetos)[0].children[0].path + ");'></div>"

	if (data.ANO || data.SECRETARIA || data.STATUS) {
		concatenation += "<div class='dados'>"
		for (let val in data) {
			switch (val) {
				case 'ANO': concatenation += "<p class='ano'>Início <span>" +  data[val] + "</span></p>"; break
				case 'SECRETARIA': concatenation += "<p class='secretaria'>Responsável <span>" +  data[val] + "</span></p>"; break
				case 'STATUS': concatenation += "<p class='status'>Status <span>" +  data[val] + "</span></p>"; break
			}
		}
		concatenation += "</div>"
	}

	concatenation += "<p class='description'>" + data.DESCRIÇÃO + "</p>"

	renderElement(concatenation, "#baseInfo")
}

export {
	baseObject,
	renderElement,
	createList,
	setListActions,
	fitToId,
	smallerExtent,
	menuEvents,
	getFiles,
	createInfo,
	createBaseInfo,
	noBaseProjetos,
	parseNameToNumericalId
}