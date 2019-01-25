import fs from 'fs';
import directoryTree from 'directory-tree';
import XLSX from 'xlsx'

/**
* Creates ./projetos.json
* @return { File } A json file from the folders directory tree 
*/
function createProjetosFromFolder(){
    const files = JSON.stringify( directoryTree('./data-src/projetos', { normalizePath: true, extensions: /\.(jpg|gif|png|kml)$/ }) )
    const output= './data-src/projetos.json'
    
    fs.writeFile(output, files, 'utf8', err => { 
        if(err) console.error(err)
        else console.log(output, 'atualizado')
    })
}


/**
* Creates ./colocalizados.json
* @param { String } inputExcel The excel file location
* @param { String } tableName The excel file table name to read
* @param { String } tableName The path with file name of the output file
* @return { File } A json file from the folders directory tree 
*/
function createJsFromExcel(inputExcel, tableName, outputJS){
	var worksheet = XLSX.readFile(inputExcel).Sheets[tableName];
	var rows = XLSX.utils.sheet_to_json(worksheet,{ raw:true }); //toda planilha
	let outputJson = [];

	rows.map(function(rowLine){ // para cada linha
		let collection = Object.entries(rowLine); 
		let output = {}

		collection.map(function(index) {
			if(index[1] != ''){ //se não tiver dados não inclui no json final
				output[index[0]] = index[1];
			}
		});
		outputJson.push(output);
	})

	const json = JSON.stringify(outputJson);

	let filePath = outputJS +'.json';
	fs.writeFile( filePath, json, 'utf8', function (err){
		if(err){
			console.log(err);
		}
	});
	console.log(filePath + ' atualizado')
}

createProjetosFromFolder()
createJsFromExcel('./data-src/Colocalizados.xlsx','output', './data-src/colocalizados')
