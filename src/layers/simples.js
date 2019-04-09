import { setLayer } from './helpers'
import { parseNameToNumericalId } from '../domRenderers'

/**
* Create all layers for app
* @param { Object } projetos The projetos.json tree of /data-src/projetos/
* @param { Object } simples The simples.json data
* @param { String } app_url Url of this app (not attached to this app)
* @param { Object } cores The indicadores colors { indicador: [r, g, b, a] }
* @return { Array } Array of new Layers's (from Open Layers) to create de base
*/
function returnSimples(projetos, simples, app_url, cores){
	let kmlLayers = []
	let validObjs = []
	Object.values(simples).forEach(value => { if(value.ID) { 
		validObjs.push({ 
			id: value.ID,
			name: value.NOME,
			indicador: value.INDICADOR
		})
	} })

	const dashedLayers = [ "A9", "A13" ]
	const filledLayers = [ "A4", "A10", "A11", "A12" ]

	let isDashed = dashed => dashedLayers.includes(dashed)
	let isFilled = filled => filledLayers.includes(filled)

	validObjs.forEach(valid => {
		const files = projetos.find(obj => obj.id === valid.id)
		if (files) {
			files.children.forEach(file => {
				if(file.extension === '.kml') {
					const url = app_url + file.path
					const rgba = cores[valid.indicador]

					const customStyles = {
						color: rgba
					}

					if(isFilled(valid.indicador)) customStyles.fillCollor = [rgba[0], rgba[1], rgba[2], 0.5]
					if(isDashed(valid.indicador)) { customStyles.lineDash = [3]; customStyles.width = 1.5 }

					kmlLayers.push({
						layer: setLayer(valid.name, url, {id: valid.id, indicador: valid.indicador}, customStyles)
					})
				}
			})
		}
	})
	const layers = kmlLayers.map(vector => vector.layer)
	return layers
}

export { returnSimples }