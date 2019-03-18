import 'ol/ol.css'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { ScaleLine, ZoomSlider} from 'ol/control'
import { pointerMove } from 'ol/events/condition'
import Select from 'ol/interaction/Select.js'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import { projetos, colocalizados, apiGet  } from './model'
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
	getFiles,
	createInfo,
	createBaseInfo,
	setInitialState,
	createCommentBox,
	displayKmlInfo
} from './domRenderers';

import { 
	commentBoxEvents,
	commentBoxSubmit,
	resetEventListener,
	sidebarGoHome, 
	sideBarToggleChildren,
	sideBarToggleFonte,
	mapObserver,
	layersController,
	menuEvents
} from './eventListeners'

docReady(() => {
	const baseLayers = returnBases(baseObject(projetos), process.env.APP_URL, false) // open layer's BASE's layers (bing maps and id === 0)
	const baseLayer = baseLayers.find( layer => layer.values_.projectId === 0) // open layer's BASE (id === 0)
	const projectLayers = returnLayers(noBaseProjetos(projetos), process.env.APP_URL, colocalizados) // open layer's projects layers
	const isPortrait = window.matchMedia("(orientation: portrait)").matches // Boolean -> innerHeight < innerWidth
	const fitPadding = isPortrait ? [0, 0, 0, 0] : [0, 150, 0, 300] // padding for fit(extent, { padding: fitPadding }) and fitToId(..,.., fitPadding)

	let state = {
		projectSelected: false, // project clicked at map or right sidebar?
		idConsulta: 36
	}

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
			projectLayers.forEach( lyr => switchVisibilityState(lyr, true))
			listCreated.forEach( liItem =>  document.getElementById('projeto-id_' + liItem ).checked = true )

			const projectjId = layer.values_.projectId
			const kmlData = layer.values_
			if(projectjId !== 0) { // exclude the base
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

			const smaller = smallerExtent(idAndextents) // resolve clicks in overlays, gets the smaller extent
			view.fit(smaller.extent, { // fit to smaller extent 
				padding: fitPadding
			})

			const info = document.getElementById("info")
			info.classList.remove("hidden")

			const projectData = getProjectData(smaller.id, colocalizados) 

			if (projectData) {
				const images = getFiles(smaller.id, projetos)
				const colors = layerColors[smaller.id]

				displayKmlInfo(smaller.kmlData)
				createInfo(projectData, colors, images)
				toggleInfoClasses(isPortrait)

				// Setup commentBox create element only once
				if (!state.projectSelected) {
					createCommentBox('info', false)
					commentBoxEvents('info')
				} // setup errors only once

				resetEventListener(document.getElementById('info-submit')) // recreate the button to reset eventListener
				commentBoxSubmit('info', state.idConsulta, projectData.ID, projectData.NOME) // change listener attributes at every click
				state.projectSelected = true // change state to run setup only once
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
	const addPannels = new Promise ( (resolve, reject) => {
		setTimeout(() => {
			createBaseInfo(getProjectData('BASE', colocalizados)) // sidebar first load
			createList(colocalizados)
			document.getElementById('gohomeName').innerText = getProjectData('BASE', colocalizados).NOME
		},0)
	})

	const addCommentBox = new Promise ((resolve, reject) => {
		setTimeout(() => {
			try { resolve ( createCommentBox("baseInfo", state.projectSelected) ) }
			catch (error) { reject(error) }
		}, 0)
	})

	/*
	* Event listeners
	*/
	const commentBoxListeners = new Promise ((resolve, reject) => {
		setTimeout(() => {
			try {
					resolve(
						commentBoxEvents('baseInfo'),
						commentBoxSubmit('baseInfo', state.idConsulta, 2, 'Mapa base')
					)
				}
			catch(error) { reject(error) }
		}, 1)
	})

	/*
	* Create all other event listeners
	*/
	let pannelListeners = new Promise( (resolve, reject) => {
		setTimeout(() => {
			try{
				resolve(
					// left sidebar
					sidebarGoHome(projectLayers, baseLayer, listCreated, view, fitPadding),
					sideBarToggleChildren(),
					sideBarToggleFonte(),

					// map
					mapObserver(isPortrait, appmap),

					// right sidebar
					menuEvents(document.getElementsByClassName('menu-display'), document.getElementById("panel")),
					layersController(listCreated, projectLayers, layerColors, view, fitPadding, state)
				)
			}
			catch(error) { reject(error) }

		}, 1)
	})

	/*
	* Fit the view to base layer
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
	* Ordered app initiation chain. This is done just once
	*/
	Promise.all([
		/*
		 * Create DOM elements
		*/
		addPannels,
		addCommentBox
	])
	/*
	* Then chain event listeners
	*/
	.then( () => pannelListeners )
	.then( () => commentBoxListeners )
	/*
	 * and map events
	*/
	.then( () => fitToBaseLayer )
	.then( () => addProjectLayers )
	.then( () => addControls )
	// TODO: fetch comments of state.idConsulta
	.catch( error => { 
		throw new Error(error)
	})
})
