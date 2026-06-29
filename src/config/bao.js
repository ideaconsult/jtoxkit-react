export const config_bao = {
	"protocol" : {
		"guideline" : {
			"title" : "Protocol",
			"order" : -20,
			"inMatrix" : true,
			"visible" : true,
			"render" : function(data, type, full) {
				var sOut = "";
				try {
					sOut += ("<span style='font-weight:bold;'>" + data[0] + "</span>");
				} catch (err) {
				}
				sOut += "<br/>";
				sOut += "<br/><ul>";
				$
						.each(
								full.parameters,
								function(k, v) {
									var title = k;
									try {
										title = config_bao.parameters[k
												.toLowerCase()]["title"];

										if (title === undefined)
											title = k;
									} catch (err) {
									}
									if ((v === undefined) || (v == null)
											|| ("-" == v))
										return "";

									sOut += "<li>";
									if (k.indexOf("E.") == 0) {
										sOut += ("<span style='font-weight:bold;'>"
												+ title + "</span>");
									} else
										sOut += title;

									sOut += ": ";
									try {
										if (v.loValue == undefined) {
											var uri = v.indexOf("http") >= 0;

											if (uri) {
												sOut += "<a href='"
														+ v
														+ "' target='_doi' >link</a>";
											} else
												sOut += v;
										} else {
											sOut += v.loValue;
											if (v.unit != undefined)
												sOut += " " + v.unit;
										}
									} catch (err) {
										sOut += v;

									}
									sOut += "</li>";
								});
				sOut += "</ul>";
				
				try {
					if (full.interpretation.result != undefined && full.interpretation.result != "") {
						sOut += "<ul><li>";
						sOut += ("<span style='font-weight:bold;'>"
								+ full.interpretation.criteria + "</span>");
						sOut += ":";
						sOut += full.interpretation.result;

						sOut += "</li></ul>";
					}	
				} catch (err) {} 

				return sOut;
			}
		},
		"owner" : {
			"title" : "Provided by"
		},
		"reliability" : {
			"visible" : false
		},
		"uuid" : {
			"visible" : false
		},
		"citation" : {
			"visible" : true,
			"order" : -30,
			"title" : "Reference",
			"render" : function(data, type, full) {
				var sOut = "";
				var uri = (data["title"] != undefined)
						&& (data["title"].indexOf("http") >= 0);
				if (uri) {
					sOut = (data["year"] == null || data["year"] == 0) ? "URL"
							: data["year"];
					sOut = "<a href='" + data["title"] + "' title='"
							+ data["title"] + "' target='_doi' >" + sOut
							+ "</a>";
				} else {
					sOut = (data["year"] == null || data["year"] == 0) ? ""
							: ("<br/>(" + data["year"] + ")");
					sOut = (data["title"] + sOut);
				}

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
		}
	},

	"parameters" : {
		"visible" : false,

		"data_gathering_instruments" : {
			"title" : "Instrument",
			"visible" : false
		},
		"distribution_type" : {
			"title" : "Distribution type",
			"visible" : true
		},
		"npo_1961" : {
			"title" : "Aids used to disperse/sonification",
			"visible" : false
		},
		"chmo:0002774" : {
			"title" : "Aids used to disperse/stirring",
			"visible" : false
		},
		"npo_1952" : {
			"title" : "Aids used to disperse/vortexing",
			"visible" : false
		},
		"obi_0001911 bao_0000114" : {
			"title" : "Cell culture conditions - medium",
			"order" : -17,
			"visible" : false
		},
		"cell culture conditions - serum" : {
			"order" : -18,
			"visible" : false
		},
		"serum concentration" : {
			"visible" : false
		},
		"cell culture conditions - serum concentration in growth medium" : {
			"visible" : false
		},
		"cell culture conditions - serum concentration in treatment medium" : {
			"visible" : false
		},
		"cell line/type - full name" : {
			"visible" : false
		},
		"clo_0000031" : {
			"order" : -19,
			"visible" : false,
			"title" : "Cell line"
		},
		"clo_0000031 efo_0004443" : {
			"title" : "Cell line/type - supplier",
			"visible" : false
		},
		"dispersion agent" : {
			"order" : -21,
			"visible" : false
		},
		"npo_1969 obi_0000272" : {
			"title" : "Dispersion protocol",
			"order" : -22,
			"visible" : false
		},
		"binomial" : {
			"visible" : false
		},
		"exposure duration" : {
			"order" : -22,
			"visible" : false
		},
		"temperature" : {
			"order" : -22,
			"visible" : false
		},
		"species" : {
			"visible" : false
		},
		"distribution_type" : {
			"visible" : false
		},
		"testmat_form" : {
			"visible" : false
		},
		"method details" : {
			"visible" : false
		},
		"type of method" : {
			"visible" : false
		},

		"sampling" : {
			"visible" : false,
			"title" : "Sampling"
		},
		"cell line" : {
			"visible" : false
		},
		"method type" : {
			"visible" : false
		},
		"cell pass" : {
			"visible" : false
		},
		"cell type ref" : {
			"visible" : false
		},
		"mean absorbance" : {
			"visible" : false
		},
		"operator" : {
			"visible" : false
		},
		"preincubation time" : {
			"visible" : false
		},
		"reference(+ve)" : {
			"visible" : false
		},
		"reference(-ve)" : {
			"visible" : false
		},
		"seeding" : {
			"visible" : false
		},
		"e.method" : {
			"visible" : false,
			"inMatrix" : true,
			"inHeader" : true,
			"title" : "Method"
		},
		"e.sop_reference" : {
			"visible" : false,
			"inMatrix" : true,
			"title" : "SOP reference"
		},
		"e.cell_type" : {
			"visible" : false,
			"inMatrix" : true,
			"inHeader" : true,
			"title" : "Cell type"
		},
		"e.organ" : {
			"visible" : false,
			"inMatrix" : true,
			"title" : "organ"
		},
		"e.animal_model" : {
			"visible" : false,
			"inMatrix" : true,
			"inHeader" : true,
			"title" : "Species"
		},
		"e.exposure_time" : {
			"visible" : false,
			"inMatrix" : true,
			"inHeader" : true,
			"title" : "Exposure time"
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
		}

	},
	"conditions" : {
		"visible" : false,
		"treatment_condition" : {
			"iOrder" : -7,
			"bVisible" : true,
			"inMatrix" : true,
			"sTitle" : "Treatment condition"
		},			
		"concentration" : {
			"order" : -7,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Concentration"
		},
		"concentration_ml" : {
			"order" : -7,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Concentration"
		},
		"concentration_surface" : {
			"order" : -7,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Concentration"
		},	
		"amount_of_material" : {
			"order" : -7,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Amount of material"
		},							
		"time point" : {
			"order" : -6,
			"visible" : true,
			"inMatrix" : true
		},
		"exposure_time" : {
			"order" : -4,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Exposure time"
		},
		"sampling_time" : {
			"order" : -4,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Sampling time"
		},		
		"e.exposure_time" : {
			"order" : -4,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Exposure time"
		},
		"replicate" : {
			"order" : -5,
			"visible" : true,
			"inMatrix" : false
		},
		"biological replicate" : {
			"iOrder" : -5,
			"bVisible" : true,
			"inMatrix" : false
		},		
		"technical replicate" : {
			"iOrder" : -5,
			"bVisible" : true,
			"inMatrix" : false
		},		
		"calibration range" : {
			"order" : -4,
			"visible" : true,
			"inMatrix" : false
		},		
		"emission wavelength" : {
			"order" : -3,
			"visible" : true,
			"inMatrix" : false
		},		
		"material" : {
			"order" : -5,
			"visible" : true,
			"inMatrix" : true,
			"title" : "Treatment"
		},
		"ph" : {
			"title" : "pH",
			"order" : -4,
			"visible" : true
		},
		"medium" : {
			"visible" : true,
			"title" : "Medium"
		},
		"biotarget" : {
			"visible" : false
		},
		"phraseother_percentile" : {
			"title" : "Percentile",
			"visible" : false
		},

		"remark" : {
			"visible" : false
		},
		"coating_description" : {
			"title" : "Coating",
			"visible" : true
		},
		"cell" : {
			"title" : "Cell",
			"visible" : true
		},
		"shape_descriptive" : {
			"visible" : true,
			"title" : "Shape"
		},
		"dose" : {
			"visible" : true
		},
		"exposure" : {
			"visible" : true
		},
		"sampling_time" : {
			"title" : "Sampling time",
			"visible" : true
		},
		"temperature" : {
			"visible" : true
		},
		"total dose" : {
			"visible" : true
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
