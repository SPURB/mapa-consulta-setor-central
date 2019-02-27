"use strict"
// import 'ol/ol.css'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { ScaleLine, ZoomSlider} from 'ol/control'
import { pointerMove } from 'ol/events/condition'
import Select from 'ol/interaction/Select.js'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import { projetos, colocalizados  } from './model'
import { returnLayers, layerColors, getProjectData } from './layers/projectsKmls'
import { returnBases } from './layers/bases'
import {
	baseObject,
	noBaseProjetos,
	renderElement,
	createList,
	listCreated,
	toggleInfoClasses,
	switchVisibilityState,
	fitToId,
	smallerExtent,
	menuEvents,
	getFiles,
	createInfo,
	createBaseInfo,
	setInitialState,
	createCommentBox,
	fieldErrors,
	displayKmlInfo
} from './domRenderers'

docReady(() => {
	const justBase = baseObject(projetos) // single'BASE' projetos Object
	const baseLayers = returnBases(justBase, process.env.APP_URL, true) // open layer's BASE's layers
	const baseLayer = baseLayers.find( layer => layer.values_.projectId === 0)
	const noBase = noBaseProjetos(projetos) // projetos 
	const projectLayers = returnLayers(noBase, process.env.APP_URL, colocalizados) // open layer's projects layers
	const isPortrait = window.matchMedia("(orientation: portrait)").matches // window.innerHeight < window.innerWidth
	const fitPadding = isPortrait ? [0, 0, 0, 0] : [0, 150, 0, 300] // padding for fit(extent, { padding: fitPadding }) and fitToId(..,.., fitPadding)

	let view = new View({
		center: [ -5190695.271418285, -2696956.332871481 ],
		projection: 'EPSG:3857',
		zoom: 14,
		minZoom: 12.7,
		maxZoom: 19
	})

	let appmap = new Map({
		title:'projetos',
		layers: baseLayers, 
		loadTilesWhileAnimating: true,
		target: 'map',
		view: view,
		controls:[] // remove defaults (compass, +- zoom buttons, attribution)
	})

	/*
	* map events
	*/
	appmap.addInteraction(
		new Select({
			condition: pointerMove,
			layers: projectLayers,
			style: new Style({
				stroke: new Stroke({
					color: [0, 255, 0, 1],
					width: 3
				}),
				fill: new Fill({
					color: [255, 255, 255, 0.5]
				})
			}),
			hitTolerance: 10
		})
	)

	appmap.on('singleclick', evt => {
		setInitialState('initial')

		let idAndextents = []
		appmap.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {

			//reset visibilty
			projectLayers.forEach( lyr => switchVisibilityState(lyr, true) )
			listCreated.forEach( liItem =>  document.getElementById('projeto-id_' + liItem ).checked = true )


			const projectjId = layer.values_.projectId
			const kmlData = layer.values_
			if(projectjId !== 0) { // exclui a base
				idAndextents.push(
				{
					id: projectjId,
					extent: layer.getSource().getExtent(),
					kmlData: kmlData
				})
			}
		})
		if (idAndextents.length >= 1) {
			document.getElementById('map').classList.remove('no-panel')

			const smaller = smallerExtent(idAndextents)
			view.fit(smaller.extent, { // fit to smaller extent 
				padding: fitPadding
			})

			const info = document.getElementById("info")
			info.classList.remove("hidden")

			if (getProjectData(smaller.id, colocalizados)) {
				const data = getProjectData(smaller.id, colocalizados)
				const images = getFiles(smaller.id, projetos)
				const colors = layerColors[smaller.id]

				displayKmlInfo(smaller.kmlData)
				createInfo(data, colors, images)
				toggleInfoClasses()
			}
			else { 
					renderElement(`
						<div class='erro'>Algo deu errado... 
							<p class='info'>Projeto ID <span>${smaller.id}</span></p>
						</div>`, "#info-error")
					setInitialState('error')
				}
		}
	})

	/*
	* Create DOM elements
	*/
	const addCommentBox = new Promise ((resolve, reject) => {
		setTimeout(() => {
			try { resolve (createCommentBox("#baseInfo")) } 
			catch (error) { reject(error) }
		}, 0)
	})

	/*
	* addCommentBox event listeners
	*/
	const commentBoxListeners = new Promise ((resolve, reject) => {
		setTimeout(() => {
			let formErrors = []
			// let output = {}
			/*
			 * Input fields and comment (textarea) blur events
			*/
			const listenFields = (() => {
				// reset html default validation
				document.forms["baseInfo"].setAttribute('novalidate', true)

				document.forms["baseInfo"].addEventListener('blur', event => {

					const validateFormExist = event.target.form

					// just proceed if this form have a 'validate' class
					if ( validateFormExist === undefined || !validateFormExist.classList.contains('validate')) return; 

					const fieldState = fieldErrors(event.target) // return isValid, message (if not valid)

					if (fieldState.isValid) {
						event.target.classList.remove('error')
						event.target.classList.add('touched')
					}

					else {
						event.target.classList.add('error')
					}

				}, true)

			})()

			/*
			 * Submit onclick event
			*/
			const listenSubmitBtn = (() => {
				document.getElementById("baseInfo-submit").addEventListener('click', e => {

					/*
					 * Check input errors
					*/
					let inputs = [...document.forms["baseInfo"].getElementsByClassName("baseInfo-field")]
					// console.log(inputs)

					inputs.forEach( input => {
						const fieldState = fieldErrors(input) // return isValid, message (if not valid)

						if (fieldState.isValid) {
							input.classList.remove('error')
						} else {

							input.classList.add('error')

							// list errors
							formErrors.push({
								id: input.id,
								message: fieldState.message
							})

						}
					})


					if(formErrors.length > 0) {

						// do something else with theese errors
						formErrors = [] // reset state to next click check

					} else { // form do not have errors

						const output = {
							'idConsulta': 0,
							// 'name': 'nome',
							// 'email': app.form_email,
							// 'content': app.form_content,
							'public': 0,
							'trash': 0,
							'postid': 0,
							'commentid': 0,
							// 'commentcontext': app.attr.context
						}

						inputs.forEach(input => {
							switch(input.id){
								case 'baseInfo-email' : output['email'] = input.value
							}
							console.log(input.id)
						})
						console.log(output)
					 } 

					// console.log(formError)
					e.preventDefault()
				})
			})()

			try { resolve(listenFields, listenSubmitBtn) }
			catch { reject(error) }
				
		}, 1)
	})

	/*
	* Create all other event listeners
	*/
	let setListeners = new Promise( () => {
		setTimeout(() => {
			/*
			* Sidebar events
			* Sidebar (left) -> Go home
			*/
			let gohomeName = document.getElementById('gohomeName')
			gohomeName.innerText = getProjectData('BASE', colocalizados).NOME
			let gohome = document.getElementById('gohome')
			gohome.addEventListener('click', () => {

				document.getElementById('info').classList.add('hidden')
				document.getElementById('gohome').classList.add('hidden')
				document.getElementById('baseInfo').classList.remove('hidden')

				// resetApp
				setInitialState('initial')
				fitToId(view, baseLayer, fitPadding)
				projectLayers.forEach( lyr => switchVisibilityState(lyr, true) )
				listCreated.forEach( liItem =>  document.getElementById('projeto-id_' + liItem ).checked = true )
			})

			/*
			* Sidebar (left) -> Hide menu
			*/
			let hideshow = document.getElementById('toggleHidden')
			hideshow.addEventListener('click', () => {
				document.getElementById('info-kml').classList.add('no-display')
				document.getElementById('map').classList.toggle('no-panel')
				document.getElementById('infowrap').classList.toggle('hidden')
				hideshow.classList.toggle('rotate')
			})

			/*
			* Sidebar (left) -> Project picture info events - toggle source box
			*/
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

			/*
			* Sidebar (left) -> for landscape devices, resize map for sidebar hiding/showing
			*/
			if (isPortrait) {
				let sidebar = document.getElementById('infowrap')
				var observer = new MutationObserver(function(mutationsList) {
					for(var mutation of mutationsList) {
						if (mutation.type == 'attributes') {
							setTimeout(function() { appmap.updateSize() }, 200)
						}
						else { return false }
					}
				})
				observer.observe(sidebar, { attributes: true, childList: false, subtree: false })
			}

			/*
			* Sidebar (right) -> Listeners for projetos checkboxes
			*/
			listCreated.forEach(id => {
				id = Number(id)
				const prjId = 'projeto-id_' + id 
				const btnPojectId = 'btn-projeto-id_' + id
				const gotoBtn = document.getElementById(btnPojectId)
				const element = document.getElementById(prjId)
				const layer = projectLayers.find( layer => layer.values_.projectId === id)

				// fit to clicked project, change Sidebar (left) info, fit
				gotoBtn.onclick = () => {
					setInitialState('initial')
					const data = getProjectData(id, colocalizados)
					const colors = layerColors[id]
					const images = getFiles(id, projetos)

					// uncheck all itens except the clicked one at Sidebar (right) 
					const othersIds = listCreated.filter( idItem => idItem !== id )
					othersIds.forEach(idItem => {
						let checkEl = 'projeto-id_' + idItem
						document.getElementById(checkEl).checked = false
					})
					element.checked = true
					
					// hide all other layers
					projectLayers.forEach( tohidelayer => {
						switchVisibilityState(tohidelayer, false)
					})
					switchVisibilityState(layer, true)

					// hide panel Sidebar (right)
					document.getElementById('panel').classList.remove('open')
					document.getElementById('map').classList.remove('no-panel')

					// fit to clicked project, change Sidebar (left) info
					createInfo(data, colors, images)
					toggleInfoClasses()
					const projectLayer = projectLayers.find( layer => layer.values_.projectId === id)
					fitToId(view, projectLayer,fitPadding)
					displayKmlInfo(projectLayer.values_)
				}

				// toggle layer visibility with checkboxes status at Sidebar (right)
				element.onchange = () => {
					switchVisibilityState(layer, element.checked)
				}
			})
		}, 1)
	})

	/*
	* Fit to the first kml base layer
	*/
	const fitToBaseLayer = new Promise( (resolve, reject) => {
		const baseLayer = baseLayers.find( layer => layer.values_.projectId === 0)
		setTimeout(() => {
			try { resolve(fitToId(view, baseLayer, fitPadding)) }
			catch (error) { reject(error) }
		}, 1500 )
	})

	/*
	* Add non base layers to the map
	*/
	const addProjectLayers = new Promise( (resolve, reject) => {
		setTimeout(() => {
			try { resolve(projectLayers.forEach(layer => appmap.addLayer(layer))) } // add project layers 
			catch (error) { reject(error) }
		}, 1)
	})

	const addControls = new Promise ( (resolve, reject) => {
		setTimeout(() => {
			try { resolve(appmap.addControl(new ScaleLine()), appmap.addControl(new ZoomSlider())) }
			catch (error) { reject(error) }
		}, 1)
	})


	/*
	* Ordered app initiation 
	*/
	Promise.all([
		/*
		 * First create DOM elements
		*/
		createBaseInfo(getProjectData('BASE', colocalizados)), // sidebar first load
		createList(colocalizados),
		menuEvents(document.getElementsByClassName('menu-display'), document.getElementById("panel")),
		addCommentBox
	])
	/*
	* Then add event listeners
	*/
	.then( () => setListeners )
	.then( () => commentBoxListeners )
	/*
	 * And do map events
	*/
	.then( () => fitToBaseLayer )
	.then( () => addProjectLayers )
	.then( () => addControls)
	.catch( error => console.error(error) )
})


