import { setComplexLayer, setComplexLineLayer } from './helpers'
import { parseNameToNumericalId } from '../domRenderers'

/**
* Create complexos.json layers
* @param { Object } projetos The projetos.json tree of /data-src/projetos/
* @param { Object } complexos The complexos.json data
* @param { Number } ids The complexo layer kml id
* @param { String } app_url Url of this app (not attached to this app)
* @return { Object } cores The indicadores colors { indicador: [r, g, b, a] }
* @return { Array } Array of new Layers's (from Open Layers) to create de base
*/
function returnComplexos(projetos, complexos, ids, app_url, cores){

	let kmlLayers = []
	const idsAndFiles = projetos
		.map(projeto => {
			return {
				id: parseNameToNumericalId(projeto.name),
				files: projeto.children,
			}
		})

	const validIdAndKmls = ids
		.map(id => idsAndFiles.find(el => el.id === id))
		.filter(projeto => projeto !== undefined)
		.map(projeto => {
			const found = projeto.files.find(file => file.extension === '.kml')
			const name = found.name
			const url = app_url + found.path

			return {
				name: name,
				id: projeto.id,
				kml: url
			}
		})

	const lines = {
		'B61': 'Layer',
		'B64': 'Layer',
		'B68': 'Layer',
		'B69': 'Layer',
		'B70': 'Layer',
		'B71': 'Layer',
		'B72': 'Layer',
		'B73': 'Layer',
		'B74': 'Layer',
		'B22': 'TRANSITO1',
		'B23': 'TRANSITO1',
		'B24': 'TRANSITO1',
		'B25': 'TRANSITO1',
		'B26': 'TRANSITO1',
		'B27': 'TRANSITO1',
		'B28': 'TRANSITO1',
		'B29': 'Ferramenta',
		'B30': 'Ferramenta',
		'B31': 'Ferramenta',
		'B32': 'Ferramenta',
		'B33': 'Ferramenta',
		'B34': 'Ferramenta',
		'B34': 'Ferramenta',
		'B35': 'Ferramenta',
		'B36': 'Ferramenta',
		'B37': 'Ferramenta',
		'B38': 'Ferramenta',
		'B41': 'situacao',
		'B42': 'situacao',
		'B45': 'Categoria',
		'B46': 'Categoria',
		'B47': 'Categoria',
		'B87': 'classif',
		'B88': 'classif',
		'B89': 'classif'
	}

	let isLineCheck = indicador => Object.keys(lines).find(line => line === indicador)

	complexos.forEach(complexo => {
		const valid = validIdAndKmls.find(item => item.id === complexo.ID)
		const isLine = isLineCheck(complexo.INDICADOR)

		if(valid) {
			const name = complexo.NOME
			const kml = valid.kml
			const id = complexo.ID
			const indicador = complexo.INDICADOR
			const color = cores[indicador]
			const featureType = lines[indicador] 

			if(isLine) { kmlLayers.push(setComplexLineLayer(name, kml, id, indicador, color, featureType))}
			else { kmlLayers.push(setComplexLayer(name, kml, id, indicador, color)) }
		}
		else {
			throw new Error(`Erro nesta camada. Veja o kml está no diretório com a id equivalente:`, complexo)
		}
	})
	return kmlLayers
}

export { returnComplexos }