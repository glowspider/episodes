//GO!
var fs = require('fs');
var d3 = require('d3');
var jsdom = require('jsdom');
var dataDir = 'data'


fs.readFile(dataDir+'/series.csv', 'utf8', function(error, data){
	d3.csv.parse(data).forEach(scrapePage);
})

function scrapePage(d){
	var jQueryScript = 'http://code.jquery.com/jquery.js'
	var urlPattern = 'http://www.imdb.com/title/{imdb_id}/epdate';
	var url = dumbTemplate(urlPattern, d);
	jsdom.env(url, [jQueryScript], function(err, window){
		if (err!= null){
			console.log(d.series + ' failed', err);
			return;
		};
		parseTable(window, 'div#tn15content>table', d.imdb_id);
	});
}

function dumbTemplate(template, values){
	for(var key in values){
		template =  template.replace('{'+key+'}', values[key]);
	}
	return template;
}

function parseTable(window, tableSelector, imdbID){
	var headers = []; 
	var $ = window.$;
	var csv = '';
	var table = $(tableSelector);

	table.children('tr').each(function(i, row){
		if(i === 0){
			$(row).children('th').each(function(j, cell){
				headers[j] = $(cell).text()
			});
			csv += headers.join(',');
		}else{
			var cells = [];
			$(row).children('td').each(function(j, cell){
				if(headers[j] !== ''){
					cells[j] = $(cell).text();
				}else{
					cells[j] = '';
				}
			});
			csv += cells.join(',');
		}
		csv += '\n';
	});

	fs.writeFile(dataDir + '/' + imdbID + '.csv', csv, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("saved " + imdbID);
		}
	});
}