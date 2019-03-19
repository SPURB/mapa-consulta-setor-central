var fs = require("fs-extra");
 
var source = 'data-src/projetos'
var destination =  __dirname.replace('data-src', 'dist/data-src/projetos')

fs.copy(source, destination, function (err) {
	if (err){
		console.log('An error occured while copying the folder.')
		return console.error(err)
	}
	console.log('Copy completed!')
})