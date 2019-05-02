import { Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector.js'
import { DEVICE_PIXEL_RATIO as pixelRatio } from 'ol/has.js'
import KML from 'ol/format/KML'
import { 
	Style, 
	Icon, 
	Stroke, 
	Fill 
} from 'ol/style'


/**
 * 
 * @param {String} name The Layer name
 * @param {String} path The KML source path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param {String} icon The icon path
 * @returns { Object } Open Layer new Vector instance
 */
function setIconLayer (name, path, project, icon){
	const source = new VectorSource ({
		url: path, 
		format: new KML ({ extractStyles: false })
	})

	const style = new Style({
		image: new Icon({
			src: icon
		})
	})

	return new VectorLayer({
		name: name,
		source: source,
		projectId: project.id,
		projectIndicador: project.indicador,
		style: style
	})
}

/**
 * Return open layer source and file from kml file
 * @param { String } name Layer name
 * @param { String } path kml file complete path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param { String } type the Pattern type valid -> 'lines-crossed', 'lines-diagonal', 'lines-vertical', 'lines-horizontal' or 'dots'
 * @param { Array } fillStyle Set the line color. Optional [r,g,b,a]
 * @returns { Object } Open Layer new Vector instance
 */
function setPatternLayer(name, path, project, type, fillStyle = [0, 0, 0, 1]){
	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	const pattern = (function() {
		canvas.width = 8 * pixelRatio
		canvas.height = 8 * pixelRatio
		context.fillStyle = `rgba(${fillStyle[0]}, ${fillStyle[1]}, ${fillStyle[2]}, ${fillStyle[3]})`

		context.beginPath()

		if(type === 'lines-crossed'){
			canvas.width = 12 * pixelRatio
			canvas.height = 12 * pixelRatio

			context.moveTo(0, 0)
			context.lineTo(canvas.width, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
	
			context.beginPath()
			context.moveTo(canvas.width, 0)
			context.lineTo(0, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()

		}
		if(type === 'lines-diagonal'){
			context.fillRect(0, 0, canvas.width, canvas.height)
			context.lineWidth = 1
			context.moveTo(canvas.width, 0)
			context.lineTo(0, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 1)`
			context.lineCap = 'square'
			context.stroke()
		}

		if(type === 'lines-vertical'){
			context.moveTo(canvas.width/2, 0)
			context.lineTo(canvas.width/2, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
		}

		if(type === 'lines-horizontal'){
			context.moveTo(0, canvas.height/2)
			context.lineTo(canvas.width, canvas.height/2)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
		}
		if(type === 'dots'){ // inner circle
			context.arc(4 * pixelRatio, 4 * pixelRatio, 1.5 * pixelRatio, 0, 2 * Math.PI)
			context.fill()
		}
		if(type === 'balls'){ // inner circle
			context.arc(4 * pixelRatio, 4 * pixelRatio, 3 * pixelRatio, 0, 2 * Math.PI)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
		}

		return context.createPattern(canvas, 'repeat')
	}())

	let getStackedStyle = () => {
		let style = new Style({
			stroke: new Stroke({
				color: `rgba(0, 0, 0, 0.5)`,
				width: 1,
			}),
			fill: new Fill({
				color: pattern
			})
		})
		return style
	}

	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	return new VectorLayer({
		title: name,
		source: source,
		style: getStackedStyle,
		projectId: project.id,
		projectIndicador: project.indicador
	})
}

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
			lineDash: lineDash,
			lineCap: 'square'
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

	// Shared block styles
	const quadras = {
		'B1': 'ZONA',
		'B2': 'DensidPop',
		'B3': 'Dens_const', 
		'B4': 'ZONA',
		'B5': 'ZONA',
		'B6': 'ZONA'
	}

	let styleCache = {}

	let blockStyle = feature => {
		let type = feature.get(quadras[indicador]) // types[indicador];

		const variator = val => {
			if(indicador === "B1" && type === "ZDE-1") return rgba
			if(indicador === "B2") {
				if(!val) return
				const normalized = val/100
				if( normalized > 280 ) return [ 184, 40, 39, 0.8 ]
				if( normalized > 200) return [ 221, 76, 47, 0.8 ]
				if( normalized > 120)  return [ 240, 137, 103, 0.8 ]
				if( normalized > 50)  return [ 246, 206, 136, 0.8 ]
				else return [ 252, 240, 218, 0.8 ]
			}
			if(indicador === "B3") {
				if(!val) return
				if(val > 6) return [ 7, 48, 111, 1 ]
				if(val > 5) return [ 21, 99, 173, 1 ]
				if(val > 4) return [ 62, 141, 197, 1 ]
				if(val > 3) return [ 115, 179, 215, 1 ]
				if(val > 2) return [ 171, 212, 234, 1 ]
				if(val > 1) return [ 215, 231, 246, 1 ]
				else return [ 247, 250, 255, 1 ]
			}
			if(indicador === "B4" && type === "ZEIS-1") return rgba
			if(indicador === "B5" && type === "ZEIS-3") return rgba
			else return [0,255,0, 0] // errors or setup needed
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
		style: blockStyle,
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

export{ 
	setIconLayer,
	setLayer, 
	setPatternLayer,
	setComplexLayer,
	getProjectData 
}