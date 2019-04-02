import { simples, projetos, indicadores, apiPost } from './model'
import { getProjectData } from './layers/helpers'
import { 
	setInitialState,
	fitToId,
	// fitToNewId,
	switchVisibilityState,
	switchlayers,
	getFiles,
	createInfo,
	createCommentBox,
	commentBoxDisplayErrors,
	toggleInfoClasses,
	displayKmlInfo
} from './domRenderers'

/**
* Sidebar (top left) - Render initial base layer info and resets map to the initial state
*/
function sidebarGoHome (layers, baseLayer, view, fitPadding, map){
	let gohome = document.getElementById('gohome')
	gohome.addEventListener('click', () => {
		setInitialState('initial')
		fitToId(view, baseLayer, fitPadding)
		switchlayers(false, layers, map)
	})
}

/**
 * Sidebar (left top) -> Hide all left menu
 */
function sideBarToggleChildren(){
	let hideshow = document.getElementById('toggleHidden')
	hideshow.addEventListener('click', () => {
		document.getElementById('info-kml').classList.add('no-display')
		document.getElementById('map').classList.toggle('no-panel')
		document.getElementById('infowrap').classList.toggle('hidden')
		hideshow.classList.toggle('rotate')
	})
}


/*
* Sidebar (left) -> Project picture info events - toggle source box
*/
function sideBarToggleFonte(){
	let openFonteBt = document.getElementById('openFonte')
	let closeFonteBt = document.getElementById('closeFonte')

	openFonteBt.addEventListener('click', function(event) {
		event.target.parentNode.classList.remove('closed')
		event.target.parentNode.classList.add('open')
	})

	closeFonteBt.addEventListener('click', function(event) {
		event.target.parentNode.classList.remove('open')
		event.target.parentNode.classList.add('closed')
	})	
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

// function onLayerChange(query, projectLayers, olMap){
// 	let  camadasList = [...document.querySelector(query).children]
// 		.map(item => {
// 			return {
// 				input: item.getElementsByTagName("input")[0],
// 				button: item.getElementsByTagName("button")[0]
// 			}
// 		})
// 		.forEach(el => {
// 			el.input.onchange = () =>{
// 				el.input.checked ? el.button.classList.add('selected') : el.button.classList.remove('selected')
// 			}
// 		})
// }

/*
* Sidebar (right) -> Listeners for projetos checkboxes
*/
function layersController(listCreated, projectLayers, layerColors, view, fitPadding, state, map, dataSheet){
	listCreated.forEach(indicador => {
		const prjId = 'projeto-id_' + indicador
		const btnProjectId = 'btn-projeto-id_' + indicador
		const gotoBtn = document.getElementById(btnProjectId)
		const element = document.getElementById(prjId)
		const layer = projectLayers.find( layer => layer.values_.projectIndicador === indicador)

		// toggle layer visibility with checkboxes status at Sidebar (right)
		element.onchange = () => {
			switchVisibilityState(layer, element.checked, map)
			// element.checked ? gotoBtn.classList.add('selected') : gotoBtn.classList.remove('selected')
		}

		// fit to clicked project, change Sidebar (left) info, fit
		gotoBtn.onclick = () => {
			setInitialState('initial')
			const idKml = indicadores[indicador]
			const data = projetos.find(projeto => projeto.id === idKml)
			const dataSheetitem = dataSheet.find(sheet => sheet.INDICADOR === indicador)
			const colors = layerColors[indicador]
			const images = getFiles(indicador, projetos, false, indicadores)

			// uncheck all itens except the clicked one at Sidebar (right) 
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

			// hide panel Sidebar (right)
			document.getElementById('panel').classList.remove('open')
			document.getElementById('map').classList.remove('no-panel')

			// fit to clicked project, change Sidebar (left) info
			createInfo(dataSheetitem, colors, images)
			toggleInfoClasses()

			fitToId(view, layer, fitPadding)
			displayKmlInfo(layer.values_)

			// Setup commentBox 
			if (!state.projectSelected) { // Create element and event only once only once
				createCommentBox('info', false)
				commentBoxEvents('info')
			}
			resetEventListener(document.getElementById('info-submit')) // recreate the button to reset eventListener at every click
			commentBoxSubmit('info', state.idConsulta, data.ID, data.NOME) // change listener attributes at every click
		}
	})
}
/**
 * @param { Array } buttonsContentArray An array of objects
 * @param { String } query The query of que list to liten events
 * @param { Object } olMap A open layers new Map instance
 * @param { Array } allLayers An Array of open Layers new Layer instance
 * @param { Array } baseIndicadores An Array of strings
 * @returns { EventListener }
 */
function mapsBtnClickEvent(buttonsContentArray, query, olMap, allLayers, baseIndicadores) {
	const buttons = [...document.querySelector(query).children] // [li, li ...]
		.map(item => item.firstChild)

	// const indicadoresFromLayers = allLayers.map(l => l.get("projectIndicador"))

	buttons.forEach(item => {
		item.addEventListener('click', event => {
			switchlayers(false, allLayers, olMap)

			const id = parseInt(event.target.id.match(/\d+/g).map(Number))
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

			switchlayers(true, validLayers, olMap)
		})
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
* Add event listeners to toggle 'open' class to an element to hide 
* @param { HTMLElement } triggers The element from DOM to listen event click
* @param { HTMLElement } toHide The element to hide 
* @returns { EventListener }
*/ 
function menuEvents (triggers, toHide){
	const normalizedHTMLArr = [...triggers]

	normalizedHTMLArr[0].addEventListener('click', event =>{
		toHide.classList.toggle('open')
		normalizedHTMLArr[1].classList.remove('hide')
	})
	normalizedHTMLArr[1].addEventListener('click', event =>{
		toHide.classList.toggle('open')
		normalizedHTMLArr[0].classList.remove('hide')
	})
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
			// submitBtn.classList.add('fetching')
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

	// console.log(validity)
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
	resetEventListener,
	mapsBtnClickEvent,
	// onLayerChange,
	fieldErrors, 
	sidebarGoHome, 
	sideBarToggleChildren,
	sideBarToggleFonte,
	mapObserver,
	layersController,
	menuEvents,
	responseMessageListener
}