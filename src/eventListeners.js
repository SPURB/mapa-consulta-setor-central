import { projetos, indicadores, apiPost } from './model'
import { 
	setInitialState,
	fitToId,
	switchVisibilityState,
	switchlayers,
	getFiles,
	createInfo,
	createMapInfo,
	createCommentBox,
	commentBoxDisplayErrors,
	displayKmlInfo
} from './domRenderers'

/**
* Sidebar - Render initial base layer info and resets map to the initial state
*/
function sidebarGoHome (layers, baseLayer, view, fitPadding, map){
	let gohome = document.getElementById('inicio')
	gohome.addEventListener('click', () => {
		setInitialState('initial')
		fitToId(view, baseLayer, fitPadding)
		switchlayers(false, layers, map)
	})
}

/**
* Sidebar -> navigate in tabs
* @param { Number } param - if no param is > 0, navigate on clicks; else a number N is defined as param, the Nth child of '#tabContent' will be active
* @returns { EventListener } The menu #tabs eventListeners
*/
function sidebarNavigate(param){
	let tabs = document.getElementById('tabs')
	let tabsArr = Array.from(tabs.children)

	if (param === 0) {
		tabs.addEventListener('click', (event) => {

			// reset kml-info
			document.getElementById('info-kml').classList.add('no-display')

			// reset map hash location
			window.location.hash = ''

			tabsArr.map((index) => {
				document.getElementById(index.getAttribute('data-id')).classList.add('hidden')
				index.classList.remove('active')
			})
			document.getElementById(event.target.getAttribute('data-id')).classList.remove('hidden')
			event.target.classList.add('active')
		})
	} else if (param > 0) {
		tabsArr.map((index) => {
			index.classList.remove('active')
			document.getElementById(index.getAttribute('data-id')).classList.add('hidden')
		})
		tabsArr[param - 1].classList.add('active')
		document.getElementById(tabsArr[param - 1].getAttribute('data-id')).classList.remove('hidden')
	}
}

/**
* For mobile devices, expand/contract the map height, toggling document body class '.mapLarge'
*/
function toggleMapMobile() {
	document.getElementById('toggleMapMobile').addEventListener('click', () => {
		document.body.classList.toggle('mapLarge')
	})
}

function goBackParticipe(id, url) {
	let goBack = document.getElementById(id)
	history.pushState({ initial: true }, url) // set initial state to the first load event

	if(!goBack) throw new Error()

	goBack.addEventListener('click', () => {
		if(document.referrer === url){
			window.history.go(-1)
		}
		else {
			window.location = url
		}
	}, false)
}
/**
 * Observe if the map was deformed. Resets to the original proportion if changed
 * @param { Boolean } isPortrait The app window
 * @param { Object } map The Open Layers Map instance
 */
function mapObserver(isPortrait, map) {
	if (isPortrait) {
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
}

/*
* "Camadas" tab ('#legenda-projetos') -> Listeners for '#projetos' checkboxes
*/
function layersController(listCreated, projectLayers, layerColors, view, fitPadding, state, map, dataSheet){
	listCreated.forEach(indicador => {
		const prjId = 'projeto-id_' + indicador
		const btnProjectId = 'btn-projeto-id_' + indicador
		const gotoBtn = document.getElementById(btnProjectId)
		const element = document.getElementById(prjId)
		const layer = projectLayers.find( layer => layer.values_.projectIndicador === indicador)

		// toggle layer visibility with checkboxes (sliders) status at the tab "Camadas"
		element.onchange = () => {
			switchVisibilityState(layer, element.checked, map)
		}

		//  reset hash location, fit to clicked project, change project info
		gotoBtn.onclick = () => {

			// reset map hash location
			window.location.hash = ''

			setInitialState('initial', 3)
			const dataSheetitem = dataSheet.find(sheet => sheet.INDICADOR === indicador)
			const colors = layerColors[indicador]
			const files = getFiles(indicador, projetos, false, indicadores)

			// uncheck all itens except the clicked on tab list ('#projetos') 
			const othersIds = listCreated.filter( idItem => idItem !== indicador )
			othersIds.forEach(idItem => {
				let checkEl = 'projeto-id_' + idItem
				document.getElementById(checkEl).checked = false
			})
			element.checked = true

			// reset gotobtn except the clicked one
			const selectedButtons = [...document.getElementsByClassName('selected')]
				.filter(button => button.id !== btnProjectId)
			selectedButtons.forEach(button => button.classList.remove('selected'))
			
			// hide all other layers
			projectLayers.forEach( tohidelayer => {
				switchVisibilityState(tohidelayer, false, map)
			})
			switchVisibilityState(layer, true, map)

			// add indicador.IMAGEM if the file exists in projetos/id_projeto-name
			const champs = files => {
				if(files.images) {
					return files.images.find(image => image.name === dataSheetitem['IMAGEM'])
				}
				else { return false }
			}

			const path = files => {
				if(champs(files)) return champs(files).path
				if(files.hero) return files.hero
				if(!files.hero && files.images) return files.images[0].path
				else return false
			}
			createInfo(dataSheetitem, colors, path(files))
			tabsResetListeners(['baseInfo', 'legenda-mapas'], '#info')
			fitToId(view, layer, fitPadding)
			displayKmlInfo(layer)

			if (!state.projectSelected && state.consultaFetch.ativo === '1') { // Create element and event only once if consulta is active
				createCommentBox('infoComments', false)
				commentBoxEvents('infoComments')
			}
			resetEventListener(document.getElementById('infoComments-submit')) // recreate the button to reset eventListener at every click
			
			commentBoxSubmit('infoComments', state.idConsulta, dataSheetitem.ID, dataSheetitem.NOME) // change listener attributes at every click
		}
	})
}

/**
 * @param { Array } buttonsContentArray An array of objects
 * @param { String } query The query of que list to liten events
 * @param { Object } olMap A open layers new Map instance
 * @param { Array } allLayers An Array of open Layers new Layer instance
 * @param { Array } baseIndicadores An Array of strings
 * @param { Object } state One map was selected?
 * @param { Object } baseLayer An Open layer instance
 * @returns { EventListener }
 */
function mapsBtnClickEvent(buttonsContentArray, query, olMap, allLayers, baseIndicadores, state, baseLayer) {
	const buttons = [...document.querySelector(query).children] // [li, li ...]

	buttons.forEach(item => {
		item.addEventListener('click', event => {
			buttons.forEach(button => button.classList.remove('active'))
			item.classList.add('active')
			switchlayers(false, allLayers, olMap)

			const id = parseInt(event.target.offsetParent.id.match(/\d+/g).map(Number))
			const content = buttonsContentArray.find(item => item.id === id)
			let validLayers = []
			let validIndicadores = []

			content.layers.forEach(indicador => {
				const output = allLayers.find(validLayer => validLayer.get("projectIndicador") === indicador)
				const isBase = baseIndicadores.includes(indicador)
				if(output) {
					validLayers.push(output)
					validIndicadores.push(indicador)
				}
				if(!output && !isBase) console.error(`nota para dev: checar ${indicador} na planilha.`)
			})

			const contentNoLayers = { id: content.id, name: content.name, legenda: content.legenda, descricao: content.descricao }

			fitToId(olMap.getView(), baseLayer, state.fitPadding)
			createMapInfo(contentNoLayers)
			tabsResetListeners(['baseInfo', 'legenda-projetos'], '#mapInfo')
			switchlayers(true, validLayers, olMap)
			createCommentBox("mapInfoCommentbox", state.mapSelected)
			resetEventListener(document.getElementById('mapInfoCommentbox-submit')) // recreate the button to reset eventListener at every click
			commentBoxSubmit('mapInfoCommentbox', state.idConsulta, content.id, content.name) // change listener attributes at every click
		})
	})
}

/**
 * 
 * @param { Array } otherTabs The tab data-ids to add Event listener
 * @param { String } elementToHide Some element to add 'hidden' class
 * @returns { EventListener }
 */
function tabsResetListeners(otherTabs, elementToHide){
	const inactiveTabs = otherTabs
		.map(tab => document.querySelector(`[data-id=${tab}]`))
		
	inactiveTabs.forEach(inactiveTab => {
		inactiveTab.addEventListener('click', () => {
			document.querySelector(elementToHide).classList.add('hidden')
		})
	})
}

/**
* Add class 'hidden' to selected object information (obj) on click at button (btnId)
* @param { String } obj The id of the object which will be closed [ #info for layers and #mapInfo for maps ]
* @param { String } btnId The id of the button to click on to close the object [ #closeInfo for layers and #closeMapInfo for maps ]
*/
function closeObjectInfo(obj, btnId) {
	const btn = document.getElementById(btnId)
	const cont = document.getElementById(obj)
	btn.addEventListener('click', () => {
		cont.classList.add('hidden')
	})
}

/**
* Listen to blur events at the commentbox form input and text fields
* @param { String } idBase The base of id name
* @returns { EventListener } Form field blur event listener. Add an remove classes ('error' or 'touched') to fields
*/
function commentBoxEvents(idBase) {
	let form = document.forms[idBase]

	form.addEventListener('blur', event => {
		setErrors(event)
		const errorsListItem = document.getElementById(`${event.target.id}-error-message`)
		const error = event.target.classList.contains('error')

		if(errorsListItem !== null && error) { errorsListItem.classList.add('display') }
		if(errorsListItem !== null && !error) { errorsListItem.classList.remove('display') }

	}, true)
	form.addEventListener('keydown', e => setErrors(e), true)
}

/**
 * Setup errors classes to form field targets
 * @param { Event } event The addEventListener's event parameter
 */
function setErrors(event) {
	const validateFormExist = event.target.form

	// just proceed if this form have a 'validate' class
	if ( validateFormExist === undefined || !validateFormExist.classList.contains('validate')) return; 

	const fieldState = fieldErrors(event.target) // return isValid, message (if not valid)

	if (fieldState.isValid) {
		event.target.classList.remove('error')
		event.target.classList.add('valid')
	}
	else {
		event.target.classList.add('error')
	}
}

/**
 * Clone element to remove event listener
 * @param { HTMLElement } element 
 */
function resetEventListener(element){
	let infoClone = element.cloneNode(true)
	element.parentNode.replaceChild(infoClone, element)
}

/**
* Submit button click event 
* @param { String } idBase The base of id name of the form
* @param { Number } idConsulta The consulta id
* @param { Number } commentid The comment id
* @param { String } commentcontext The base of id name of the form
* @returns { EventListener } Event listener to #idBase-submit button
*/
function commentBoxSubmit(idBase, idConsulta, commentid, commentcontext) {
	if(commentid === undefined) console.error(`commentid is ${commentid}`)
	if(!commentcontext) console.error(`commentid is ${commentcontext}`)

	let formErrors = []

	const submitBtnId = `${idBase}-submit` 
	const fieldClassName = `${idBase}-field`
	const fieldNameId = `${idBase}-name`
	const fieldSurnameId = `${idBase}-surname`
	const fieldOrganizationId = `${idBase}-organization`
	const fieldEmailId = `${idBase}-email`
	const fieldCommentId = `${idBase}-comment`
	let submitBtn = document.getElementById(submitBtnId)

	submitBtn.addEventListener('click', e => {

		let inputs = [...document.forms[idBase].getElementsByClassName(fieldClassName)]
		inputs.forEach( input => {
			const fieldState = fieldErrors(input) // return isValid, message (if not valid)

			if (fieldState.isValid) {
				input.classList.remove('error')
			} 
			else {
				input.classList.add('error')

				// list errors
				formErrors.push({
					id: input.id,
					message: fieldState.message
				})
			}
		})

		if(formErrors.length > 0) {
			// make something with theese errors. Create an error element
			commentBoxDisplayErrors(`${idBase}-messages`, formErrors)
			formErrors = [] // reset state to next click check
		}

		else { // this form do not have errors. TODO: Remove created error an element if exist
			let name = inputs.find( input => input.id === fieldNameId).value // João
			const surname = inputs.find( input => input.id === fieldSurnameId).value // da Silva
			const organization = inputs.find( input => input.id === fieldOrganizationId).value // Tabajara LTDA
			const email = inputs.find( input => input.id === fieldEmailId).value
			const content =  inputs.find( input => input.id === fieldCommentId).value

			name = `${name} ${surname}` // João da Silva
			if (organization || organization !== '') { name = `${name} (${organization})` } // João da Silva (Tabajara LTDA)

			const output = {
				'idConsulta': idConsulta,
				'name': name,
				'email': email,
				'content': content,
				'public': 0,
				'trash': 0,
				'postid': 0,
				'commentid': commentid,
				'commentcontext': commentcontext
			}
			apiPost('members', output, idBase)
		}
		e.preventDefault()
	}, false)
}


/**
* Check form field input errors
* @param { HTMLElement } field The element input field to check for errors
* @returns { Object } if is Valid { isValid, id } . If is not valid { isValid, message, id }
* isValid -> Boolean. This field is valid or not.
* message -> String. The error message.
*/
function fieldErrors(field){
	const validity = field.validity
	if( validity.valid ) { // form is valid
		return {
			isValid: true
		} 
	}

	let message = field.title ? field.title : 'Campo inválido'

	// badInput, customError, patternMismatch, rangeOverflow, rangeUnderflow, stepMismatch, tooLong, tooShort, typeMismatch, valid, valueMissing
	const messagesComplements = [
		['badInput', 'Padrão inválido'],
		['patternMismatch', 'Padrão inválido'],
		['tooLong', 'Texto muito longo'],
		['tooShort', 'Texto muito curto'],
		['valueMissing', 'Escreva algo'],
		['typeMismatch', 'Tipo de valor incorreto']
	]

	if ( !validity.valid ) {
		for (let errorType in validity) {
			if (validity[errorType]) { // if error exists
				const complement = messagesComplements.find( type => type[0] === errorType)
				complement ? message += ` <span>${complement[1]}</span>` : null // just set if is setted in messagesComplements
			}
		}
	}

	return {
		isValid: false,
		message: message
	}
}

/**
* Add event listeners to elements created after backend response
* @param { String } idBase The base name of the comment form. 'baseInfo' or 'info'
* @param { String } resType Type of response: 'error' or 'success'
8 @returns { EventListener } 
*/
function responseMessageListener(idBase, resType) {
	const btn = document.getElementById(`${idBase}-close-response`)

	if(!btn) { throw new Error(`Response close button (id: '${idBase}-close-response') undefined`) }

	btn.addEventListener('click', () => {
		let messageContainer = btn.parentNode
		messageContainer.classList.remove('error')
		messageContainer.classList.remove('success')
		messageContainer.innerHTML = ''

		if(resType === 'success') {
			document.forms[idBase].reset() //reset idBase
		}
	}, false)
}

export { 
	commentBoxEvents,
	commentBoxSubmit,
	goBackParticipe,
	resetEventListener,
	mapsBtnClickEvent,
	toggleMapMobile,
	fieldErrors,
	sidebarGoHome,
	sidebarNavigate,
	closeObjectInfo,
	mapObserver,
	layersController,
	tabsResetListeners,
	responseMessageListener
}