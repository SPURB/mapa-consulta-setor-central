import { setLayer, setComplexLayer } from './helpers'
import { parseNameToNumericalId } from '../domRenderers'
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'


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

	// console.log(ids)
	// console.log(idsAndFiles)

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

	complexos.forEach(complexo => {
		const valid = validIdAndKmls
			.find(item => item.id === complexo.ID)

		if(valid) {
			const name = complexo.NOME
			const kml = valid.kml
			const id = complexo.ID
			kmlLayers.push(setComplexLayer(name, kml, id, complexo.INDICADOR, cores[complexo.INDICADOR]))
		}
		else {
			throw new Error(`olar, Erro nesta camada. Veja o kml está no diretório com a id equivalente: ${complexo}`)
		}
	})
	return kmlLayers
}

export { returnComplexos }