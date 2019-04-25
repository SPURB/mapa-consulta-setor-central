import 'ol/ol.css'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { ScaleLine, ZoomSlider} from 'ol/control'
import { getProjectData } from './layers/helpers'
import { createBaseInfos, returnBases } from './layers/bases'
import { returnSimples } from './layers/simples'
import { returnComplexos } from './layers/complexos'
import { 
	projetos,
	mapaData,
	simples,
	complexos,
	complexosIds,
	cores,
	bases
} from './model'

import {
	createList,
	createMapsBtns,
	listCreated,
	createMapInfo,
	switchlayers,
	fitToId,
	createBaseInfo,
	createCommentBox,
} from './domRenderers';

import { 
	commentBoxEvents,
	commentBoxSubmit,
	toggleMapMobile, 
	mapsBtnClickEvent,
	sidebarGoHome, 
	sidebarNavigate, 
	sideBarToggleFonte,
	closeObjectInfo, 
	mapObserver,
	layersController,
} from './eventListeners'

docReady(() => {

	let state = {
		projectSelected: false, // project clicked at map or right sidebar?
		mapSelected: false,
		idConsulta: 36,
		baseLayerObj: {id: 201, indicador: 'A33' }, // project main layer id,
		baseLayerObjects: [ 
				{id: 202, indicador: 'A34'},
				{id: 204, indicador:'A2'}, 
				{id: 203, indicador:'A1'}, 
				{id: 205, indicador:'A3'} ], // other bases
		bing: false,
		appUrl: process.env.APP_URL
	}

	const baseInfos = createBaseInfos(projetos, state.baseLayerObj.id, state.baseLayerObjects)
	const baseLayers = returnBases({
			info: baseInfos.info,
			id: state.baseLayerObj.id,
			indicador: state.baseLayerObj.indicador
		}, 
		baseInfos.infos,
		state.appUrl,
		cores,
		state.bing
	) // open layer's BASE's layers
	const baseLayer = baseLayers.find(layer => layer.values_.projectIndicador === state.baseLayerObj.indicador)

	const simplesLayers = returnSimples(projetos, simples, state.appUrl, cores)
	const complexosLayers = returnComplexos(projetos, complexos.default, complexosIds, state.appUrl, cores)

	const allLayers = [...simplesLayers, ...complexosLayers]
	const allLayersData = [...simples.default, ...complexos.default]

	let indicadoresBases = state.baseLayerObjects
		.map(item => item.indicador )
	indicadoresBases.unshift(state.baseLayerObj.indicador)

	const isPortrait = window.matchMedia("(orientation: portrait)").matches // Boolean -> innerHeight < innerWidth
	const fitPadding = isPortrait ? [0, 0, 0, 0] : [0, 0, 0, 50] // padding for fit(extent, { padding: fitPadding }) and fitToId(..,.., fitPadding)

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
	* Create DOM elements
	*/
	const addPannels = new Promise ( (resolve, reject) => {
		setTimeout(() => {
			createBaseInfo(getProjectData(state.baseLayerObj.id, bases), projetos) // sidebar first load
			createList(allLayersData, cores)
			createMapsBtns(mapaData, "#mapas", "mapas-")
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
					// sidebar
					sidebarGoHome(allLayers, baseLayer, view, fitPadding, appmap),
					sidebarNavigate(), 
					sideBarToggleFonte(),
					layersController(listCreated, allLayers, cores, view, fitPadding, state, appmap, allLayersData),
					mapsBtnClickEvent(mapaData,"#mapas", appmap, allLayers, indicadoresBases, state),
					closeObjectInfo('mapInfo', 'closeMapInfo'), 
					closeObjectInfo('info', 'closeInfo'),

					// map
					toggleMapMobile(), 
					mapObserver(isPortrait, appmap)
				)
			}
			catch(error) { reject(error) }

		}, 1)
	})

	/*
	* Fit the view to base layer and run hash location map
	*/
	const firstLoad = new Promise( (resolve, reject) => {
		const baseLayer = baseLayers.find( layer => layer.values_.projectId === state.baseLayerObj.id)
		setTimeout(() => {
			try { resolve(fitToId(view, baseLayer, fitPadding)) }
			catch (error) { reject(error) }
		}, 1500 )
	})
	.then(() =>{
		let hashLocation = window.location.hash.replace("#","")
		hashLocation = Number(hashLocation)
		const mapDataLocated = mapaData.find(data => data.id === hashLocation)

		if(mapDataLocated) {
			const validLayers = mapDataLocated.layers
				.map(indicador => allLayers.find(layer => layer.get("projectIndicador") === indicador))
				.filter(layer => layer !== undefined)

			switchlayers(true, validLayers, appmap)
			createMapInfo(mapDataLocated)
			createCommentBox("mapInfoCommentbox", state.mapSelected)
			state.mapSelected = true
			sidebarNavigate(2)
			document.getElementById('mapas-' + mapDataLocated.id).classList.add('active')
		}
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
	.then( () => firstLoad )
	.then( () => addControls )
	// TODO: fetch comments of state.idConsulta
	.catch( error => { 
		throw new Error(error)
	})
})
