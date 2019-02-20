"use strict"
import 'ol/ol.css';
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { ScaleLine, ZoomSlider} from 'ol/control'
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
	// ToggleCheckbox,
	// setListActions,
	// toggleCheckbox,
	fitToId,
	smallerExtent,
	menuEvents,
	getFiles,
	createInfo,
	createBaseInfo,
} from './domRenderers'

docReady(() => {
	const justBase = baseObject(projetos) // single'BASE' projetos Object
	const baseLayers = returnBases(justBase, process.env.APP_URL, false) // open layer's BASE's layers

	const noBase = noBaseProjetos(projetos) // projetos 
	const projectLayers = returnLayers(noBase, process.env.APP_URL, colocalizados) // open layer's projects layers

	let view = new View({
		center: [ -5190695.271418285, -2696956.332871481 ],
		projection: 'EPSG:3857',
		zoom: 13,
		minZoom: 12.7,
		maxZoom: 28
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
	appmap.on('singleclick', evt => {
		let idAndextents = []
		appmap.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
			const projectjId = layer.values_.projectId
			if(projectjId !== 0) { // exclui a base
				idAndextents.push(
				{
					id: projectjId,
					extent: layer.getSource().getExtent()
				})
			}
		})
		if (idAndextents.length >= 1) {
			const smaller = smallerExtent(idAndextents)
			view.fit(smaller.extent, { // fit to smaller extent 
				duration: 1000
			})

			const info = document.getElementById("info")
			info.classList.remove("hidden")

			if (getProjectData(smaller.id, colocalizados)) {
				const data = getProjectData(smaller.id, colocalizados)
				const images = getFiles(smaller.id, projetos)
				const colors = layerColors[smaller.id]

				createInfo(data, colors, images)
				toggleInfoClasses()
			}
			else { renderElement("<div class='erro'>Algo deu errado... <p class='info'>Projeto ID <span>" + smaller.id + "</span></p></div>", "#info") }
		}
	})

	/*
	* sidebar events
	*/
	createBaseInfo(getProjectData('BASE', colocalizados)) // sidebar first load

	/*
	* Create all event listeners
	*/
	let setListeners = new Promise( () => {
		setTimeout(() => {
			/*
			* Sidebar (left) -> Go home
			*/
			let gohomeName = document.getElementById('gohomeName')
			gohomeName.innerText = getProjectData('BASE', colocalizados).NOME
			let gohome = document.getElementById('gohome')
			gohome.addEventListener('click', function() {
				document.getElementById('info').classList.add('hidden')
				document.getElementById('gohome').classList.add('hidden')
				document.getElementById('baseInfo').classList.remove('hidden')
				fitToId(view, baseLayers, 0)
			})

			/*
			* Sidebar (left) -> Hide entire menu
			*/
			var hideshow = document.getElementById('toggleHidden')
			hideshow.addEventListener('click', function(event) {
				console.log(event)
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
			if (window.innerHeight < window.innerWidth) {
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

				// fit to clicked project, change Sidebar (left) info, uncheck other layers, change display
				gotoBtn.onclick = () => {
					const data = getProjectData(id, colocalizados)
					const colors = layerColors[id]
					const images = getFiles(id, projetos)

					// fit to clicked project, change Sidebar (left) info
					createInfo(data, colors, images)
					toggleInfoClasses()
					fitToId(view, projectLayers, id)
					document.getElementById('panel').classList.remove('open')
				}

				// change layer display
				element.onchange = () => {
					// console.log('checkbox')
					// console.log(id)
					switchVisibilityState(projectLayers, element.checked, id)
				}
			})
		}, 0)
	})

	/*
	* Fit to the first kml base layer
	*/
	let fitToBaseLayer = new Promise( () => {
		setTimeout(() => {
			fitToId(view, baseLayers, 0) // fit to base layer
		}, 1500 )
	})

	/*
	* Add non base layers to the map
	*/
	let addProjectLayers = new Promise( () => {
		setTimeout(() => {
			projectLayers.forEach(layer => appmap.addLayer(layer)) // add project layers
		}, 0)
	})

	let addControls = new Promise ( () => {
		setTimeout(() => {
			appmap.addControl(new ScaleLine())
			appmap.addControl(new ZoomSlider())
		}, 0)
	})

	/*
	* Ordered app initiation 
	*/
	Promise.all([
		/*
		 * First create DOM elements
		*/
		createList(colocalizados), // TODO: injetar lista adicionado com layerSwitcher
		// setListActions(document.getElementById("projetos"), view, projectLayers),
		menuEvents(document.getElementsByClassName('menu-display'), document.getElementById("panel"))
	])
	/*
	* Then add event listeners and create map events
	*/
	.then( () => setListeners)
	.then( () => fitToBaseLayer )
	.then( () => addProjectLayers )
	.then( () => addControls)
	.catch( error => console.error(error) )
})


