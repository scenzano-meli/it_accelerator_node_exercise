var fs = require("fs");

module.exports = {
    saveJsonToFile : function(jsonObject, fileName) {

        var data = JSON.stringify(jsonObject);
        fs.writeFileSync(fileName, data);
    },

    readJsonFromFile : function(fileName) {

        var rawData;
        var jsonObject;

        try {
            rawData = fs.readFileSync(fileName);
            jsonObject = JSON.parse(rawData.toString());
        } catch(err) {
            console.error(err)
            if(err.message === "path is not defined") {
                fs.closeSync(fs.openSync(fileName, 'w'));
            }
        }

        return jsonObject;
    }
};
