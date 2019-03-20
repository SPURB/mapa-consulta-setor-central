/**
 * Content from data-src/
 * to update data-src/projetos.json and colocalizados.json run -> 'npm run files'  
 */
import { displayFetchingUI, displayResponseMessage } from './domRenderers.js'
// import { children as projetos } from '../data-src/projetos'
// import * as colocalizados from  '../data-src/colocalizados'
import { children as projetos } from '../data-src/json/projetos'
import * as simples from  '../data-src/json/simples'
import * as bases from  '../data-src/json/bases'
import axios from 'axios'

/**
 * Axios instance. Header setup
*/
const api = axios.create({
	baseURL: 'http://spurbcp13343:7080/consultas-publicas-backend/', //please check the docs: https://spurb.github.io/consultas-publicas-backend/
	timeout: 5000,
	headers: {
		'Content-Post': process.env.API_TOKEN,
		'Content-Type': 'application/json'
	}
})

/**
 * Get comments (members) from the api
 * @param { String } table The api table name -> example: 'consultas'
 * @param { Number } id The consulta id 
 */
function apiGet (table, id){
	const url = `/${table}_v1/${id.toString()}`
	api.get(url)
		.then(response => response.data)
		.catch(error => error)
}

/**
 * Post comments (members) from the api
 * @param { String } table The api table name -> example: '/members'
 * @param { Object } data The object to register
 * @param { String } idBase The base of id name
  */
function apiPost(table, data, idBase) {
	const url = `${table}_v1/`

	displayFetchingUI(true, '.button') //display fecthing elements

	api.post(url, data)
		.then(response => {
			if( table === 'members' ) {
				// console.log(response.data)  // call some function to theese type of post and create comment response success
				displayResponseMessage('success', false, idBase)
			}
			else { return response.data }
		})
		.catch(error => {
			displayResponseMessage('error', error, idBase) // add Comment response error page
			// displayResponseMessage('success', false, idBase)
		})
		.then( () => {
			displayFetchingUI(false, '.button') // remove submit button 'feching' class
		})
}

export { projetos, simples, bases, apiPost, apiGet }
