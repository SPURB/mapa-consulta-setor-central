"use strict"
/**
 * Content from data-src/
 * to update data-src/projetos.json and colocalizados.json run -> 'npm run files'  
 */
import { children as projetos } from '../data-src/projetos' 
import * as colocalizados from  '../data-src/colocalizados'
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
 */
function apiPost (table, data){
	const url = `${table}_v1/`
	api.post(url, data)
		.then(response => {
			if( table === 'members' ) { console.log(response.data) } // call some function to theese type of post
			else { response.data }
		})
		.catch(error => error)
}

export { projetos, colocalizados, apiPost, apiGet }
