const path = require("path");
const fs = require('fs');

require('babel-register')({
	presets: [ 'env' ]
})

function renameLegendas (oldName, newName){
	fs.rename(oldName, newName, function(err) {
		if (err) {
			console.log('ERROR: ' + err);
			throw err;
		}
		console.log(oldName, 'Renomeado para',newName);
	})
}

fs.readdir('data-src/legendas', (err, files) => {
	if(!err) {
		files.forEach(file => {
			renameLegendas('data-src/legendas/' + file,'data-src/legendas/' + file.replace('legendas_','') )
		})
	}

	if(err) console.error(err)
})