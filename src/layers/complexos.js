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

	const parse = {
		"B1":9901,
		"B2":9902,
		"B3":9903,
		"B4":9904,
		"B5":9905,
		"B6":9906,
		"B7":9907,
		"B8":9908,
		"B9":9909,
		"B10":9910,
		"B11":9911,
		"B12":9912,
		"B13":9913,
		"B14":9914,
		"B15":9915,
		"B16":9916,
		"B17":9917,
		"B18":9918,
		"B19":9919,
		"B20":9910,
		"B21":9921,
		"B22":9922,
		"B23":9923,
		"B24":9924,
		"B25":9925,
		"B26":9926,
		"B27":9927,
		"B28":9928,
		"B29":9929,
		"B30":9930,
		"B31":9931,
		"B32":9932,
		"B33":9933,
		"B34":9934,
		"B35":9935,
		"B36":9936,
		"B37":9937,
		"B38":9938,
		"B39":9939,
		"B40":9940,
		"B41":9941,
		"B42":9942,
		"B43":9943,
		"B44":9944,
		"B45":9945,
		"B46":9946,
		"B47":9947,
		"B48":9948,
		"B49":9949,
		"B50":9950,
		"B51":9951,
		"B52":9952,
		"B53":9953,
		"B54":9954,
		"B55":9955,
		"B56":9956,
		"B57":9957,
		"B58":9958,
		"B59":9959,
		"B60":9950
	}

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

			// parseIndicador(projeto.INDICADOR)

			return {
				name: name,
				id: projeto.id,
				kml: url
			}
		})

	// console.log(validIdAndKmls) // [{ id, pathToKml }]
	// console.log(complexos)

	// console.log(complexos[0].INDICADOR)
	// console.log(validIdAndKmls[0].kml)
	// console.log(validIdAndKmls[0].id)

	complexos.forEach(complexo => {
		const valid = validIdAndKmls.find(item => item.id === complexo.ID)
		const name = complexo.name
		const kml = valid.kml
		const id = parse[complexo.INDICADOR]

		kmlLayers.push(setLayer(name, kml, id))
	})
	return kmlLayers
}



export { returnComplexos }