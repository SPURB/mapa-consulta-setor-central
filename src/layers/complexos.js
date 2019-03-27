import { setLayer } from './helpers'
import { parseNameToNumericalId, commentBoxDisplayErrors } from '../domRenderers'

/**
* Create complexos.json layers
* @param { Object } projetos The projetos.json tree of /data-src/projetos/
* @param { Object } complexos The complexos.json data
* @param { Number } ids The complexo layer kml id
* @param { String } app_url Url of this app (not attached to this app)
* @return { Array } Array of new Layers's (from Open Layers) to create de base
*/
function returnComplexos(projetos, complexos, ids, app_url){
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
		const valid = validIdAndKmls.find(item => item.id === complexo.ID)
		const name = complexo.NOME
		const kml = valid.kml
		const id = complexo.ID

		kmlLayers.push(setLayer(name, kml, {id: id, indicador:complexo.INDICADOR }))
	})
	return kmlLayers
}



export { returnComplexos }