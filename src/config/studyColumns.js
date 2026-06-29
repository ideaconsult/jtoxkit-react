import { installLegacyGlobals } from '../utils/legacyGlobals.js'
import { config_i5 } from './i5.js'

// Install the jQuery `$`/iuuid/auuid shims the verbatim jToxKit render() callbacks need.
// Called (not a bare side-effect import) so the library build can't tree-shake it away.
installLegacyGlobals()
import { config_bao } from './bao.js'
import { config_npo } from './npo.js'
import { config_exposure } from './exposure.js'

// Legacy jToxKit ajaxSettings (jQuery) is harmless here — the React data layer handles
// auth/credentials. Stub AuthTokens so the object literal still evaluates.
function AuthTokens() { return { headers: () => ({}) } }

export const config_study = {
	      ajaxSettings: {
	          crossDomain: true,
	          xhrFields: {
	            withCredentials: true
	         },
			 headers : new AuthTokens().headers(),
	        },
	"columns" : {
		"_" : {
			"main" : {
				"name" : {
					"visible" : false
				}
			},
			"parameters" : {},
			"conditions" : {},
			"effects" : {
				"text" : {
					"visible" : false
				}
			},

			"protocol" : {
				"citation" : {
					"visible" : false,
					"order" : -1,
					"title" : "Study year",
					"oldRender" : function(data, type, full) {
						return "<span title='"
								+ (data["title"] == null ? "N/A"
										: data["title"]) + "'>"
								+ (data["year"] == null ? "-" : data["year"])
								+ "</span>";
					},
					"render" : function(data, type, full) {

						// var quri = "?type=citation&search=";
						var uri = (data["title"] != undefined)
								&& (data["title"].indexOf("http") == 0);
						if (uri) {
							var sOut = (data["year"] == null || data["year"] == 0) ? "URL"
									: data["year"];
							return "<a href='" + data["title"] + "' title='"
									+ data["title"] + "' target='_doi' >"
									+ sOut + "</a>";
						} else {
							return "<span title='"
									+ (data["title"] == null ? "N/A"
											: data["title"])
									+ "'>"
									+ (data["year"] == null ? "-"
											: data["year"]) + "</span>";
						}
					}
				},

				"uuid" : {
					"visible" : true
				},
				"reliability" : {
					"visible" : true
				}
			},
			"interpretation" : {}
		},
		"GI_GENERAL_INFORM_SECTION" : {
			"conditions" : {
					
				"remark" : {
					"order" : -4
				}
			},
			"effects" : {
				"endpoint" : {
					"title" : "Parameter",
					"order" : -6,
					"inMatrix" : true
				},
				"text" : {
					"title" : "Result",
					"order" : -5,
					"visible" : true,
					"inMatrix" : true
				},
				"result" : {
					"visible" : false
				}
			},
			"interpretation" : {
				"result" : {
					"title" : "Substance type",
					"order" : -3,
					"inMatrix" : true,
					"visible" : false
				}
			},
			"protocol" : {
				"owner" : {
					"title" : "Provider"
				},
				"uuid" : {
					"visible" : true
				},
				"reliability" : {
					"visible" : false
				}
			}
			
		},
		"PC_DENSITY_SECTION" : config_i5["PC_DENSITY_SECTION"],
		"PC_MELTING_SECTION" : config_i5["PC_MELTING_SECTION"],
		"PC_BOILING_SECTION" : config_i5["PC_BOILING_SECTION"],
		"PC_VAPOUR_SECTION" : config_i5["PC_VAPOUR_SECTION"],
		"PC_PARTITION_SECTION" : config_i5["PC_PARTITION_SECTION"],
		"SURFACE_TENSION_SECTION" : config_i5["SURFACE_TENSION_SECTION"],
		"PC_WATER_SOL_SECTION" : config_i5["PC_WATER_SOL_SECTION"],
		"PC_SOL_ORGANIC_SECTION" : config_i5["PC_SOL_ORGANIC_SECTION"],
		"PC_NON_SATURATED_PH_SECTION" : config_i5["PC_NON_SATURATED_PH_SECTION"],
		"PC_DISSOCIATION_SECTION" : config_i5["PC_DISSOCIATION_SECTION"],
		"TO_ACUTE_ORAL_SECTION" : config_i5["TO_ACUTE_ORAL_SECTION"],
		"TO_ACUTE_OTHER_SECTION" : config_i5["TO_ACUTE_OTHER_SECTION"],
		"TO_ACUTE_DERMAL_SECTION" : config_i5["TO_ACUTE_DERMAL_SECTION"],
		"TO_ACUTE_INHAL_SECTION" : config_i5["TO_ACUTE_INHAL_SECTION"],
		"TO_ACUTE_PULMONARY_INSTILLATION_SECTION" : config_i5["TO_ACUTE_PULMONARY_INSTILLATION_SECTION"],
		"TO_SKIN_IRRITATION_SECTION" : config_i5["TO_SKIN_IRRITATION_SECTION"],

		"TO_EYE_IRRITATION_SECTION" : config_i5["TO_EYE_IRRITATION_SECTION"],

		"TO_SENSITIZATION_SECTION" : config_i5["TO_SENSITIZATION_SECTION"],

		"TO_REPEATED_OTHER_SECTION" : config_i5["TO_REPEATED_OTHER_SECTION"],
		"TO_REPEATED_ORAL_SECTION" : config_i5["TO_REPEATED_ORAL_SECTION"],

		"TO_REPEATED_INHAL_SECTION" : config_i5["TO_REPEATED_INHAL_SECTION"],

		"TO_REPEATED_DERMAL_SECTION" : config_i5["TO_REPEATED_DERMAL_SECTION"],

		"TO_GENETIC_IN_VITRO_SECTION" : config_i5["TO_GENETIC_IN_VITRO_SECTION"],

		"TO_GENETIC_IN_VIVO_SECTION" : config_i5["TO_GENETIC_IN_VIVO_SECTION"],

		"TO_CARCINOGENICITY_SECTION" : config_i5["TO_CARCINOGENICITY_SECTION"],

		"TO_REPRODUCTION_SECTION" : config_i5["TO_REPRODUCTION_SECTION"],

		"TO_DEVELOPMENTAL_SECTION" : config_i5["TO_DEVELOPMENTAL_SECTION"],
		"PC_THERMAL_STABILITY_SECTION" : config_i5["PC_THERMAL_STABILITY_SECTION"],

		"NPO_1709_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"NPO_1911_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"ENM_8000223_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"ENM_9000011_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"ENM_9000013_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"ENM_0000044_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"NPO_1773_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"NPO_1339_SECTION" : {
			"parameters" : config_npo["parameters"],
			"effects" : config_npo["effects"],
			"conditions" : config_npo["conditions"],
			"protocol" : config_npo["protocol"],
			"interpretation" : config_npo["interpretation"]
		},
		"BAO_0002189_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"BAO_0002167_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"ENM_0000081_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"ENM_0000037_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"BAO_0002189" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"BAO_0002993_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"BAO_0002733_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"OBI_0302736_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CHMO_0000287_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CHMO_0000234_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CHMO_0000239_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CHMO_0000538_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CSEO_00001191_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"IMPURITY_SECTION" : {
			"parameters" : config_bao["parameters"],
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
					"title" : "Element / Func. group",
					"order" : -7,
					"visible" : true,
					"inMatrix" : true
				}

			},
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"ANALYTICAL_METHODS_SECTION" : {
			"parameters" : config_bao["parameters"],
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
					"title" : "Element / Func. group",
					"order" : -7,
					"visible" : true,
					"inMatrix" : true
				}

			},
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"TO_PHOTOTRANS_AIR_SECTION" : config_i5["TO_PHOTOTRANS_AIR_SECTION"],

		"TO_HYDROLYSIS_SECTION" : config_i5["TO_HYDROLYSIS_SECTION"],

		"TO_BIODEG_WATER_SCREEN_SECTION" : config_i5["TO_BIODEG_WATER_SCREEN_SECTION"],

		"TO_BIODEG_WATER_SIM_SECTION" : config_i5["TO_BIODEG_WATER_SIM_SECTION"],

		"EN_STABILITY_IN_SOIL_SECTION" : config_i5["EN_STABILITY_IN_SOIL_SECTION"],

		"EN_BIOACCUMULATION_SECTION" : config_i5["EN_BIOACCUMULATION_SECTION"],

		"EN_BIOACCU_TERR_SECTION" : config_i5["EN_BIOACCU_TERR_SECTION"],
		"EN_ADSORPTION_SECTION" : config_i5["EN_ADSORPTION_SECTION"],

		"EN_HENRY_LAW_SECTION" : config_i5["EN_HENRY_LAW_SECTION"],
		"EC_FISHTOX_SECTION" : config_i5["EC_FISHTOX_SECTION"],

		"EC_CHRONFISHTOX_SECTION" : config_i5["EC_CHRONFISHTOX_SECTION"],

		"EC_DAPHNIATOX_SECTION" : config_i5["EC_DAPHNIATOX_SECTION"],

		"EC_CHRONDAPHNIATOX_SECTION" : config_i5["EC_CHRONDAPHNIATOX_SECTION"],

		"EC_ALGAETOX_SECTION" : config_i5["EC_ALGAETOX_SECTION"],

		"EC_BACTOX_SECTION" : config_i5["EC_BACTOX_SECTION"],

		"EC_SOIL_MICRO_TOX_SECTION" : config_i5["EC_SOIL_MICRO_TOX_SECTION"],
		"EC_PLANTTOX_SECTION" : config_i5["EC_PLANTTOX_SECTION"],

		"EC_SEDIMENTDWELLINGTOX_SECTION" : config_i5["EC_SEDIMENTDWELLINGTOX_SECTION"],
		"EC_SOILDWELLINGTOX_SECTION" : config_i5["EC_SOILDWELLINGTOX_SECTION"],
		"EC_HONEYBEESTOX_SECTION" : config_i5["EC_HONEYBEESTOX_SECTION"],

		"AGGLOMERATION_AGGREGATION_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]

		},
		"ASPECT_RATIO_SHAPE_SECTION" : config_i5["ASPECT_RATIO_SHAPE_SECTION"],
		"ZETA_POTENTIAL_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"I5ZETA_POTENTIAL_SECTION" : config_i5["ZETA_POTENTIAL_SECTION"],

		"GENERIC_SURFACE_CHEMISTRY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : {
				"result" : {
					"title" : "Conclusions",
					"visible" : false
				},
				"criteria" : {
					"title" : "Coating / Functionalisation",
					"visible" : true,
					"order" : -24
				}
			}
		},
		"SURFACE_CHEMISTRY_SECTION" : config_i5["SURFACE_CHEMISTRY_SECTION"],

		"PC_GRANULOMETRY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"RADICAL_FORMATION_POTENTIAL_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},		
		"CRYSTALLITE_AND_GRAIN_SIZE_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"DUSTINESS_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"POROSITY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"SPECIFIC_SURFACE_AREA_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"POUR_DENSITY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"PHOTOCATALYTIC_ACTIVITY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CATALYTIC_ACTIVITY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CRYSTALLINE_PHASE_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : {
				"endpoint" : {
					"visible" : true,
					"inMatrix" : true,
					"order" : -9
				},
				"result" : {
					"visible" : true,
					"inMatrix" : true,
					"order" : -7
				},
				"text" : {
					"title" : "Result",
					"visible" : true,
					"inMatrix" : true,
					"order" : -8
				}
			},
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"OMICS_SECTION" : {
			"parameters" : config_bao["parameters"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : {
				"result" : {
					"visible" : false
				},
				"criteria" : {
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
					"visible" : false
				},
				"text" : {
					"order" : -8,
					"visible" : true,
					"inMatrix" : true,
					"title" : "Identifier",
					"render" : function(data, type, full) {
						try {
							var id = data[0].result.textValue;
							var out= "<a target='_external' href='" + full.interpretation.criteria  + "'>"+id+"</a>";
							return out;
						} catch(e) {
							return data;
						}
					}		
							

				}

			}			
		},
		"METABOLOMICS_SECTION" : {
			"parameters" : config_bao["parameters"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"],
			"effects" : {
				"endpoint" : {
					"order" : -9,
					"visible" : true,
					"inMatrix" : true,
					"title" : "Result"
				},
				"text" : {
					"order" : -8,
					"visible" : true,
					"inMatrix" : true,
					"title" : ""
				},
				"result" : {
					"order" : -8,
					"visible" : false,
					"inMatrix" : false
				}

			},
		},
		"TRANSCRIPTOMICS_SECTION" : {
			"parameters" : config_bao["parameters"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"],
			"effects" : {
				"endpoint" : {
					"order" : -9,
					"visible" : true,
					"inMatrix" : true,
					"title" : "Result"
				},
				"text" : {
					"order" : -8,
					"visible" : true,
					"inMatrix" : true,
					"title" : ""
				},
				"result" : {
					"order" : -8,
					"visible" : false,
					"inMatrix" : false
				}

			},
		},
		"PROTEOMICS_SECTION" : {
			"parameters" : {
				"visible" : false,
				"type of method" : {
					"order" : -23,
					"visible" : true,
					"title" : "Method type"
				},
				"method details" : {
					"order" : -22,
					"visible" : false
				},
				"sampling" : {
					"title" : "Sampling",
					"order" : -21,
					"visible" : false
				},
				"data_gathering_instruments" : {
					"title" : "Instruments",
					"order" : -20,

					"visible" : true
				},
				"testmat_form" : {
					"title" : "Test Material Form",
					"visible" : false,
					"order" : -19
				}
			},
			"conditions" : {
				"visible" : true
			},
			"effects" : {
				"endpoint" : {
					"order" : -13,
					"visible" : true,
					"inMatrix" : true
				},
				"text" : {
					"visible" : false,
					"order" : -12,
					"inMatrix" : true
				},
				"result" : {
					"visible" : false,
					"order" : -11
				}
			},
			"protocol" : {
				"visible" : false,
				"guideline" : {
					"order" : -5,
					"inMatrix" : true
				},
				"citation" : {
					"visible" : false

				}
			},
			"interpretation" : {
				"result" : {
					"title" : "Conclusions",
					"order" : -10,
					"visible" : false
				},
				"criteria" : {
					"visible" : false
				}
			}
		},
		"PC_UNKNOWN_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"BIO_NANO_INTERACTION_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},		
		"RISKASSESSMENT_SECTION" : config_i5["RISKASSESSMENT_SECTION"],

		"UNKNOWN_TOXICITY_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"interpretation" : config_bao["interpretation"],
			"protocol" : {
				"guideline" : {
					"title" : "Protocol",
					"order" : -20,
					"inMatrix" : true,
					"visible" : true,
					"render" : function(data, type, full) {
						var sOut = "";
						try {
							sOut += data[0];
						} catch (err) {
						}
						sOut += "<br/>";
						sOut += "<br/><ul>";
						$.each(full.parameters,
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
									sOut += "<li>" + title + ": ";
									try {
										if (v.loValue == undefined)
											sOut += v;
										else
											sOut += v.loValue + " " + v.unit;
									} catch (err) {
										sOut += v;
									}
									"</li>";
								});
						sOut += "</ul>";
						return sOut;
					}
				},
				"uuid" : {
					"visible" : false
				},
				"citation" : {
					"visible" : true,
					"order" : -30,
					"title" : "Reference",
					"render" : function(data, type, full) {
						var sOut = (data["year"] == null || data["year"] == 0) ? "DOI"
								: data["year"];
						return "<a href='" + data["title"] + "' title='"
								+ data["title"] + "' target='_doi' >" + sOut
								+ "</a>";
					}
				}
			}
		},
		"UNKNOWN_TOXICITY_SECTION_SUMMARY" : {
			"effects" : {
				"text" : {
					"visible" : true,
					"inMatrix" : true
				}
			}
		},
		"PUBCHEM_SUMMARY_SECTION" : {
			"parameters" : {
				"target gene" : {
					"visible" : false,
					"order" : -14
				}
			},
			"effects" : {
				"endpoint" : {
					"order" : -13,
					"visible" : true,
					"inMatrix" : true
				},
				"text" : {
					"visible" : true,
					"inMatrix" : true,
					"order" : -11
				},
				"result" : {
					"visible" : true,
					"inMatrix" : true,
					"order" : -12
				}
			},
			"conditions" : {
				"replicate" : {
					"visible" : true
				},
				"doses/concentrations" : {
					"visible" : true,
					"title" : "Concentration",
					"inMatrix" : true
				},
				"emission wavelength" : {
					"visible" : true,
					"order" : -5
				},
				"target gene" : {
					"visible" : false,
					"order" : -6
				}
			},
			"protocol" : {
				"citation" : {
					"visible" : true,
					"title" : "Reference",
					"order" : -15,
					"render" : function(data, type, full) {
						var sOut = (data["year"] == null || data["year"] == 0) ? data["title"]
								: data["year"];
						return "PubChem Assay: <a href='" + data["title"]
								+ "' title='" + data["title"]
								+ "' target='_doi' >" + sOut + "</a>";
					}
				}
			},
			"interpretation" : {
				"result" : {
					"title" : "PubChem Activity Outcome",
					"order" : -4,
					"visible" : true
				},
				"criteria" : {
					"title" : "Target",
					"order" : -3,
					"visible" : true
				}
			}

		},
		"PUBCHEM_DOSERESPONSE_SECTION" : {
			"effects" : {
				"endpoint" : {
					"order" : -7
				},
				"result" : {
					"title" : "Response",
					"order" : -5
				},
				"text" : {
					"visible" : false
				}
			},
			"conditions" : {
				"replicate" : {
					"visible" : true,
					"order" : -8
				},
				"doses/concentrations" : {
					"visible" : true,
					"title" : "Concentration",
					"order" : -6
				},
				"emission wavelength" : {
					"visible" : true,
					"order" : -9
				}

			},
			"protocol" : {
				"citation" : {
					"visible" : true,
					"title" : "Reference",
					"render" : function(data, type, full) {
						var sOut = (data["year"] == null || data["year"] == 0) ? "DOI"
								: data["year"];
						return "<a href='" + data["title"] + "' title='"
								+ data["title"] + "' target='_doi' >" + sOut
								+ "</a>";
					},
					"order" : -10
				}
			},
			"interpretation" : {
				"result" : {
					"visible" : false
				},
				"criteria" : {
					"visible" : false
				}
			}
		},
		"PUBCHEM_CONFIRMATORY_SECTION" : {
			"effects" : {
				"text" : {
					"visible" : true
				}
			},
			"conditions" : {
				"replicate" : {
					"visible" : true
				},
				"doses/concentrations" : {
					"visible" : true,
					"title" : "Concentration"
				},
				"emission wavelength" : {
					"visible" : true
				}

			},
			"protocol" : {
				"citation" : {
					"visible" : true,
					"title" : "Reference",
					"render" : function(data, type, full) {
						return data["title"];
					}
				}
			},
			"interpretation" : {
				"result" : {
					"visible" : false
				},
				"criteria" : {
					"visible" : false
				}
			}
		},
		"CELL_VIABILITY_ASSAY_SECTION" : {
			"effects" : {
				"text" : {
					"visible" : true
				}
			}
		},
		"PROTEIN_SMALLMOLECULE_INTERACTION_SECTION" : {
			"effects" : {
				"text" : {
					"visible" : true
				}
			}
		},
		"TRANSCRIPTION_PROFILING" : {
			"effects" : {
				"text" : {
					"visible" : true,
					"title" : "File"
				}
			}
		},

		"BAO_0003009_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"ENM_0000068_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		
		"NPO_296_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"BAO_0003006_SECTION": {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]

		},
		"BAO_0002084_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]

		},
		"BAO_0000451_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"MMO_0000368_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"MESOCOSM_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"CHEMINF_000513" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"EXPOSURE_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : config_bao["effects"],
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		},
		"ORE_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"ECR_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},			
		"EXPOSURE_MANUFACTURE_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"EXPOSURE_FORMULATION_REPACKAGING_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"EXPOSURE_INDUSTRIAL_SITES_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"EXPOSURE_PROFESSIONAL_WORKERS_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"EXPOSURE_CONSUMER_USE_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"EXPOSURE_SERVICE_LIFE_SECTION" : {
			"parameters" : config_exposure["parameters"],
			"effects" : config_exposure["effects"],
			"conditions" : config_exposure["conditions"],
			"protocol" : config_exposure["protocol"],
			"interpretation" : config_exposure["interpretation"]
		},
		"PROCESS_SECTION" : {
			"parameters" : config_bao["parameters"],
			"effects" : {
				"endpoint" : {
					"iOrder" : -9,
					"bVisible" : false,
					"inMatrix" : false
				},
				"result" : {
					"inMatrix" : false,
					"bVisible" : false,					
				},
				"text" : {
					"sTitle" : "Result",
					"inMatrix" : false,
					"bVisible" : false,
					"iOrder" : -7
				}
		
			},			
			"conditions" : config_bao["conditions"],
			"protocol" : config_bao["protocol"],
			"interpretation" : config_bao["interpretation"]
		}					
		
	}
}
