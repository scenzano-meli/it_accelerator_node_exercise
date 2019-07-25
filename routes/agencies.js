var express = require("express");
var request = require("request");
var _ = require("underscore");
var router = express.Router();
var fileDb = require("../utils/fileDbManager");

router.get("/", function(req, res) {

    request.get("https://api.mercadolibre.com/sites",
        function(error, response, body) {
            if(error) {
                res.send(error);
            } else {
                var sitesList =  JSON.parse(body);
                res.render('agencies_form', {title: "Payment Agencies Search", sites: sitesList,
                    paymentMethodsList: [{id: 'N/A', name: 'N/A'}]});
            }
        });
});

router.post("/payment_methods", function(req, res) {

    var site = req.body.siteId;
    url = "https://api.mercadolibre.com/sites/" + site + "/payment_methods";

    request.get(url,
        function(error, response, body) {
            if(error) {
                res.send(error);
            } else {
                var payMethodsJson =  JSON.parse(body);
                var paymentMethodsList = _.where(payMethodsJson, {payment_type_id: "ticket"});
                res.json(paymentMethodsList);
            }
        });
});

router.post("/search", function(req, res) {

    urlAgencies = "https://api.mercadolibre.com/sites/"

    urlAgencies += req.body.sitesDropDownInput;
    urlAgencies += "/payment_methods/";
    urlAgencies += req.body.paymentMethodsInput;
    urlAgencies += "/agencies?";
    urlAgencies += "near_to=";
    urlAgencies += req.body.latitudInput + ",";
    urlAgencies += req.body.longitudInput + ",";
    urlAgencies += req.body.radioInput;

    if(req.body.limitInput !== "") {
        urlAgencies += "&limit=" + req.body.limitInput;
    }

    if(req.body.offsetInput !== "") {
        urlAgencies += "&offset=" + req.body.offsetInput;
    }

    var nestedObjectString;

    var filterBy = req.body.filterByInput;
    if(filterBy === "address_line") {
        nestedObjectString = "address";
    }

    sortBy = req.body.sortByInput;

    request.get(urlAgencies,
        function(error, response, body) {
            if(error) {
                res.send(error);
            } else {

                var agenciesList =  JSON.parse(body);

                agenciesList = sortAgencies(agenciesList.results, nestedObjectString, filterBy, sortBy);

                fileDb.saveJsonToFile(agenciesList, "agencies_file");

                res.render('agencies_list', {title: "Agencies list",
                    agenciesList: agenciesList});
            }

        });
});

router.get("/recommended_agencies", function(req, res) {

    var agenciesList = fileDb.readJsonFromFile("recommended_agencies_file");
    if(agenciesList == null) {
        agenciesList = [];
    }

    res.render('agencies_list', {title: "Recommended Agencies list",
        agenciesList: agenciesList});
});

router.post("/save_agency", function(req, res) {
    var responseText = "";
    var agencyCode = req.body.agency_code;
    var agencyToSave;

    var recommendedAgenciesList = fileDb.readJsonFromFile("recommended_agencies_file");
    if(recommendedAgenciesList == null) {
        agencyToSave = [];
        recommendedAgenciesList = [];
    } else {
        agencyToSave = _.where(recommendedAgenciesList, {agency_code: agencyCode.toString()});
    }

    if(agencyToSave.length === 0) {
        var agenciesList = fileDb.readJsonFromFile("agencies_file");
        agencyToSave = _.where(agenciesList, {agency_code: agencyCode.toString()});
        recommendedAgenciesList.push(agencyToSave[0]);
        fileDb.saveJsonToFile(recommendedAgenciesList, "recommended_agencies_file");
        responseText = "Guardada en la lista de agencias recomendadas con exito.";
    } else {
        responseText = "Agencia previamente recomendada.";
    }

    res.send(responseText);
});

router.post("/delete_agency", function(req, res) {
    var responseText = "";
    var agencyCode = req.body.agency_code;

    var recommendedAgenciesList = fileDb.readJsonFromFile("recommended_agencies_file");
    if(recommendedAgenciesList == null) {
        responseText = "No hay agencias recomendadas para borrar";
    } else {
        var listSizeBeforeDelete = recommendedAgenciesList.length;
        recommendedAgenciesList = _.without(recommendedAgenciesList,
            _.findWhere(recommendedAgenciesList, { agency_code: agencyCode.toString() }));
        fileDb.saveJsonToFile(recommendedAgenciesList, "recommended_agencies_file");
        responseText = recommendedAgenciesList.length < listSizeBeforeDelete ?
            "Se ha borrado la agencia de la lista de agencias recomendadas." : "La agencia no se encuentra en la lista";
    }

    res.send(responseText);
});

/**
 *
 * @param jsonList a Json Objects Array
 * @param nestedObject if the value with want to use to sort is inside another object
 *                     we will provide the object name, otherwise null.
 * @param filterBy the value to sort the list
 * @param sortBy   Ascending order ("asc") or Descending ("desc"). Ascending by default.
 */
function sortAgencies(jsonList, nestedObject, filterBy, sortBy) {

    var sortedAgenciesList = _.sortBy(jsonList, function(jsonElement) {
        return (nestedObject == null ? jsonElement[filterBy] : jsonElement[nestedObject][filterBy]);
    });

    if(sortBy === "desc") {
        sortedAgenciesList = sortedAgenciesList.reverse();
    }
    return sortedAgenciesList;
}

module.exports = router;
