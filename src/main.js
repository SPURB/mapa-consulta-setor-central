import docReady from 'document-ready';
import Map from 'ol/Map';
import View from 'ol/View';
import KML from 'ol/format/KML';
import {  Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import VectorSource from 'ol/source/Vector.js';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { children as projetos } from '../data-src/projetos'; // para atualizar data-src/projetos.jso e colocalizados.json -> 'npm run files'
import * as colocalizados from  '../data-src/colocalizados' 
import Fill from 'ol/style/Fill';
import { isNumber } from 'util';

docReady(() => {

	/*
	navigation
	*/
	function createList(){
		let cleanList = [] 
		let list = "<option value='0'>-- Escolha --</option>"

		for (let projeto of Object.values(colocalizados)){ 
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

	function chooseFromlist(){
		document.getElementById("projetos").onchange = () => {
			let selObj = document.getElementById("projetos")
			let idprojeto = selObj.options[selObj.selectedIndex].value
			console.log(idprojeto) // id do projeto
		}
	}

	/*
	map
	*/
	function returnLayers(){
		try{
			const app_url = process.env.APP_URL 
			let kmlLayers = []

			projetos.forEach(projeto => { 
				const files = projeto.children
				files.forEach( file => {

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

					if(file.extension === '.kml'){
						kmlLayers.push({
							files: files,
							layer: new VectorLayer({ 
								source: source,
								style: style
							})
						})
					}
				})
			})

			const layers = kmlLayers.map(vector => vector.layer)

			// base layer
			const bing = new TileLayer({
				source: new BingMaps({
				imagerySet: 'CanvasGray',
				culture: 'pt-BR',
				key: process.env.BING_API_KEY
				})
			});
			layers.push(bing)

			return layers.reverse()
		}
		catch (error) { console.error(error) } 
	}

	function setRandomColor() {
		let letters = '0123456789ABCDEF';
		let color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)]
		}
			return color
	}

	function displayFeatureInfo(pixel) {
		let features = [];
		map.forEachFeatureAtPixel(pixel, feature =>features.push(feature))

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

	/*
	render map
	*/

	let map = new Map({
		layers: returnLayers(),
		target: document.getElementById('map'),
		view: new View({
			center: [ -5193050.487352, -2693402.011056 ],
			projection: 'EPSG:3857',
			zoom: 13
		})
	})

	map.on('pointermove', function(evt) {
		if (evt.dragging) {
			return;
		}
		let pixel = map.getEventPixel(evt.originalEvent);
			displayFeatureInfo(pixel);
	});

	map.on('click', evt => {
		console.log('clicked: ')
		console.log(evt)	
		displayFeatureInfo(evt.pixel);
	})


	/*
	render/watch navigation 
	*/
	createList()
	chooseFromlist()

})
