"use strict";
import { isNumber } from 'util'
import { projetos } from './model'
import { layerColors } from './layers/projectsKmls'
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
			list += `
				<li>
					<p>${item.NOME}</p>
				</li>
			`
		}
		else{
			const r = layerColors[item.ID][0]
			const g = layerColors[item.ID][1]
			const b = layerColors[item.ID][2]
			const a = layerColors[item.ID][3]

			const projectId = 'projeto-id_' + item.ID
			const btnProjectId = 'btn-projeto-id_' + item.ID

			listCreated.push(item.ID)

			list += `
				<li style='border-left-color:rgba(${r}, ${g}, ${b}, ${a})'>
					<input type='checkbox' id='${projectId}' checked>
					<label for=${projectId}>${item.NOME}</label>
					<button id="${btnProjectId}">></button>
				</li>
			`

		}
	})
	renderElement(list, '#projetos')
}


/**
* @return { Array } List of ids setted by createList(colocalizados) 
*/
let listCreated = []

/** 
Fit to id. Change current view fitting to a id
* @param { Object } view Instance of View (new View) from open layers
* @param  { Object } layer The layer (new Layer's) from open layers to fit in
* @param  { Array } padding Padding array of this fit -> [top, right, bottom, left] in pixels
*/
function fitToId(view, layer, padding){
	try {
		view.fit(layer.getSource().getExtent(), {
			padding: padding
		})
	}
	catch (error) {
		console.error(error)
		console.log(id)
	}
}

/** 
Switch layer visibilty state
* @param  { Object } layer The layer to change the state
* @param { Boolean } state Visibility state of this layer
*/
function switchVisibilityState(layer, state) {
	state ? layer.setOpacity(1) : layer.setOpacity(.1)
}

/** 
* Create info-kml data
* @param  { Object } kmlAttributes The kml attributes
*/
function displayKmlInfo(kmlAttributes) {
	const exceptions = [
		'SubClasses', 
		'EntityHand', 
		// 'REVISIONNU', 
		'Render', 
		'geometry', 
		'ID2', 
		// 'id', 
		'olinetype', 
		'source',
		'zIndex',
		'projectId',
		'opacity',
		'visible',
		'maxResolution',
		'minResolution'

	]
	let info = document.getElementById("info-kml")

	let concatenation = ''

	if(info.classList.contains('no-display')) {	
		info.classList.remove('no-display')
	}

	for (let key in kmlAttributes) {
		if(exceptions.includes(key) === false){
			concatenation += `<span>${key}</span><p>${kmlAttributes[key]}</p>`
		}
	}

	if ( concatenation!=='' ){ info.innerHTML = concatenation }
	else { info.classList.add('no-display') }
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
* Return the files from each projetos.json
* @param { Number } id The project id
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
			let substringId =  projeto.name.substring(0,3)
			substringId = substringId.replace(/[^\d]/g, '') 
			substringId = parseInt(substringId)
			if(substringId !== 0 && substringId === id){
				return projeto
			}
		})
		const files = idsFromNames[0].children
		const images = files.filter( file =>
			file.extension === '.gif' ||
			file.extension === '.png' ||
			file.extension === '.jpg' ||
			file.extension === '.jpeg' ||
			file.extension === '.svg'
		)

		const hero = files.filter( hero => hero.name.includes(`hero${hero.extension}`))
		
		if(images.length > 0 && hero.length > 0){
			return {
				images: images.map(image => { return {"path": image.path, extension: image.extension} }),
				hero: hero[0].path
			}
		}
		else { 
			console.error(id)
		}
	}
}

/**
* Create info box
* @param { Object } data colocalizados.json item 
* @param { String } projectColor rgba color string
* @returns { HTMLDivElement } Create the div#info of selected project
*/ 
function createInfo(data, projectColor, images){
	let coverImg = document.getElementById('coverSec')
	const concatColor = `background-color: rgba(${projectColor[0]}, ${projectColor[1]}, ${projectColor[2]}, ${projectColor[3]})`
	let concatenation = ''

	if (images.images) {
		const coverImgPath = process.env.APP_URL + images.images[0].path

		coverImg.style.backgroundImage = `url("${coverImgPath}")`

		let autorStr = `Autor <b>${data.AUTOR}</b>`
		let fonteStr = ''
		if (typeof(data.FONTE) === 'string' && data.FONTE.substring(0,4) === 'http') {
			fonteStr += `Fonte <b><a href='${data.FONTE}' title='${data.FONTE}' target='_blank'>${data.FONTE}</a></b>`
		}
		else {
			fonteStr += `Fonte <b>${data.FONTE}</b>`
		}
		renderElement(autorStr, '#fonteAutor')
		renderElement(fonteStr, '#fonteFonte')
	}

	concatenation += `<div class='info-legend' style='${concatColor}'></div>`
	concatenation += "<div class='data' id='projectData'>"

	for(let val in data){
		if(data[val] !== 0) {
			switch(val) {
				case 'NOME': concatenation += `<h4 class='project-title'>${data[val]}</h4>`; break
				case 'DESCRIÇÃO': concatenation += `<p class='description'>${data[val]}</p>`; break
				case 'ANO': concatenation += `<p class='ano'>Início <span>${data[val]}</span></p>`; break
				case 'SECRETARIA': concatenation += `<p class='secretaria'>Responsável <span>${data[val]}</span></p>`; break
				case 'STATUS': concatenation += `<p class='status'>Status <span>${data[val]}</span></p>`; break
				default: concatenation += ''
			}
			concatenation += "</div>"
		}
	}
	concatenation += "</div>"
	renderElement(concatenation, "#infoCont")
}

/**
* Create initial info (images, strings) box with data from the larger projectgetProjectData 
* @param { Object } data colocalizados.json item (return from getProjectData())
*/
function createBaseInfo(data) {
	let concatenation = ''
	const nome = data.NOME
	const bgImgPath = process.env.APP_URL + getFiles('BASE', projetos)[0].children[0].path

	concatenation += `<h1 class='baseInfo-title'>${nome}</h1>`
	concatenation += `<div class='cover' style='background-image: url("${bgImgPath}");'></div>` 

	if (data.ANO || data.SECRETARIA || data.STATUS) {
		concatenation += "<div class='dados'>"
		for (let val in data) {
			const dado = data[val]	
			if(dado !== 0){
				switch (val) {
					case 'ANO': concatenation += `<p class='ano'>Início <span>${dado}</span></p>`; break
					case 'SECRETARIA': concatenation += `<p class='secretaria'>Responsável <span>${dado}</span></p>`; break
					case 'STATUS': concatenation += `<p class='status'>Status <span>${dado}</span></p>`; break
					default: concatenation += ''
				}
			}
		}
		concatenation += "</div>"
	}
	concatenation += `<p class='description'>${data.DESCRIÇÃO}</p>`
	renderElement(concatenation, "#baseInfo")
}

/**
* Create commentable form
* @param { String } query The element query selector to inject the form
* @param { Boolean } isProject Project was selected? -> state.projectSelected
* @returns { HTMLDivElement } Them commentable box
*/
function createCommentBox (query, isProject) {

	if(isProject || document.body.contains(document.forms[query])) { return } // Stop function if project info box already created

	const emailPattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
	const commentBox = `
		<div class="comment-box">
			<h3 class="comment-box-action-title">Comente aqui:</h3>
			<form name="${query}" class="validate">
				<div>
					<label for="${query}-name">Nome</label>
					<input type="text" class="${query}-field" id="${query}-name" minlength="2" maxlength="60" title="Seu nome" required></input>
				</div>

				<div>
					<label for="${query}-surname">Sobrenome</label>
					<input type="text" class="${query}-field" id="${query}-surname" minlength="2" maxlength="60" title="Seu sobrenome" required></input>
				</div>

				<div>
					<label for="${query}-organization">Organização (opcional)</label>
					<input type="text" class="${query}-field" id="${query}-organization" minlength="2" maxlength="60" title="O nome da sua organização (opcional)"></input>
				</div>

				<div>
					<label for="${query}-email">Email</label>
					<input type="email" class="${query}-field" id="${query}-email" title="Inclua um email válido" pattern='${emailPattern}' required></input> 
				</div>

				<div>
					<label for="${query}-comment">Comentário</label>
					<textarea type="text" class="${query}-field" id="${query}-comment" minlength="3" title="Sua contribuição" required></textarea>
				</div>

				<input type="submit" class="button" value="Comentar" id="${query}-submit">
			</form>
		</div>
	`
	const parser = new DOMParser()
	const commentBoxNode = parser.parseFromString(commentBox, 'text/html').body.firstChild

	const el = document.querySelector(`#${query}`)
	el.appendChild(commentBoxNode)
}

/**
* Sidebar (left) -> Toggle classes of clicked project and the base project 
* @param { Boolean } orientation Current window media orientation
* @returns { HTMLDivElement } Changes #baseInfo, #gohome, #infowrap and #toggleHidden classes
*/
function toggleInfoClasses(orientation){
	document.getElementById('baseInfo').classList.add('hidden') // classes' changes for clicks on map
	document.getElementById('gohome').classList.remove('hidden')

	if (orientation) {
		document.getElementById('infowrap').classList.remove('hidden')
		document.getElementById('toggleHidden').classList.add('rotate')
	}
	else {
		document.getElementById('infowrap').classList.add('hidden')
		document.getElementById('toggleHidden').classList.remove('rotate')
	}
}

/**
* Set initial state of app 
* @param { String } stateStr 'error' or 'initial'
* @returns initial classes to #info-kml, #info-error, #baseInfo, #info
*/ 
function setInitialState(stateStr){
	if(stateStr === 'initial'){
		document.getElementById('info-kml').classList.add('no-display')
		document.getElementById('info-error').classList.add('no-display')
		document.getElementById('baseInfo').classList.remove('no-display')
		document.getElementById('info').classList.remove('no-display')
	}
	if(stateStr === 'error'){
		document.getElementById('info-kml').classList.add('no-display')
		document.getElementById('gohome').classList.remove('hidden')
		document.getElementById('info-error').classList.remove('no-display')
		document.getElementById('baseInfo').classList.add('no-display')
		document.getElementById('info').classList.add('no-display')
	}
	else { null }
}

export {
	baseObject,
	renderElement,
	createList,
	listCreated,
	toggleInfoClasses,
	switchVisibilityState,
	fitToId,
	smallerExtent,
	getFiles,
	createInfo,
	createBaseInfo,
	noBaseProjetos,
	parseNameToNumericalId,
	setInitialState,
	createCommentBox,
	displayKmlInfo
}