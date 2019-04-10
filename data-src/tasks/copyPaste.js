var fs = require("fs-extra");
 
function copyPaste(source, destination) {
	var destinationPath =  __dirname.replace('data-src', destination)

	fs.copy(source, destinationPath, function (err) {
		if (err){
			console.log('An error occured while copying the folder.')
			return console.error(err)
		}
		console.log('Copy completed!')
	})
}

copyPaste('data-src/projetos', 'dist/data-src/projetos');
copyPaste('data-src/legendas', 'dist/data-src/legendas');