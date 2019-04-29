/**
 * to update run -> 'npm run files'
 */
import axios from 'axios'
import { displayFetchingUI, displayResponseMessage } from './domRenderers.js'
import * as projetosObj from '../data-src/json/projetos'
import * as indicadores from '../data-src/json/indicadores'
import * as mapasObj from '../data-src/json/mapas'
import * as simples from  '../data-src/json/simples'
import * as complexos from '../data-src/json/complexos'
import * as bases from  '../data-src/json/bases'
import * as cores from  '../data-src/json/cores'
import { ids as complexosIds } from '../data-src/json/complexosIds'

const projetos = projetosObj.default
const mapaData = mapasObj.default

/**
 * Axios instance. Header setup
*/
const api = axios.create({
	baseURL: process.env.API_URL,
	timeout: 5000
})

/**
 * Get comments (members) from the api
 * @param { String } table The api table name -> example: 'consultas'
 * @param { Number } id The consulta id 
 */
function apiGet (table, id){
	const url = `${table}/${id.toString()}`

	return new Promise((resolve, reject) => {
		api.get(url)
		.then(response => {
			resolve(response.data)
		})
		.catch(error => reject(error))
	})
}

/**
 * Post comments (members) from the api
 * @param { String } table The api table name -> example: '/members'
 * @param { Object } data The object to register
 * @param { String } idBase The base of id name
  */
function apiPost(table, data, idBase) {
	const url = `${table}/`

	displayFetchingUI(true, '.button') //display fecthing elements

	api.post(url, data)
		.then(response => {
			if( table === 'members' ) {
				// console.log(response.data)  // call some function to theese type of post and create comment response success
				displayResponseMessage('success', false, idBase)
			}
			else { return response.data }
		})
		.catch(error => displayResponseMessage('error', error, idBase))
		.then( () => displayFetchingUI(false, '.button'))
}

export { 
	projetos,
	mapaData,
	simples,
	complexos,
	complexosIds,
	indicadores,
	bases,
	cores,
	apiPost,
	apiGet
}
