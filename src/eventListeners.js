"use strict";
import { apiPost, apiGet } from './model'

/**
* Listen to blur events at the commentbox form input and text fields 
* @param { String } idBase The base of id name
*/
function commentBoxBlurEvents(idBase) {
	document.forms[idBase].setAttribute('novalidate', true)
	document.forms[idBase].addEventListener('blur', event => {

		const validateFormExist = event.target.form

		// just proceed if this form have a 'validate' class
		if ( validateFormExist === undefined || !validateFormExist.classList.contains('validate')) return; 

		const fieldState = fieldErrors(event.target) // return isValid, message (if not valid)

		if (fieldState.isValid) {
			event.target.classList.remove('error')
			event.target.classList.add('touched')
		}

		else {
			event.target.classList.add('error')
		}

	}, true)
}

/**
* Submit button click event 
* @param { String } idBase The base of id name of the form
* @param { Number } idConsulta The consulta id
* @param { Number } commentid The comment id
* @param { String } commentcontext The base of id name of the form
*/
function commentBoxSubmit(idBase, idConsulta, commentid, commentcontext) {
	let formErrors = []

	const submitBtnId = `${idBase}-submit` 
	const fieldClassName = `${idBase}-field`
	const fieldNameId = `${idBase}-name`
	const fieldSurnameId = `${idBase}-surname`
	const fieldOrganizationId = `${idBase}-organization`
	const fieldEmailId = `${idBase}-email`
	const fieldCommentId = `${idBase}-comment`

	document.getElementById(submitBtnId).addEventListener('click', e => {

		let inputs = [...document.forms[idBase].getElementsByClassName(fieldClassName)]
		inputs.forEach( input => {
			const fieldState = fieldErrors(input) // return isValid, message (if not valid)

			if (fieldState.isValid) {
				input.classList.remove('error')
			} 
			else {
				input.classList.add('error')

				// list errors
				formErrors.push({
					id: input.id,
					message: fieldState.message
				})
			}
		})

		if(formErrors.length > 0) {
			console.log('Errors:')
			console.log(formErrors)
			// make something with this errors

			formErrors = [] // reset state to next click check
		}

		else { // this form do not have errors

			let name = inputs.find( input => input.id === fieldNameId).value // João
			const surname = inputs.find( input => input.id === fieldSurnameId).value // da Silva
			const organization = inputs.find( input => input.id === fieldOrganizationId).value // Tabajara LTDA

			name = `${name} ${surname}` // João da Silva
			if (organization || organization !=='') { name = `${name} (${organization})` } // João da Silva (Tabajara LTDA)

			const output = {
				'idConsulta': idConsulta,
				'name': name,
				'email': inputs.find( input => input.id === fieldEmailId).value , // joaodasilva@tabajara.com
				'content': inputs.find( input => input.id === fieldCommentId).value , // Lorem ipsum ...
				'public': 0,
				'trash': 0,
				'postid': 0,
				'commentid': commentid,
				'commentcontext': commentcontext
			}
			apiPost('members', output)
		}
		e.preventDefault()
	})
}


/**
* Check form field input errors
* @param { Node } field The element input field to check for errors
* @returns { Object } if is Valid { isValid, id } . If is not valid { isValid, message, id }
* isValid -> Boolean. This field is valid or not.
* message -> String. The error message.
*/
function fieldErrors(field){
	const validity = field.validity
	let message = 'Campo inválido'

	// TODO: Change message for each error and field types
	// console.log(field.type) // field types 
	// text
	// textarea
	// email

	// console.log(field.validity) // possible errors
	// badInput: Boolean
	// customError: Boolean
	// patternMismatch: Boolean
	// rangeOverflow: Boolean
	// rangeUnderflow: Boolean
	// stepMismatch: Boolean
	// tooLong: Boolean
	// tooShort: Boolean
	// typeMismatch: Boolean
	// valid: Boolean
	// valueMissing: Boolean

	if(!validity.valid) {
		return {
			isValid: false, 
			message: message
		}
	}
	else {
		return { 
			isValid: true
		}
	}
}



export { commentBoxBlurEvents, commentBoxSubmit, fieldErrors }