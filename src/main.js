import ready from 'document-ready'
import Map from 'ol/Map';
import View from 'ol/View';
import KML from 'ol/format/KML';
import {  Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import VectorSource from 'ol/source/Vector.js';

import { children as projetos } from '../data-src/projetos' // para atualizar data-src/projetos.json -> 'npm run files'

ready(() => {

// // Creating a variable with initial value:
// var v = new Reactive(20);

// // Snapshot the value using 'get':
// console.log("v:", v.get()); // prints 20

// // Update the value using 'set':
// v.set(10);

// console.log("v:", v.get()); // now prints 10


	const app_url = process.env.APP_URL 
	let kmlLayers = []

	projetos.forEach(projeto => { 
		const files = projeto.children
		files.forEach( file => {
			if(file.extension === '.kml'){
				kmlLayers.push({
					files: files,
					layer: new VectorLayer({ 
						source: new VectorSource({
							url: app_url + file.path,
							format: new KML()
						})
					})
				})
			}
		})
	})	

	const layers = kmlLayers.map(vector => vector.layer)

	const bing = new TileLayer({
		source: new BingMaps({
		imagerySet: 'AerialWithLabels',
		key: process.env.BING_API_KEY
		})
	});

	layers.push(bing)

	let map = new Map({
		layers: layers.reverse(),
		target: document.getElementById('map'),
		view: new View({
			center: [ -5193050.487352, -2693402.011056 ],
			projection: 'EPSG:3857',
			zoom: 13
		})
	})


	function displayFeatureInfo(pixel) {
		let features = [];
		map.forEachFeatureAtPixel(pixel, feature =>features.push(feature))

		if (features.length > 0) {
			let info = [];
			features.forEach(feature => { 
				info.push(feature.get('Layer')) 
				// console.log(feature)
			})

			document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
				map.getTarget().style.cursor = 'pointer';
		} else {
			document.getElementById('info').innerHTML = '&nbsp;';
			map.getTarget().style.cursor = '';
		}
	};

	map.on('pointermove', function(evt) {
		if (evt.dragging) {
			// console.log('dragging:')
			// console.log(evt.coordinate)
			return;
		}
		let pixel = map.getEventPixel(evt.originalEvent);
			// console.log(evt.coordinate)
			displayFeatureInfo(pixel);
	});

	map.on('click', function(evt) {
		console.log('clicked: ')
		displayFeatureInfo(evt.pixel);
	})

})
