let allData = [];
let bibliography = [];
let tags = {};
let categories = {};
   
function extractTags(data, field, filter) {
	extractedTags = {};
	$.each(data, function(index, item) {
		$.each(item.statements, function(index, statement) {
			if(statement[field] != null && (filter == null || filter(statement))){
				if(extractedTags[statement.claim] == undefined) {
					extractedTags[statement.claim] = {[statement[field].toString()] : 1}
				}else if(extractedTags[statement.claim][statement[field].toString()] == undefined) {
					extractedTags[statement.claim][statement[field].toString()] = 1
				}else{
					extractedTags[statement.claim][statement[field].toString()] += 1
				}
			}
		});
	});
	return extractedTags;
}

function escapeTag(tag) {
	return tag.toString().replaceAll(' ', '-')
}

function selectedOptions(all, prefix) {
	selectedTags = {};
	$.each(all, function(claim, options) {
		$.each(options, function(index, option) {
			if($(`#filter-${prefix}-${escapeTag(claim)}_${escapeTag(index)}`).is(':checked')) {
				if(selectedTags[claim] == null) {
					selectedTags[claim] = [index]
				}else{
					selectedTags[claim].push(index)
				}
			}
		});
	});
	return selectedTags;
}

function matchesSelection(statements, selectedTags, field) {
	if(statements == null && !$.isEmptyObject(selectedTags)) {
		return false;
	}
	matchesTags = {};
	$.each(selectedTags, function(claim, option) {
		matchesTags[claim] = false
	});
	statements.forEach(statement => {
		if(selectedTags[statement.claim] != null && statement[field] != null) {
			matchesTags[statement.claim] = matchesTags[statement.claim] || selectedTags[statement.claim].includes(statement[field].toString());
		}
	});
	matchesAllTags = true;
	$.each(matchesTags, function(claim, val) {
		matchesAllTags = matchesAllTags && val
	});
	return matchesAllTags;
}

function applyFilters() {
	const textSearch = $('#textSearch').val().toLowerCase();
	
	const selectedTags = selectedOptions(tags, 'tag')
	const selectedCategories = selectedOptions(categories, 'category')
	
	anySelected = false;
	
	$.each(allData, function(index, item) {
		//const matchesAge = isNaN(ageFilter) || item.age === ageFilter;
		matches = item.name.toLowerCase().includes(textSearch);
		if(item.description != null){
			matches = matches || item.description.toLowerCase().includes(textSearch);
		}
		
		if(item.statements != null){
			item.statements.forEach(statement => {
				try{
					 matches = matches || statement.value.toLowerCase().includes(textSearch);
				}catch(e){}
				
			});
		}
		if(matches && 
			matchesSelection(item.statements, selectedTags, 'tag') &&
			matchesSelection(item.statements, selectedCategories, 'value')
			) {
			$(`#graphclass-${item.id}`).show();
			$(`#toc-${item.id}`).show();
			anySelected = true;
		}else{
			$(`#graphclass-${item.id}`).hide();
			$(`#toc-${item.id}`).hide();
		}
	});
	if(! anySelected) {
		$("#nothing-found").show();
		$("#accordionContents").hide();
	}else{
		$("#nothing-found").hide();
		$("#accordionContents").show();
	}
}

function populateView(data) {  
	
	if(data.length == 0) {
		$("#nothing-found").show();
		$("#accordionContents").hide();
		return;
	}
	
	$("#toc").empty();
	toccontent = `<ul>`
	$.each(data, function(index, item) {
		toccontent += `<li id="toc-${item.id}"><a href="#graphclass-${item.id}">${item.name}</a></li>`
	});
	toccontent += `</ul>`
	$("#toc").append(toccontent);
	
	
	$("#jsonData").empty();
	content = ``
	$.each(data, function(index, item) {
		content += `<div class="graphclass" id="graphclass-${item.id}"><h2>`
		content += `<a name="graphclass-${item.id}">${item.name}</a>`
		if(item.family == true) {
			content += ` <span class="badge text-bg-light" title="This is a family of graph classes."><i class="bi bi-collection"></i></span>`
		}
		content += ` ${wikidataLink(item.wikidata)} ${wikipediaLink(item.wikipedia)} ${graphclassesLink(item.graphclassesorg)}</h2>`
		
		if(item.description != null) {
			content += `<p>${item.description}</p>`
		}
		if( item.statements == null || item.statements.length == 0){
			content += "<p>No statements found.</p>";
		}else{
			content += `<ul>`
			item.statements.forEach(statement => {
				content += `<li>
						<b>${statement.claim}</b>
						${statement.value}
						${wikidataLink(statement.wikidata)}
						${wikipediaLink(statement.wikipedia)} `
				if(statement.tag != null) {
					content += `<span class="badge text-bg-secondary">${statement.tag}</span>`
				}
				if(statement.description != null) {
					content += `<br/>${statement.description}`
				}
				if(statement.references != null && statement.references.length > 0) {
					content += `<br/>${citations(statement.references)}`
				}

				content += `</li>`
			});
			content += `</ul></div>`
		}
	});
	$("#jsonData").append(content);
	// MathJax.typeset();
}

function populateBibliography() {
	$("#bibliography").empty();

	content = "<h1>Bibliography</h1><ul>"
	$.each(bibliography, function(index, item) {
		content += `<li><a name="citation_${index}">${item.short}</a>: ${item.long}</li>`
	});
	content += `</ul>`
	$("#bibliography").append(content)
}

function populateTagFilters(tags, field) {
	$(`#filters-${field}`).empty();
	content = ``;
	$.each(tags, function(index, item) {
		
		content += `<div class="form-group" style="margin-top:5px;"><label>${index}</label>`
		$.each(item, function(tg, count) {
			escapedIndex = escapeTag(index)
			escapedTag = escapeTag(tg)
			content += `<input type="checkbox" class="btn-check" id="filter-${field}-${escapedIndex}_${escapedTag}" autocomplete="off" onchange="applyFilters()">
						<label class="btn btn-outline-secondary btn-sm" for="filter-${field}-${escapedIndex}_${escapedTag}">${tg} <span class="badge text-bg-secondary">${count}</span></label>`
		});
		content += `</div>`
	});
	$(`#filters-${field}`).append(content)
}

function wikidataLink(wikidata) {
	if(wikidata == null) {
		return "";
	}else{
		return `<a href="https://www.wikidata.org/wiki/${wikidata}" target="_blank" title="View at Wikidata"><img class="wikidata-link" src='https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg'></a>`;
	}
}
function wikipediaLink(wikipedia) {
	if(wikipedia == null) {
		return "";
	}else{
		return `<a href="${wikipedia}" target="_blank"  title="View at Wikipedia"><img class="wikidata-link" src='https://upload.wikimedia.org/wikipedia/commons/d/d6/Antu_wikipedia.svg'></a>`;
	}
}

function graphclassesLink(gc) {
	if(gc == null) {
		return "";
	}
	return `<a href="https://graphclasses.org/classes/${gc}.html" target="_blank"><img class="wikidata-link" src='https://graphclasses.org/logo75.png' title='View at Information System on Graph Classes and their Inclusions'></a>`
}

function citations(keys) {
	if(keys.length == 0) {
		return ""
	}
	return `<span class="references"><i class="bi bi-eyeglasses"></i> ` + keys.map(citation).join(", ") +`</span>`;
}

function citation(key) {
	if(key == "folklore") {
		return "Folklore";
	}
	if(key == "trivial") {
		return "Trivial"
	}
	if(bibliography[key] == null) {
		return `<b>Unknown reference ${key}</b>`;
	}else{
		return `<a href="#citation_${key}">${bibliography[key].short}</a>`;
	}
}



$(document).ready(function() {
	/*$.get('bibliography.bib', function(data) {
		bibtexEntries = bibtex.parseBibFile(data);
		const htmlOutput = bibtex.toHTML(bibtexEntries);
		$('#bibliography').append(htmlOutput);
	});*/

	$.when(
		$.getJSON('./data/bibliography.json'),
		$.getJSON('./data/data_augmented.json')
	).done(function(dataBib, dataClasses) {
		bibliography = dataBib[0]; 
		populateBibliography();
		
		allData = dataClasses[0]; // Store the fetched data
		tags = extractTags(allData, 'tag', null);
		categories = extractTags(allData, 'value', st => st.categorical);

		populateView(allData); // Populate the table with all data
		populateTagFilters(tags, 'tag');
		populateTagFilters(categories, 'category');
		
		MathJax.typeset();
	}).fail(function() {
		console.error('One or more requests failed.');
	});

	
	

	$('#textSearch').on('input', function() {
		applyFilters();
	});
});  
