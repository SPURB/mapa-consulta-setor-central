import { isNumber } from 'util'
import { containsExtent } from 'ol/extent'
import { responseMessageListener } from './eventListeners'
import { mapaData } from './model';

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
	let projectId = name.substring(0,7) // "1_a", "2_m", "05_"
	projectId = projectId.replace(/[^\d]/g, '')  // "1", "2", "5"
	projectId = parseInt(projectId) // 1, 2, 5
	if (Number.isInteger(projectId)) return projectId
	else { throw new Error('projectId must to be a Number') }
}

/**
* Render a template to the DOM
* @param { String } template The element
* @param { String } query The element query selector to inject into
*/
function renderElement(template, query) {
	var node = document.querySelector(query)
	if (!node) return
	node.innerHTML = template
}


/**
 * Create maps buttons
 * @param { Array } buttonsContentArray An array of objects
 * @param { String } query The query to select
 * @param { String } idPrefix Prefix to the button id
 * @returns { HTMLCollection } A list of buttons inside que query selector element
 */
function createMapsBtns(buttonsContentArray, query, idPrefix){
	let list = ''
	buttonsContentArray.forEach(buttonObject => {
		list += `<li><button id="${idPrefix}${buttonObject.id}">${buttonObject.name}</button></li>`
		}
	)
	renderElement(list, query)
}

/**
* Create navigation options from data source
* @param { Object } allLayersData A big Object with layers info
* @param { Object } layerColors The cores.json data
* @returns { HTMLAllCollection } the <li> rendered in "#projetos"
*/
function createList(allLayersData, layerColors){
	let list = ""
	allLayersData.forEach( item => {
		if(layerColors[item.INDICADOR] === undefined){
			list += `
				<li>
					<p>${item.NOME}</p>
				</li>
			`
		}
		else{
			const r = layerColors[item.INDICADOR][0]
			const g = layerColors[item.INDICADOR][1]
			const b = layerColors[item.INDICADOR][2]
			const a = layerColors[item.INDICADOR][3]

			const projectId = 'projeto-id_' + item.INDICADOR
			const btnProjectId = 'btn-projeto-id_' + item.INDICADOR

			listCreated.push(item.INDICADOR)

			list += `
				<li style='border-left-color:rgba(${r}, ${g}, ${b}, ${a})' id="${item.INDICADOR}">
					<input type='checkbox' id='${projectId}'>
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
		view.fit(layer.getSource().getExtent(), { padding: padding })
	}
	catch (error) {
		throw new Error(`Error: ${error}`)
	}
}

// function fitToNewId(appmap, indicador, padding, indicadorBase) {
// 	const layers = appmap.getLayers().getArray()
// 	const clickedLayer = layers.find(layer => layer.get('projectIndicador') === indicador)
// 	const extent = clickedLayer.getSource().getExtent()

// 	if(extent[0]!==Infinity) appmap.getView().fit(extent, { padding: padding })

// 	else {
// 		const baseLayer = layers.find(baseLay => baseLay.get('projectIndicador') === indicadorBase)
// 		const baseExtent =  baseLayer.getSource().getExtent()
// 		appmap.getView().fit(baseExtent, { padding: padding })
// 		console.error(new Error())
// 	}
// }

/** 
Switch layer
* @param  { Object } layer The layer to change the state
* @param { Boolean } state Visibility state of this layer
* @param { Object } map The Open Layers new Map instance
*/
function switchVisibilityState(layer, state, map) {
	const indicador = layer.get("projectIndicador")
	const input = document.getElementById('projeto-id_'+ indicador)
	const button = document.getElementById('btn-projeto-id_' + indicador)
	input.checked = state
	state ? button.classList.add('selected') : button.classList.remove('selected')

	return state ? map.addLayer(layer) : map.removeLayer(layer)
}

/** 
Switch layers and menu
* @param { Boolean } state Visibility state of this layer
* @param { Object } layers The layers to change the state
* @param { Object } map The Open Layers new Map instance
* @returns switch layers state
*/
function switchlayers(state, layers, map){
	layers.forEach(lyr => switchVisibilityState(lyr, state, map))
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
			let keyTitle = key === 'projectIndicador' ? 'Identificador' : key
			keyTitle = keyTitle === 'title' ? 'Título' : keyTitle
 			concatenation += `<span>${keyTitle}</span><p>${kmlAttributes[key]}</p>`
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
* @param { Number } indicador The project indicador
* @param { Object } projetos The projetos.json data
* @return { Object } { hero, images }
*/
function getFiles(indicador, projetos, baseId = false, indicadores = {}){
	if (indicador === baseId) { // base id is 201
		let baseproject = projetos.filter(projeto => projeto.id === indicador)
		return baseproject
	}
	else {
		const id = indicadores[indicador]
		const projeto = projetos.find(projeto => projeto.id === id)

		const files = projeto.children
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
		if(images.length > 0){
			return {
				images: images.map(image => { return {"path": image.path, extension: image.extension} }),
				hero: false
			}
		}
		else { 
			return {
				images: false,
				hero: false
			}
		}
	}
}

/**
* Create info box
* @param { Object } data A dataset item 
* @param { String } projectColor rgba color string
* @param { String } path Optional image path
* @returns { HTMLDivElement } Create the div#info of selected project
*/ 
function createInfo(data, projectColor, path = false) {
	let coverImg = document.getElementById('coverSec')
	const concatColor = `background-color: rgba(${projectColor[0]}, ${projectColor[1]}, ${projectColor[2]}, ${projectColor[3]})`
	let concatenation = ''

	if (path) {
		coverSec.style.display = "block"
		const coverImgPath = process.env.APP_URL + path
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
	else { coverSec.style.display = "none" }

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
 * Create a sidebar with map content in #selectedMapInfo
 * @param { Object } mapData An item from mapData array { id, name, legenda }
 */
function createMapInfo(mapData){
	window.location.hash = mapData.id
	let concatenation = ''
	if(mapData.name === undefined && mapaData.legenda === undefined) { console.error(`${mapData}'s keys are undefined`) }
	if(mapaData) {
		const coverImgPath = process.env.APP_URL + mapData.legenda
		concatenation = `<img src="${coverImgPath}" alt="Legenda de ${mapData.name}">`
	}
	concatenation += `<h4 class="project-title">${mapData.name}</h4>`
	renderElement(concatenation, "#selectedMapInfo")
}

/**
* Create initial info (images, strings) box with data from the larger projectgetProjectData 
* @param { Object } data colocalizados.json item (return from getProjectData())
*/

function createBaseInfo(data, projetos) {
	let concatenation = ''
	const nome = data.NOME
	const bgImgPath = process.env.APP_URL + getFiles(data.ID, projetos, data.ID)[0].children[0].path

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
			<div class="response-message"></div>
			<h3 class="comment-box-action-title">Comente</h3>
			<div id=${query}-messages></div>
			<form name="${query}" class="validate">
				<div>
					<label for="${query}-name">Nome</label>
					<input type="text" class="${query}-field" id="${query}-name" minlength="2" maxlength="60" title="Nome" required></input>
				</div>

				<div>
					<label for="${query}-surname">Sobrenome</label>
					<input type="text" class="${query}-field" id="${query}-surname" minlength="2" maxlength="60" title="Sobrenome" required></input>
				</div>

				<div>
					<label for="${query}-organization">Organização (opcional)</label>
					<input type="text" class="${query}-field" id="${query}-organization" minlength="2" maxlength="60" title="Organização (opcional)"></input>
				</div>

				<div>
					<label for="${query}-email">Email</label>
					<input type="email" class="${query}-field" id="${query}-email" title="Email" pattern='${emailPattern}' required></input> 
				</div>

				<div>
					<label for="${query}-comment">Contribuição</label>
					<textarea type="text" class="${query}-field" id="${query}-comment" minlength="3" title="Contribuição" required></textarea>
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
 * Create error list
 * @param { String } query The query selector of the element to dislay errors
 * @param { Array } errors The comment box errors list
 */
function commentBoxDisplayErrors(query, errors) {
	let errorsList = '<ul class="errors-list display">'
	errors.forEach(error => errorsList += `<li id="${error.id}-error-message" class="display">${error.message}</li>` )
	errorsList += '</ul>'
	renderElement(errorsList, `#${query}`)
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
	const infoError = document.getElementById('info-error')
	const baseInfo = document.getElementById('baseInfo')
	const gohome = document.getElementById('gohome')
	const info = document.getElementById('info')

	if(stateStr === 'initial'){
		document.getElementById('panel').classList.remove('open')
		infoError.classList.add('no-display')
		baseInfo.classList.remove('no-display', 'hidden')
		gohome.classList.add('hidden')
		info.classList.remove('no-display')
		info.classList.add('hidden')
	}
	if(stateStr === 'error'){
		gohome.classList.remove('hidden')
		infoError.classList.remove('no-display')
		baseInfo.classList.add('no-display')
		info.classList.add('no-display')
	}
	document.getElementById('info-kml').classList.add('no-display')
}

/**
* Display elements while fecthing
* @param { Boolean } state Fetch error state
* @param { String } query Element selector
*/
function displayFetchingUI(state, query){
	let els = document.querySelectorAll(query)
	if (els === undefined) {  return new Error('Element undefined') }
	els = [...els]

	// while fetching behaviors
	if(query === '.button') {
		els.forEach(button => { 
			if(state) {
				button.classList.add('fetching')
				button.setAttribute('value', 'CARREGANDO')
				button.disabled = true
			}
			else { 
				button.classList.remove('fetching')
				button.setAttribute('value', 'COMENTAR')
				button.disabled = false
			}
		})
	}
	else {
		return new Error(`Hey yow. Create some while fetching behavior to this ${query}`)
	}
}

/**
* Display backend message
* @param { String } resType Type of response: 'error' or 'success'
* @param { Object } response The backend response. False -> backend error
* @param { String } idBase The base id name of the comment form. 'baseInfo' or 'info'
* @returns HTMLElement with success/error message
*/
function displayResponseMessage(resType, response, idBase){
	const title = resType === 'error' ? 'Houve algum erro...': 'Obrigado!'
	const message = resType === 'error' ? 'Tente novamente.' : 'Seu comentário foi enviado para moderação.'
	const res = response ? response : ''
	let base = document.getElementById(idBase)

	base.querySelector('.response-message').classList.toggle(resType)
	base.querySelector('.response-message').classList.add(idBase)

	let template = `
		<h6>${title}</h6>
		<p>${message}</p>
		<p>${res}</p>
		<button id="${idBase}-close-response">
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
			<circle cx="20" cy="20" r="18" stroke="#FFF" stroke-width="2"/>
			<line x1="29.1925" y1="11.2789" x2="11.2791" y2="29.1923" stroke="#FFF" stroke-width="2"/>
			<line x1="28.7216" y1="29.1925" x2="10.8082" y2="11.2791" stroke="#FFF" stroke-width="2"/>
			</svg>
		</button>
	`
	renderElement(template, `.response-message.${idBase}`)
	responseMessageListener(idBase, resType)
}
export {
	renderElement,
	createList,
	createMapsBtns,
	listCreated,
	toggleInfoClasses,
	switchVisibilityState,
	switchlayers,
	fitToId,
	// fitToNewId,
	smallerExtent,
	getFiles,
	createInfo,
	createMapInfo,
	createBaseInfo,
	noBaseProjetos,
	parseNameToNumericalId,
	setInitialState,
	createCommentBox,
	commentBoxDisplayErrors, 
	displayKmlInfo,
	displayFetchingUI,
	displayResponseMessage
}