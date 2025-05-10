let allData = [];
        let bibliography = [];

        $(document).ready(function() {
            /*$.get('bibliography.bib', function(data) {
                bibtexEntries = bibtex.parseBibFile(data);
                const htmlOutput = bibtex.toHTML(bibtexEntries);
                $('#bibliography').append(htmlOutput);
            });*/

            $.getJSON('bibliography.json', function(data) {
                bibliography = data; 
                populateBibliography();
            }).fail(function() {
                console.error('Error fetching bibliography');
            });


            $.getJSON('data.json', function(data) {
                allData = data; // Store the fetched data
                populateView(allData); // Populate the table with all data
            }).fail(function() {
                console.error('Error fetching data');
            });
            

            $('#textSearch').on('input', function() {
                applyFilters();
            });
        });     

        function applyFilters() {
            const textSearch = $('#textSearch').val().toLowerCase();
            const filteredData = allData.filter(item => {
                //const matchesAge = isNaN(ageFilter) || item.age === ageFilter;
                matchesName = item.name.toLowerCase().includes(textSearch);
                if(item.statements != null){
                    item.statements.forEach(statement => {
                        try{
                             matchesName = matchesName || statement.value.toLowerCase().includes(textSearch);
                        }catch(e){}
                    });
                }
                // const matchesIncome = !showIncomeGreaterThan1000 || item.income > 1000;
                return matchesName;
            });

            populateView(filteredData);
        }

        function populateView(data) {  
            $("#jsonData").empty();
            if(data.length == 0) {
				$("#jsonData").append("<i>No graph classes found.</i>")
				return;
			}
            $.each(data, function(index, item) {
                content = `<h2>${item.name}`
                if(item.family == true) {
					content += ` <span class="badge text-bg-light" title="This is a family of graph classes."><i class="bi bi-collection"></i></span>`
				}
                content += ` ${wikidataLink(item.wikidata)} ${graphclassesLink(item.graphclassesorg)}</h2>`
                
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
                    content += `</ul>`
                }
  
                $("#jsonData").append(content);
            });
            
            MathJax.typeset();
            
        }

        function populateBibliography() {
            $("#bibliography").empty();

            content = "<h1>Bibliography</h1><ul>"
            $.each(bibliography, function(index, item) {
                content += `<li><a name="citation_${index}">${item.short}</a>: ${item.long}</li>`
            });
            $("#bibliography").append(content)
        }

        function wikidataLink(wikidata) {
            if(wikidata == null) {
                return "";
            }else{
                return `<a href="https://www.wikidata.org/wiki/${wikidata}" target="_blank"><img class="wikidata-link" src='https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg'></a> `
						+ `<a href="https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${wikidata}" target="_blank"><img class="wikidata-link" src='https://upload.wikimedia.org/wikipedia/commons/d/d6/Antu_wikipedia.svg'></a>`;
            }
        }
        
        function graphclassesLink(gc) {
			if(gc == null) {
				return "";
			}
			return `<a href="https://graphclasses.org/classes/${gc}.html" target="_blank"><img class="wikidata-link" src='https://graphclasses.org/logo75.png' title='View entry at Information System on Graph Classes and their Inclusions'></a>`
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
