import fs from 'fs';
import directoryTree from 'directory-tree';
import XLSX from 'xlsx'

/*
projetos.json
*/
function createProjetosFromFolder(){
    const files = JSON.stringify( directoryTree('./data-src/projetos',{ normalizePath: true }) )
    const output= './data-src/projetos.json'
    
    fs.writeFile(output, files, 'utf8', err => { 
        if(err) console.log(err)
        else console.log(output, 'atualizado')
    })
}


/*
info.json
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
