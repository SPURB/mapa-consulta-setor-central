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
import { projetos, simples, bases  } from './model'
// import { returnLayers, layerColors, getProjectData } from './layers/projectsKmls'
import { getProjectData } from './layers/helpers'
import { createBaseParams, returnBases } from './layers/bases'
import { returnSimples, layerColors } from './layers/simples'
import {
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
	parseNameToNumericalId,
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
	let state = {
		projectSelected: false, // project clicked at map or right sidebar?
		idConsulta: 36,
		baseLayerID: 201, // project main layer id,
		basesIDs: [ 202 ], // other bases
		bing: false,
		appUrl: process.env.APP_URL
	}

	/**
	 * ****************************************
	 * start getBaseParams // start BASE LAYERS
	 * ****************************************
	 * TODO: simplify create getBaseParams in src/layers/bases.js
	 * getBaseParams(baseinfoId, [basesIds], projetos) // return { info{}, infos[], colors{} }
	 */
	// const baseParams = createBaseParams(baseinfoId, bases, state.baseLayerID, state.basesIDs)

	// console.log(baseParams)

	const baseInfo = projetos.find(projeto => parseNameToNumericalId(projeto.name) === state.baseLayerID)

	// create base layers constants
	let baseInfos = [] // projetos.json the bases object ids (pushed above)
	state.basesIDs.forEach(id => {
		baseInfos.push(projetos.find(projeto => parseNameToNumericalId(projeto.name) === id)) // find project instance in 
	})
	baseInfos = baseInfos.map(projeto => { return { info:projeto, id:parseNameToNumericalId(projeto.name) }}) // add id to baseInfos
	/* 
	* end getBaseParams
	*/

	//create base layers open layers instances
	const baseLayers = returnBases({ info: baseInfo, id: state.baseLayerID }, baseInfos, state.appUrl, state.bing) // open layer's BASE's layers
	const baseLayer = baseLayers.find( layer => layer.values_.projectId === state.baseLayerID) // open layer's BASE (id === 201)
	// end BASE LAYERS

	/**
	 * **************************
	 * ** start simples layers **
	 * **************************
	*/
	const simplesLayers = returnSimples(projetos, simples, state.appUrl)
	/* 
	* end simples layers
	*/

	// const projectLayers = returnLayers(noBaseProjetos(projetos), process.env.APP_URL, simples) // open layer's projects layers
	const isPortrait = window.matchMedia("(orientation: portrait)").matches // Boolean -> innerHeight < innerWidth
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
	// appmap.addInteraction(
	// 	new Select({
	// 		condition: pointerMove,
	// 		layers: simplesLayers, // filter interactables
	// 		style: new Style({
	// 			stroke: new Stroke({
	// 				color: [0, 255, 0, 1],
	// 				width: 3
	// 			}),
	// 			fill: new Fill({
	// 				color: [255, 255, 255, 0.5]
	// 			})
	// 		}),
	// 		hitTolerance: 10
	// 	})
	// )

	appmap.on('singleclick', evt => {
		setInitialState('initial')

		let idAndextents = []
		appmap.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {

			//reset visibilty
			simplesLayers.forEach( lyr => switchVisibilityState(lyr, true))
			listCreated.forEach( liItem =>  document.getElementById('projeto-id_' + liItem ).checked = true )

			const projectjId = layer.values_.projectId
			const kmlData = layer.values_

			const isBase = () => { // exclusion rules. Unclickable layers
				if (projectjId === state.baseLayerID) return true // project layer
				if (state.basesIDs.includes(projectjId)) return true // base layers
				else return false
			}

			if(!isBase()) {
				idAndextents.push({
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

			const projectData = getProjectData(smaller.id, simples)

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
			createBaseInfo(getProjectData(state.baseLayerID, bases)) // sidebar first load
			createList(simples)
			document.getElementById('gohomeName').innerText = getProjectData(state.baseLayerID, bases).NOME
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
					sidebarGoHome(baseLayers, baseLayer, listCreated, view, fitPadding),
					sideBarToggleChildren(),
					sideBarToggleFonte(),

					// map
					mapObserver(isPortrait, appmap),

					// right sidebar
					menuEvents(document.getElementsByClassName('menu-display'), document.getElementById("panel")),
					layersController(listCreated, simplesLayers, layerColors, view, fitPadding, state)
				)
			}
			catch(error) { reject(error) }

		}, 1)
	})

	/*
	* Fit the view to base layer
	*/
	const fitToBaseLayer = new Promise( (resolve, reject) => {
		const baseLayer = baseLayers.find( layer => layer.values_.projectId === state.baseLayerID)
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
			try { resolve(simplesLayers.forEach(layer => appmap.addLayer(layer))) } // add project layers 
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
