let allData = [];
let bibliography = [];
let tags = {};
   
function extractTags(data) {
	tags = {};
	$.each(allData, function(index, item) {
		$.each(item.statements, function(index, statement) {
			
			if(statement.tag != null){
				if(tags[statement.claim] == null) {
					tags[statement.claim] = [statement.tag]
				}else if(! tags[statement.claim].includes(statement.tag)) {
					tags[statement.claim].push(statement.tag)
				}
			}
		});
	});
	return tags;
}

function escapeTag(tag) {
	return tag.toString().replaceAll(' ', '-')
}

function applyFilters() {
	const textSearch = $('#textSearch').val().toLowerCase();
	
	selectedTags = {};
	$.each(tags, function(claim, options) {
		$.each(options, function(index, option) {
			if($(`#filter-tag-${escapeTag(claim)}_${escapeTag(option)}`).is(':checked')) {
				if(selectedTags[claim] == null) {
					selectedTags[claim] = [option]
				}else{
					selectedTags[claim].push(option)
				}
			}
		});
		
	});
	
	$.each(allData, function(index, item) {
		//const matchesAge = isNaN(ageFilter) || item.age === ageFilter;
		matches = item.name.toLowerCase().includes(textSearch);
		if(item.description != null){
			matches = matches || item.description.toLowerCase().includes(textSearch);
		}
		matchesTags = {};
		$.each(selectedTags, function(claim, option) {
			matchesTags[claim] = false
		});
		if(item.statements != null){
			item.statements.forEach(statement => {
				if(selectedTags[statement.claim] != null) {
					matchesTags[statement.claim] = matchesTags[statement.claim] || selectedTags[statement.claim].includes(statement.tag);
				}
				try{
					 matches = matches || statement.value.toLowerCase().includes(textSearch);
				}catch(e){}
				
			});
		}
		matchesAllTags = true;
		$.each(matchesTags, function(claim, val) {
			matchesAllTags = matchesAllTags && val
		});
		if(matches && matchesAllTags) {
			console.log(item.name)
			$(`#graphclass-${item.id}`).show();
		}else{
			$(`#graphclass-${item.id}`).hide();
		}
	});

}

function populateView(data) {  
	$("#jsonData").empty();
	if(data.length == 0) {
		$("#jsonData").append("<i>No graph classes found.</i>")
		return;
	}
	$.each(data, function(index, item) {
		content = `<div class="graphclass" id="graphclass-${item.id}"><h2>`
		content += ` ${item.name}`
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
						${wikidataLink(statement.wikidata)} `
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

		$("#jsonData").append(content);
	});
	// MathJax.typeset();
}

function populateBibliography() {
	$("#bibliography").empty();

	content = "<h1>Bibliography</h1><ul>"
	$.each(bibliography, function(index, item) {
		content += `<li><a name="citation_${index}">${item.short}</a>: ${item.long}</li>`
	});
	$("#bibliography").append(content)
}

function populateTagFilters(tags) {
	$("#tagFilters").empty();
	content = ``;
	$.each(tags, function(index, item) {
		
		content += `<div class="form-group"><label style='text-weight:bold;'>${index}</label> <div class="btn-group" role="group">`
		item.forEach(tg => {
			escapedIndex = escapeTag(index)
			escapedTag = escapeTag(tg)
			content += `<input type="checkbox" class="btn-check" id="filter-tag-${escapedIndex}_${escapedTag}" autocomplete="off" onchange="applyFilters()">
						<label class="btn btn-secondary btn-sm" for="filter-tag-${escapedIndex}_${escapedTag}">${tg}</label>`
		});
		content += `</div></div>`
	});
	$("#tagFilters").append(content)
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
		$.getJSON('bibliography.json'),
		$.getJSON('data_augmented.json')
	).done(function(dataBib, dataClasses) {
		bibliography = dataBib[0]; 
		console.log("Populating bibliography…")
		populateBibliography();
		
		allData = dataClasses[0]; // Store the fetched data
		console.log("Extracting tags…")
		tags = extractTags(allData);
		
		console.log("Populating graph classes view…")
		populateView(allData); // Populate the table with all data
		populateTagFilters(tags);
		
		MathJax.typeset();
	}).fail(function() {
		console.error('One or more requests failed.');
	});

	
	

	$('#textSearch').on('input', function() {
		applyFilters();
	});
});  
