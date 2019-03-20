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
		else console.log(path)
	})
}

export { createFile }