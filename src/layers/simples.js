import { setLayer, setIconLayer, setPatternLayer } from './helpers'
import cptm from '../img/cptm.svg'
import onibus from '../img/onibus.svg'
import metro from '../img/metro.svg'
import tombado from '../img/tombado.svg'

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

	const dashedLayers = [ 'A9', 'A13', 'A44', 'A45' ]
	const filledLayers = [ 'A4', 'A10', 'A11', 'A12' ]
	const biggerWidths = [ 'A6', 'A9', 'A13' ]
	const iconLayers = [ 
		{ indicador: 'A36', icon: tombado },
		{ indicador: 'A41', icon: onibus },
		{ indicador: 'A42', icon: cptm },
		{ indicador: 'A43', icon: metro }
	]
	const patternLayers = [
		{ indicador: 'A5', type:'lines-diagonal' }
	]

	let isDashed = dashed => dashedLayers.includes(dashed)
	let isFilled = filled => filledLayers.includes(filled)
	let isBigWid = bigger => biggerWidths.includes(bigger)
	let isIconUs = icon => iconLayers.find(object => object.indicador === icon)
	let isPattrn = pattern => patternLayers.find(object => object.indicador === pattern)

	validObjs.forEach(valid => {
		const files = projetos.find(obj => obj.id === valid.id)
		if (files) {
			files.children.forEach(file => {
				const indicador = valid.indicador
				const url = app_url + file.path
				const icon = isIconUs(indicador)
				const pattern = isPattrn(indicador)

				if(file.extension === '.kml') {
					const rgba = cores[indicador]
					const customStyles = { color: rgba }
					const name = valid.name
					const projeto = { id: valid.id, indicador: indicador }

					if(isFilled(indicador)) customStyles.fillCollor = [rgba[0], rgba[1], rgba[2], rgba[3]]
					if(isDashed(indicador)) { customStyles.lineDash = [4]; customStyles.width = 1 }
					if(isBigWid(indicador)) { customStyles.width = 4; customStyles.lineDash = [4, 6] }

					if(icon) kmlLayers.push(setIconLayer(name, url, projeto, icon.icon))
					if(pattern) kmlLayers.push(setPatternLayer(name, url, projeto, pattern.type, [255, 255, 255, 0.1]))
					if(!icon || !pattern) kmlLayers.push(setLayer(name, url, projeto, customStyles))
				}
			})
		}
	})
	return kmlLayers
}

export { returnSimples }