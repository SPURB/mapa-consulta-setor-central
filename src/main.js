import docReady from 'document-ready';
import Map from 'ol/Map';
import View from 'ol/View';
import KML from 'ol/format/KML';
import {  Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import VectorSource from 'ol/source/Vector.js';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { click } from 'ol/events/condition'
import { children as projetos } from '../data-src/projetos'; // para atualizar data-src/projetos.jso e colocalizados.json -> 'npm run files'
import * as colocalizados from  '../data-src/colocalizados' 
import Fill from 'ol/style/Fill';
import { isNumber } from 'util';
import { async } from 'q';

/*
create navigation options
*/
function createList(obj){
	let cleanList = [] 
	let list = "<option value='0'>-- Escolha --</option>"

	for (let projeto of Object.values(obj)){ 
		if(isNumber(projeto.id)){
			cleanList.push(projeto)
		}
	}

	cleanList.forEach( item => {
		list += '<option '+ "class='nav-projeto' " +"value='" +  item.id + "'>" + item.nome + '</option>'
	})
	let projetos = document.getElementById('projetos')
	projetos.innerHTML = list
}

/*
set id from choosed option and call fitToId
*/
function getFromSelect(element, view, layers){
	element.onchange = () => {
		let idprojeto = element.options[element.selectedIndex].value	 // value tag from the DOM
		idprojeto = parseInt(idprojeto)

		try {
			fitToId(view, layers, idprojeto)
		}
		catch {
			return idprojeto + 'sem arquivos'
		} 
	}
}

/*
fit to id
*/
function fitToId(view, layers, id){
	try {
		const layerToFit = layers.find( layer => layer.values_.projectId === id) // layer.values_.projectId -> para obter valor injetado "projectId" em returnLayers()

		view.fit(layerToFit.getSource().getExtent(), {
			duration: 1500
		})
	}
	catch (error) {
		console.error(error)
	}
}


/*
open layer itens
*/
function returnLayers(projetos, app_url){
	try{
		let kmlLayers = []
		projetos.forEach(projeto => { 
			const files = projeto.children

			let projectId = projeto.name.substring(0,3) // "1_a", "2_m", "05_"
			projectId = projectId.replace(/[^\d]/g, '')  // "1", "2", "5"
			projectId = parseInt(projectId) // 1, 2, 5

			if (projeto.name !== '00_base') {

				// Create projeto's layer
				files.forEach( file => {
					if(file.extension === '.kml'){
						const source = new VectorSource({
							url: app_url + file.path,
							format: new KML({ extractStyles: false })
						})

						const style = new Style({
							stroke: new Stroke({
								color: setRandomColor(),
								width: 1.5
							}),
							fill: new Fill({
								color: [255, 255, 255, 0.25]
							})
						})


						kmlLayers.push({
							layer: new VectorLayer({
								source: source,
								style: style, 
								projectId: projectId // set id from the folder name 
							}), 
						})
					}
				})
			}

			// Create base layers
			else if (projeto.name === '00_base'){
				files.forEach( file => {
					if(file.extension === '.kml'){
						const source = new VectorSource({
							url: app_url + file.path,
							format: new KML({ extractStyles: false })
						})

						const style = new Style({
							stroke: new Stroke({
								color: [0, 0, 0, 1],
								width: 1,
								lineDash: [5]
							}),
							fill: new Fill({
								color: [255, 255, 255, 0]
							})
						})

						kmlLayers.unshift({
							layer: new VectorLayer({ 
								source: source,
								style: style,
								projectId: projectId // set id from the folder name 
							})
						})
					}
				})
			}
		})
		const layers = kmlLayers.map(vector => vector.layer)
		// Mapa base
		const bingMaps = new TileLayer({
			source: new BingMaps({
			imagerySet: 'CanvasGray',
			culture: 'pt-BR',
			key: process.env.BING_API_KEY
			})
		})
		layers.unshift(bingMaps)

		return layers
	}
	catch (error) { console.error(error) } 
}

function setRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
		return color
}

function displayFeatureInfo(pixel, map) {
	let features = [];
	map.forEachFeatureAtPixel(pixel, feature => features.push(feature))

	if (features.length > 0) {
		let info = [];
		features.forEach(feature => { 
			info.push(feature.get('Layer')) 
		})

		document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
			map.getTarget().style.cursor = 'pointer';
	} else {
		document.getElementById('info').innerHTML = '&nbsp;';
		map.getTarget().style.cursor = '';
	}
}


// var changeInteraction = function() {
// 	if (select !== null) {
// 		map.removeInteraction(select);
// 	}
// 	var value = selectElement.value;
// 		if (value == 'singleclick') {
// 	select = selectSingleClick;
// 		} else if (value == 'click') {
// 	select = selectClick;
// 		} else if (value == 'pointermove') {
// 	select = selectPointerMove;
// 		} else if (value == 'altclick') {
// 	select = selectAltClick;
// 		} else {
// 	select = null;
// 	}
// 	if (select !== null) {
// 		map.addInteraction(select);
// 		select.on('select', function(e) {
// 		document.getElementById('status').innerHTML = '&nbsp;' +
// 			e.target.getFeatures().getLength() +
// 			' selected features (last operation selected ' + e.selected.length +
// 			' and deselected ' + e.deselected.length + ' features)';
// 		});
// 	}
// };

docReady(() => {
	/*
	render map
	*/
	const thisMapLayers = returnLayers(projetos, process.env.APP_URL)

	let view = new View({
		center: [ -5193050.487352, -2693402.011056 ],
		projection: 'EPSG:3857',
		zoom: 13
	})


	let map = new Map({
		layers: thisMapLayers,
		loadTilesWhileAnimating: true,
		target: document.getElementById('map'),
		view: view
	})


	/* 
	mouse events
	*/
	map.on('pointermove', evt => {
		if (evt.dragging) {
			return;
		}
		let pixel = map.getEventPixel(evt.originalEvent);
			displayFeatureInfo(pixel, map);
	});

	map.on('click', evt => {
		console.log(evt)
		
		displayFeatureInfo(evt.pixel, map);
	})


	/*
	init app
	*/
	let fitToBaseLayer = new Promise( (resolve) => {
		setTimeout(() => fitToId(view, thisMapLayers, 0), 500 )
	})

	Promise.all([
		createList(colocalizados), 
		getFromSelect(document.getElementById("projetos"), view, thisMapLayers)
	])
	.then( () => fitToBaseLayer )
	.catch( erro => console.error(error) ) 
})
