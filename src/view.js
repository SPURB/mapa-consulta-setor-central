"use strict"
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
// import Collection from 'ol/Collection';
// import PluggableMap from 'ol/PluggableMap';
import { projetos, colocalizados  } from './model'
import { returnLayers, layerColors, getProjectData } from './layers/projectsKmls'
import { returnBases } from './layers/bases'
import {
	baseObject,
	noBaseProjetos,
	renderElement,
	createList,
	setListActions,
	fitToId,
	smallerExtent,
	menuEvents,
	getFiles,
	createInfo,
	createBaseInfo,
	setEventListeners
} from './domRenderers'

docReady(() => {
	const justBase = baseObject(projetos) // single'BASE' projetos Object
	const baseLayers = returnBases(justBase, process.env.APP_URL, false) // open layer's BASE's layers

	const noBase = noBaseProjetos(projetos) // projetos 
	const projectLayers = returnLayers(noBase, process.env.APP_URL) // open layer's projects layers

	let view = new View({
		center: [ -5190695.271418285, -2696956.332871481 ],
		projection: 'EPSG:3857',
		zoom: 13,
		minZoom: 12.7,
		maxZoom: 28
	})

	let map = new Map({
		layers: baseLayers, 
		loadTilesWhileAnimating: true,
		target: 'map',
		view: view
	})

	/*
	* map events
	*/
	map.on('singleclick', evt => {
		let idAndextents = []
		map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
			const projectjId = layer.values_.projectId
			if(projectjId !== 0) { // exclui a base
				idAndextents.push(
				{
					id: projectjId,
					extent: layer.getSource().getExtent()
				})
			}
		})
		if(idAndextents.length >= 1) {
			const smaller = smallerExtent(idAndextents)
			view.fit(smaller.extent, { // fit to smaller extent 
				duration: 1000
			})

			const info = document.getElementById("info")
			info.classList.remove("hidden")

			if(getProjectData(smaller.id, colocalizados)){
				const data = getProjectData(smaller.id, colocalizados) // get data from colocalizados.json
				const images = getFiles(smaller.id, projetos)

				createInfo(data, layerColors[smaller.id], images)
				document.getElementById('baseInfo').classList.add('hidden') // classes' changes for clicks on map
				document.getElementById('gohome').classList.remove('hidden')
				if (window.innerHeight > window.innerWidth) {
					document.getElementById('infowrap').classList.remove('hidden')
					document.getElementById('toggleHidden').classList.add('rotate')
				}
				else {
					document.getElementById('infowrap').classList.add('hidden')
					document.getElementById('toggleHidden').classList.remove('rotate')
				}
			}
			else { renderElement("<div class='erro'>Algo deu errado... <p class='info'>Projeto ID <span>" + smaller.id + "</span></p></div>", "#info") }
		}
	})

	/*
	* sidebar events
	*/
	createBaseInfo(getProjectData('BASE', colocalizados))

	let fitToBaseLayer = new Promise( () => {
		setTimeout(() => {
			fitToId(view, baseLayers, 0)
		}, 1500 )
	})

	let addProjectLayers = new Promise( () => {
		setTimeout(() => {
			// map.addLayer(projectLayers[0])
			// console.log(projectLayers)
			projectLayers.forEach(layer => map.addLayer(layer))
		}, 1)
	})

	let setListeners = new Promise( () => {
		setTimeout(() => {
				setEventListeners()
				/*
				* for landscape devices, resize map for sidebar hiding/showing
				*/
				if (window.innerHeight < window.innerWidth) {
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

		}, 1)
	})

	/*
	* ordered map initiation 
	*/
	Promise.all([
		createList(colocalizados),
		setListActions(document.getElementById("projetos"), view, projectLayers),
		menuEvents(document.getElementsByClassName('menu-display'), document.getElementById("panel")),
		// menuEvents(document.getElementsByClassName('info-display'), document.getElementById("info")),
	])
	.then( () => fitToBaseLayer )
	.then( () => addProjectLayers )
	.then( () => setListeners)
	.catch( error => console.error(error) )

})