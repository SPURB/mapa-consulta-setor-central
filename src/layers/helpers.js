import { Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector.js'
import KML from 'ol/format/KML'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'

/**
 * Return open layer source and file from kml file
 * @param { String } name Layer name
 * @param { String } path kml file complete path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param { Object } custom custom open layer styles. Availables: color(Array), width(Number), lineDash(Number), fillCollor(Array)
 * @returns { Object } Open Layer new Vector instance
 */
function setLayer(name, path, project, custom = false){
	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	let style;

	const color = custom.color ? custom.color : [0, 0, 0, 1]
	const width = custom.width ? custom.width : 1
	const lineDash = custom.lineDash ? custom.lineDash : false
	const fillCollor = custom.fillCollor ? custom.fillCollor : [255, 255, 255, 0]

	style = new Style({
		stroke: new Stroke({
			color: color,
			width: width,
			lineDash: lineDash
		}),
		fill: new Fill({
			color: fillCollor
		})
	})

	return new VectorLayer({
		title: name,
		source: source,
		style: style,
		projectId: project.id, // !!! this is important !!!,
		projectIndicador: project.indicador
	})
}

/**
 * Return open layer source and file from kml file. These layers use common
 * @param { String } name Layer name
 * @param { String } path kml file complete path
 * @param { Number } id kml file complete path
 * @param { String } indicador kml file complete path
 * @param { Array } rgba kml file complete path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
*/
function setComplexLayer(name, path, id, indicador, rgba){
	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	const types = {
		"B1": "ZONA",
		"B2": "DensidPop",
		"B3": "Dens_const", 
		"B4": "ZONA",
		"B5": "ZONA",
		"B6": "ZONA",
		"B7": "Layer"
	}
	const booleanFill = [rgba[0], rgba[1], rgba[2], 1]

	let styleCache = {}

	let style = feature => {
		const type = feature.get(types[indicador])

		// if(type) console.log(type)

		const variator = val => {
			if(indicador === "B1" && type === "ZDE-1") return booleanFill
			if(indicador === "B2") return [rgba[0], rgba[1], rgba[2], parseFloat(val) * (0.00001)]
			if(indicador === "B3") return [rgba[0], rgba[1], rgba[2], parseFloat(val) * (0.1)]
			if(indicador === "B4" && type === "ZEIS-1") return booleanFill
			if(indicador === "B5" && type === "ZEIS-3") return booleanFill
			if(indicador === "B7" && type === "Eixos Estratégicos") return booleanFill
			else { 
				return [0,255,0, 0]
			}// errors or setup needed
		}

		let styleFeature = styleCache[type]

		if(!styleFeature) {

			styleFeature = new Style({
				fill: new Fill({
					color: variator(type)
				}),
				stroke: new Stroke({
					color: variator(type)
				})
			});
			styleCache[type] = styleFeature 
		}
		return styleFeature
	}

	return new VectorLayer({
		title: name,
		source: source,
		style: style,
		projectId: id, // !!! this is important !!!,
		projectIndicador: indicador
	})
}

/**
* Return the project data
* @param { Number } id The project id
* @param { Object } colocalizados  The colocalizados.json data
* @return { Object } The project data
*/
function getProjectData(id, colocalizados){
	let output = false
	for (let projeto in colocalizados){
		if (colocalizados[projeto].ID === id) { 
			output = colocalizados[projeto] 
		}
	}
	return output
}

export{ setLayer, setComplexLayer, getProjectData }