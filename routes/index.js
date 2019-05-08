var discretization = require('../algorithms/discretisation.js');
var statistics = require('../algorithms/statistics.js');
var getNumeric = require('../algorithms/get_only_numeric_cols.js');

const fs = require('fs');
const path = require('path');

const csv_parser = require('csv-parser');

var express = require('express');
var router = express.Router();
const app = express();
var formidable = require('formidable');
var csv = require('csvtojson');

var csvContent_String;
var classifiedSet;
var detailedAccuracy;
var csvContentJson;
var csvBody;
var csvBodyNumericNormalised;
var csvBodyNumeric;
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

var isNumericInside;

var correctOrNot;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//HOME PAGE:
router.get('/', function (req, res, next) {

    const directory = 'uploads';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
    res.render('index.html', {uploadedMessage: 'Waiting for upload', tableOriginal: "CP3403", tableToShow: "CP3403"});
});


//WHEN USER CLICKS ON DOWNLOAD SAMPLE DATASET:
router.get('/download', function (req, res, next) {
    var file = './downloads/very_small_sample.csv';
    res.download(file); // Set disposition and send it.
});


//API FOR FETCHING ORIGINAL UPLOADED DATA:
router.get('/fetch-data', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    // Accept one parameter from frontend named filename
    const filename = req.query.filename;

    res.end(JSON.stringify(csvBody));
    console.log(csvBody);
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-data-numeric', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const filename = req.query.filename;
    res.end(JSON.stringify(csvBodyNumeric));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-data-numeric-normalised', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const filename = req.query.filename;
    res.end(JSON.stringify(csvBodyNumericNormalised));
});

//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-data-classified', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const filename = req.query.filename;
    res.end(JSON.stringify(getLikelihood_entire(csvBody, true)));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-accuracy', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const filename = req.query.filename;
    res.end(JSON.stringify(detailedAccuracy));
});

//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-evidence-statistics-original', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const filename = req.query.filename;
    res.end(JSON.stringify(gatherDataForEvidence(csvBody)));
});

//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-evidence-statistics-classified', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const filename = req.query.filename;
    res.end(JSON.stringify(gatherDataForEvidence( getLikelihood_entire(csvBody, true))));
});


//WHEN USER UPLOADS A CSV FILE
router.post('/submit-form', (req, res) => {

    var form = new formidable.IncomingForm();
    var classifiedSet;
    var detailedAccuracy;
    form.encoding = "utf-8";

    form.parse(req);

    form.on('fileBegin', function (name, file) {

        var str = __dirname;
        var dir_name = str.substring(0, str.length - 7);

        file.path = dir_name + "/uploads/" + file.name;
        console.log("The file path is " + file.path);

        setTimeout(() => {
            csv()
                .fromFile(file.path)
                .then((jsonObj) => {

                    //THIS IS THE MAIN AND RAW CSV CONTENT THAT NEED TO BE PROCESSED:
                    csvBody = JSON.parse(JSON.stringify(jsonObj));

                    //get only numeric cols: --> this will return a JSON:
                    csvBodyNumeric = getNumeric.getNumericAttributes(csvBody);
                    csvBodyNumericNormalised = getNumeric.getNumericAttributesNormalised(csvBody);

                    //Discretization:
                    isNumericInside = discretization.isThereNumericInside(csvBody);
                    if (isNumericInside === true) {
                        csvBody = discretization.discretise(3, csvBody);
                    }

                    //CALC THE LIKELIHOOD ENTIRE:
                    classifiedSet = getLikelihood_entire(csvBody, true);

                    detailedAccuracy = statistics.getDetailedAccuracyByClass(csvBody, classifiedSet);
                    correctOrNot = statistics.calcCorectandIncorrectInstances(csvBody, classifiedSet);

                    //CALC EACH ATTRIBUTE:
                    csvContentJson = gatherDataForEvidence(csvBody);

                    res.status(201).send();
                })
                .then(() => {
                     console.log("Rendered OK");
                    }
                );
        }, 50);
    });
});

module.exports = {router: router, csvBody: "OK"};


//------------------------------------------------------------------------------------------------

//The grande collection of naive bayes functions:

var exportClass = function (Data) {
    var finalColName = Object.keys(Data[0])[Object.keys(Data[0]).length - 1];
    return finalColName;
};

var exportClassifierOutcomeList = function (Data) {
    var finalColName = Object.keys(Data[0])[Object.keys(Data[0]).length - 1];
    var classifierOutcomeList = [];
    Data.forEach((element) => {
        classifierOutcome = element[finalColName];
        classifierOutcomeList.push(classifierOutcome);
    });
    return classifierOutcomeList;
};

var gatherDataForEvidence = function (Data) {
    var evidenceList = {};
    var keysOfData = Object.keys(Data[0]);
    var evidenceAttributeList = {};
    var anEvidenceAttribute = "";

    var value;

    var classifierOutcomeList;
    var classCol = "";

    var laplace = false;

    classCol = exportClass(Data);
    classifierOutcomeList = exportClassifierOutcomeList(Data);

    keysOfData.forEach((aKey) => {
        evidenceAttributeList = {};
        Data.forEach((element) => {
            anEvidenceAttribute = (element[aKey]);
            evidenceAttributeList[anEvidenceAttribute] = "";

            value = {};
            classifierOutcomeList.forEach((aClass) => {
                value[aClass] = (InstanceofFrequency(Data, aKey, anEvidenceAttribute, classCol, aClass, laplace)
                    + "/"
                    + ProbalityDenominator(Data, aKey, classCol, aClass, laplace));
            });
            evidenceAttributeList[anEvidenceAttribute] = value;

        });
        evidenceList[aKey] = evidenceAttributeList;
    });
    console.log(evidenceList);
    return evidenceList;
};

var InstanceofFrequency = function (Data, Evidence, EvidenceAttribute, Class, ClassifierOutcome, laplace) {
    var count = 0;
    Data.forEach(function (element) {
        if (element[Evidence] == EvidenceAttribute && element[Class] == ClassifierOutcome) {
            count++;
        }
    });
    //Applying La Place:
    if (laplace == true) {
        count++;
    }
    return count;
};

var ProbalityDenominator = function (Data, Evidence, Class, ClassifierOutcome, laplace) {
    var count = 0;
    var instanceofFrequency = 0;

    //Build a collection of Evidence Attribute:
    var evidenceAttribute_List = [];
    Data.forEach(function (element) {
        evidenceAttribute_List.push(element[Evidence]);
        let x = (names) => names.filter((v, i) => names.indexOf(v) === i);

        //Remove duplicates:
        evidenceAttribute_List = x(evidenceAttribute_List);
    });

    evidenceAttribute_List.forEach(function (element) {
        instanceofFrequency = InstanceofFrequency(Data, Evidence, element, Class, ClassifierOutcome, laplace);
        count = count + instanceofFrequency;
        instanceofFrequency = 0;
    });
    return count;
};

var list_to_test_wo_class = {
    job: 'unemployed',
    marital: 'married',
    education: 'primary',
    default: 'no',
    housing: 'no',
    loan: 'no',
    contact: 'cellular',
    month: 'oct',
    poutcome: 'unknown',
    y: 'no'
};

//THE LAPLACE will applied in this function:
var getLikelihood = function (Data, Class, ClassifierOutcome, EvidenceAttributeList, laplace) {
    var countClass = 0;
    var singleLikelihood = 0;
    var evidenceAttribute_value;
    var finalLikelihood = 0;
    var total_finalLikelihood = 1;
    var numerator = 0;
    var probalityDenominator = 0;

    Data.forEach(function (element) {
        if (element[Class] == ClassifierOutcome) {
            countClass++;
        }
    });

    var evidenceKeys = Object.keys(EvidenceAttributeList);

    for (var i = 0; i < evidenceKeys.length - 1; i++) {

        attribute = evidenceKeys[i];

        evidenceAttribute_value = EvidenceAttributeList[attribute];

        numerator = InstanceofFrequency(Data, attribute, evidenceAttribute_value, Class, ClassifierOutcome, laplace);
        probalityDenominator = ProbalityDenominator(Data, attribute, Class, ClassifierOutcome, laplace);

        finalLikelihood = numerator / probalityDenominator;
        total_finalLikelihood *= finalLikelihood;
    }

    total_finalLikelihood *= countClass;
    return total_finalLikelihood;
};

var calculateNormalisedProbability = function (LikelihoodTrue, LikelihoodFalse, ClassifierOutcome) {
    //This function helps to convert from Likelihood to Probability:
    if (ClassifierOutcome == true) {
        return LikelihoodTrue / (LikelihoodTrue + LikelihoodFalse);
    } else {
        return LikelihoodFalse / (LikelihoodTrue + LikelihoodFalse);
    }

};


//------------------------------------------------------------------------------------------------

//Using the training data set to test:
var getLikelihood_entire = function (Data, laplace) {
    var toReturn = JSON.parse(JSON.stringify(Data));
    var attributeList = Object.keys(toReturn[1]);
    var classAttr = attributeList[attributeList.length - 1];
    var classList = [];
    toReturn.forEach((dict) => {
        classList.push(dict[classAttr])
    });
    classList = [...new Set(classList)];

    var results = [];
    var result_each = {};
    var sum_likelihood = 0;
    var theHighestProbability = 0;
    var theHighestProbability_class = ''; //the class (yes or no) in order to assign to the class.

    //Classify each row of data set:
    var n = 0;
    var j = 0;
    toReturn.forEach((dict) => {
        results = [];
        sum_likelihood = 0;

        //Get results:
        classList.forEach((aClass) => {
            results.push({
                'class_name': aClass,
                'likelihood': getLikelihood(toReturn, classAttr, aClass, dict, laplace),

                //TODO: change the number 14 below:
                'normalised_probability': (getLikelihood(toReturn, classAttr, aClass, dict, laplace) / 14)
            });
        });

        results.forEach((eachResult) => {
            sum_likelihood += eachResult.likelihood;
        });

        //Get normalised probability:
        j = 0;
        results.forEach((result) => {

            results[j].normalised_probability = (result.likelihood / sum_likelihood);
            j = j + 1;

        });

        //Get the highest probability:
        theHighestProbability = 0;
        results.forEach((each) => {
            if (each.normalised_probability > theHighestProbability) {
                theHighestProbability = each.normalised_probability;
                theHighestProbability_class = each.class_name;
            }
        });

        toReturn[n][classAttr] = theHighestProbability_class;
        n++;
    });
    return toReturn;
};