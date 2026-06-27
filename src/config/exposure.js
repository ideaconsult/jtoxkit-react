export const config_exposure = {
	"render_param" : function(key, value, filter, row_start,row_end ,key_start,key_end,value_start,value_end) {

		var title = key;
		try {
			
			title = config_exposure.parameters[key.toLowerCase()]["title"];
			if (title === undefined)
				title = key;
		} catch (err) {
			
		}
		if ((value === undefined) || (value == null) || ("-" == value))
			return "";

		sOut = row_start;
		if (key.indexOf(filter) == 0) {
			sOut += key_start + title + key_end;
		} else
			return "";

		sOut += value_start;
		try {
			if (value.loValue == undefined) {
				var uri = value.indexOf("http") >= 0;

				if (uri) {
					sOut += "<a href='" + value + "' target='_doi' >link</a>";
				} else
					sOut += value;
			} else {
				sOut += value.loValue;
				if (value.unit != undefined)
					sOut += " " + value.unit;
			}
		} catch (err) {
			sOut += value;

		}
		sOut += value_end;
		sOut += row_end;

		return sOut;
	},
	

	"protocol" : {
		"guideline" : {
			"title" : "Contributing Exposure Scenario",
			"order" : -20,
			"inMatrix" : true,
			"visible" : true,
			"render" : function(data, type, full) {
				//var wrapper_start="<p><table>";
				//var wrapper_end="</table></p>";
				//var row_start = "<tr>";
				//var row_end = "</tr>";
				//var key_start = "<th>";
				//var key_end = "</th>";
				//var value_start = "<td>";
				//var value_end = "</td>";				
				var wrapper_start="<div class='card'><div class='card-body'>";
				var wrapper_end="</div></div>";
				var row_start = "<p>";
				var row_end = "</p>";
				var key_start = "<span style='font-weight:bold;'>";
				var key_end = "</span>";
				var value_start = " : ";
				var value_end = "";
				
				var sOut = "";
				sOut += "<ul class='nav nav-pills nav-justified'> <li class='nav-item '><a class='nav-link active' data-toggle='tab'  href='#tabs_usedescriptors'>Descriptors</a></li>";
				sOut += "<li class='nav-item'><a class='nav-link' data-toggle='tab' href='#tabs_matrix'>Matrix</a></li>";
				sOut += "<li class='nav-item'><a class='nav-link' data-toggle='tab' href='#tabs_scenario'>Activity</a></li>";
				sOut += "<li class='nav-item'><a class='nav-link' data-toggle='tab' href='#tabs_controlmeasures'>Control</a></li>";
				sOut += "<li class='nav-item'><a class='nav-link' data-toggle='tab' href='#tabs_premises'>Premises</a></li>";
				sOut += "</ul>";
				sOut += "<div class='tab-content'>";
				sOut += "<div id='tabs_usedescriptors' class='tab-pane active'>";
				sOut += wrapper_start;
				sOut += "<h5 class='card-title'>ECHA use descriptors</h5>";
				$.each(full.parameters, function(k, v) {
					sOut += config_exposure.render_param(k, v, "ECHA.",row_start,row_end,key_start,key_end,value_start,value_end)
				});
				sOut += wrapper_end;
				sOut += "</div>";
				sOut += "<div id='tabs_scenario' class='tab-pane'>";
				sOut += wrapper_start;
				sOut += "<h5 class='card-title'>Contributing Exposure Scenario/Activity</h5>";
				$.each(full.parameters, function(k, v) {
					sOut += config_exposure.render_param(k, v,
							"EXPOSURE_CONTRIBUTING_SCENARIO.",row_start,row_end,key_start,key_end,value_start,value_end)
				});
				sOut += wrapper_end;
				sOut += "</div>";

				sOut += "<div id='tabs_controlmeasures' class='tab-pane'>";
				sOut += wrapper_start;				
				sOut += "<h5 class='card-title'>Exposure control measures</h5>";				
				$.each(full.parameters, function(k, v) {
					sOut += config_exposure.render_param(k, v,
							"EXPOSURE_CONTROL_MEASURES.",row_start,row_end,key_start,key_end,value_start,value_end)
				});
				sOut += wrapper_end;
				sOut += "</div>";

				sOut += "<div id='tabs_premises' class='tab-pane'>";
				sOut += wrapper_start;				
				sOut += "<h5 class='card-title'>Premises</h5>";				
				$.each(full.parameters, function(k, v) {
					sOut += config_exposure.render_param(k, v, "PREMISES.",row_start,row_end,key_start,key_end,value_start,value_end)
				});
				sOut += wrapper_end;
				sOut += "</div>";

				sOut += "<div id='tabs_matrix' class='tab-pane'>";
				sOut += wrapper_start;				
				sOut += "<h5 class='card-title'>Matrix characteristics</h5>";				
				$.each(full.parameters, function(k, v) {
					sOut += config_exposure.render_param(k, v, "MATRIX_CHARACTERISTICS.",row_start,row_end,key_start,key_end,value_start,value_end)
				});
				sOut += wrapper_end;
				sOut += "</div>";
			
				sOut += "</div>";

				return sOut;
			}
		},

		"citation" : {
			"visible" : true,
			"order" : -1,
			"title" : "Reference",

			"render" : function(data, type, full) {
				var sOut = data["title"] + " (" + data["year"] + ")";
				sOut += "<br>";
				sOut += data["owner"];

				iuuid = full["investigation_uuid"];
				auuid = full["assay_uuid"];
				var substance_uuid = full["owner"]["substance"]["uuid"];
				
				if (auuid === undefined || (auuid == null))
					;
				else {
					sOut += "<br/><a href='../investigation?type=byassay&substance="+substance_uuid+"&search="
							+ auuid
							+ "' class='chelp' title='This experiment in table form'>This experiment</a>"
				}
				if (iuuid === undefined || (iuuid == null))
					;
				else {
					sOut += "<br/><a href='../investigation?type=byinvestigation&substance="+substance_uuid+ "&search="						
							+ iuuid
							+ "' class='chelp' title='Related experiments in table form'>Related experiments</a>"
				}
				try {
					if (full["reliability"]["r_value"] != undefined)
						sOut += "<br/><span class='chelp' style='color:#FF0000;' title='curation comment'>"
								+ full["reliability"]["r_value"] + "</span>"

				} catch (err) {
				}
				return sOut;
			}

		},
		"owner" : {
			"visible" : false
		},
		"uuid" : {
			"visible" : false
		},
		"reliability" : {
			"visible" : false
		}
	},

	"parameters" : {
		"visible" : false,
		"echa.sector_uses" : {
			"title" : "Sector uses",
			"visible" : false
		},
		"echa.product_categories" : {
			"title" : "Product categories",
			"visible" : false
		},
		"echa.life_cycle_stages" : {
			"title" : "Life cycle stages",
			"visible" : false
		},
		"echa.process_category_proc" : {
			"title" : "Process categories",
			"visible" : false
		},
		"echa.environmental_release_category_erc" : {
			"title" : "Environmental release category",
			"visible" : false
		},
		"echa.article_category_ac" : {
			"title" : "Article category",
			"visible" : false
		},
		"echa.subproducts" : {
			"title" : "Subproducts",
			"visible" : false
		},
		"echa.technical_functions" : {
			"title" : "Technical functions",
			"visible" : false
		},

		"exposure_contributing_scenario.name" : {
			"title" : "Contributing exposure scenario name",
			"visible" : false
		},
		"exposure_contributing_scenario.source_domain" : {
			"title" : "Source domain",
			"visible" : false
		},
		"exposure_contributing_scenario.activity_technique_name" : {
			"title" : "Activity name",
			"visible" : false
		},
		"exposure_contributing_scenario.activity_technique_description" : {
			"title" : "Activity description",
			"visible" : false
		},
		"exposure_contributing_scenario.energy_involved" : {
			"title" : "Energy involved",
			"visible" : false
		},
		"exposure_contributing_scenario.duration_of_activity" : {
			"title" : "Duration of activity",
			"visible" : false
		},
		"exposure_contributing_scenario.amounts_used" : {
			"title" : "Amounts material used",
			"visible" : false
		},
		"exposure_contributing_scenario.emission_rate_airborne_nm" : {
			"title" : "Emission rate airborne material",
			"visible" : false
		},

		"exposure_control_measures.level_automatization" : {
			"title" : "Level automatization",
			"visible" : false
		},
		"exposure_control_measures.containment" : {
			"title" : "Containment",
			"visible" : false
		},
		"exposure_control_measures.local_exhaust_ventilation" : {
			"title" : "Local Exhaust Ventilation (LEV)",
			"visible" : false
		},
		"exposure_control_measures.general_ventilation" : {
			"title" : "General ventilation",
			"visible" : false
		},
		"exposure_control_measures.air_exchanges" : {
			"title" : "Air exchanges",
			"visible" : false
		},
		"exposure_control_measures.rpe" : {
			"title" : "RPE",
			"visible" : false
		},
		"exposure_control_measures.dermal_protection" : {
			"title" : "Dermal protection",
			"visible" : false
		},
		"exposure_control_measures.eye_protection" : {
			"title" : "Eye protection",
			"visible" : false
		},
		"exposure_factors.exposure_duration" : {
			"title" : "Exposure duration",
			"visible" : false
		},
		"exposure_factors.exposure_frequency" : {
			"title" : "Exposure frequency",
			"visible" : false
		},
		"exposure_factors.room_size" : {
			"title" : "Room size",
			"visible" : false
		},
		"premises.production_scale" : {
			"title" : "Production scale",
			"visible" : false
		},
		"premises.number_employees_working_with_nm" : {
			"title" : "Number employees working with nm",
			"visible" : false
		},
		"premises.country" : {
			"title" : "Country",
			"visible" : false
		},
		"premises.remarks" : {
			"title" : "Remarks",
			"visible" : false
		},
		"e.method" : {
			"visible" : false
		},
		"matrix_characteristics.matrix_type": {
			"title" : "Matrix type",
			"visible" : false
		},		
		"matrix_characteristics.matrix": {
			"title" : "Matrix",
			"visible" : false
		},
		"matrix_characteristics.brittleness": {
			"title" : "Brittleness",
			"visible" : false
		},
		"matrix_characteristics.physical_state": {
			"title" : "Physical state",
			"visible" : false
		},
		"matrix_characteristics.dispersion": {
			"title" : "Dispersion",
			"visible" : false
		},
		"matrix_characteristics.location_in_matrix": {
			"title" : "Location in matrix",
			"visible" : false
		},
		"matrix_characteristics.matrix_remarks": {
			"title" : "Remarks",
			"visible" : false
		},
		"matrix_characteristics.material_content": {
			"title" : "Material content",
			"visible" : false
		}		
		

	},
	"effects" : {
		"endpoint" : {
			"order" : -9,
			"visible" : true,
			"inMatrix" : true
		},
		"result" : {
			"order" : -8,
			"visible" : true,
			"inMatrix" : true
		},
		"text" : {
			"title" : "Result",
			"inMatrix" : true,
			"visible" : true,
			"order" : -7
		}

	},
	"conditions" : {
		"visible" : false,
		"t.instrument" : {
			"order" : -4,
			"visible" : true,
			"inMatrix" : false,
			"title" : "Instrument"			
		},
		"t.measurement_type" : {
			"order" : -3,
			"visible" : true,
			"inMatrix" : false,
			"title" : "Measurement type"			
		},		
		"sampling specification" : {
			"order" : -7,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Sampling specification"
		},
		"time start" : {
			"order" : -6,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Time start"
		},
		"time stop" : {
			"order" : -5,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Time stop"
		}
	},
	"interpretation" : {
		"result" : {
			"inMatrix" : false,
			"visible" : false,
			"render" : function(data, type, full) {
				return "<span class='jtox-toolkit shortened ' title='" + data
						+ "'>" + data + "</span>";
			}
		},
		"criteria" : {
			"visible" : false,
			"render" : function(data, type, full) {
				return "<span class='jtox-toolkit shortened ' title='" + data
						+ "'>" + data + "</span>";
			}
		}
	}
}
