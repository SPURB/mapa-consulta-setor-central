import fs from 'fs'

/**
 * Create json file
 * @param { Object } output The json file content
 * @param { String } path The path of the file
 */
function createFile(output, path){
	const json = JSON.stringify(output)

	fs.writeFile( path, json, 'utf8', err => {
		if(err) console.log(err);
		else console.log(`${path}`)
	})
}

/**
* Filter projetos removing base layers
* @param { String } name Some string to parse. The pattern expected is '00_project-name'
* @return { Number } The project id
*/
function parseNameToNumericalId(name){
	let projectId = name.substring(0,7) // "1_a", "2_m", "05_"
	projectId = projectId.replace(/[^\d]/g, '')  // "1", "2", "5"
	projectId = parseInt(projectId) // 1, 2, 5
	if (Number.isInteger(projectId)) return projectId
	else { throw new Error('projectId must to be a Number') }
}

export { createFile, parseNameToNumericalId }