var discretization = require('../algorithms/discretisation.js');
var statistics = require('../algorithms/statistics.js');
var getNumeric = require('../algorithms/get_only_numeric_cols.js');

var multer  = require('multer');

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
var testSet;
var csvBodyNumericNormalised;
var csvBodyNumeric;
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

var isNumericInside;
let laplace = true;
var correctOrNot;

var k = 1;
var confusionMatrix;

//HOME PAGE:
router.get('/', function (req, res, next) {
    //res.render('index.html', {uploadedMessage: 'Waiting for upload', tableOriginal: "CP3403", tableToShow: "CP3403"});
});

router.get('/api/reset', function (req, res, next) {
    deleteUploaded();
});

//WHEN USER CLICKS ON DOWNLOAD SAMPLE DATASET:
router.get('/api/download', function (req, res, next) {
    let file = './downloads/very_small_sample.csv';
    res.download(file); // Set disposition and send it.
});

//API FOR FETCHING ENTIRE ORIGINAL UPLOADED DATA:
router.get('/fetch-data', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(csvBody));
    console.log(csvBody);
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-data-numeric', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(csvBodyNumeric));
});

//API FOR FETCHING CORRECTNESS TABLE:
router.get('/fetch-correctness', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(correctOrNot));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-data-numeric-normalised', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(csvBodyNumericNormalised));
});

//API FOR FETCHING CLASSIFIED DATA
router.get('/fetch-data-classified', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(classifiedSet));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-accuracy', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(detailedAccuracy));
});

//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-evidence-statistics-original', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(gatherDataForEvidence(csvBody)));
});

//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/fetch-evidence-statistics-classified', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(gatherDataForEvidence(classifiedSet)));
});

//GET DATA FOR CHART:
router.get('/fetch-evidence-for-chart', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    var nummericData = getNumeric.getNumericAttributes(csvBody);
    var nonNummericData = getNumeric.getNonNumericAttributes(csvBody);

    var toFetch = {};
    toFetch = Object.assign({}, getGeneralCount(nummericData), getGeneralCount(nonNummericData));

    res.end(JSON.stringify(toFetch));
});

//GET THE CONFUSION MATRIX:
router.get('/api/fetch-confusion-matrix', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(confusionMatrix));
});

//RETURN THE CLASSIFIED SET WITH K-FOLD VALIDATION
router.post('/api/test-cv', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    let k = req.query.k;

    /*VALIDTION OF K:
    - k must be >= 1
    - k can be only integer
    - k cannot be greaer than the length of uploade test set
    */
    if (isNaN(k)){
        res.end(JSON.stringify(['Your k is not a valid number, please recheck.']));
        return;
    }else{
        k = Math.floor(k);
        if (k<1){
            res.end(JSON.stringify(['Number k must be greater than 1, please recheck.']));
            return;
        }
    }

    //DOING THE K-FOLD-VALIDATION HERE:
    console.log("Doing k-fold with k = " + k);
    var amountOfInstances_eachTestSet = Math.floor(csvBody.length / k);
    var instance_cursor = 0;

    classifiedSet = [];

    confusionMatrix = {
        //the outer KEY is actual classes, the inner key is classified classes:
        'yes': {
            'yes': 0,
            'no': 0
        },
        'no': {
            'yes': 0,
            'no': 0
        }
    };
    let tempTestSet;
    let tempTestSetClassified;
    while (instance_cursor < csvBody.length) {
        tempTestSet = csvBody.slice(instance_cursor, instance_cursor + amountOfInstances_eachTestSet);
        if (tempTestSet !== []) {
            tempTestSetClassified = classify(csvBody, tempTestSet, laplace);
            updateConfusionMatrix(tempTestSet, tempTestSetClassified, exportClass(csvBody), confusionMatrix);
        }
        classifiedSet = classifiedSet.concat(tempTestSetClassified);
        instance_cursor += amountOfInstances_eachTestSet;
    }

    detailedAccuracy = statistics.getDetailedAccuracyByClass(csvBody, classifiedSet);
    correctOrNot = statistics.calcCorectandIncorrectInstances(csvBody, classifiedSet);

    let toReturn = {
        first_15rows_results: null,
        correctness: null,
        detailed_accuracy: null,
        confusion_matrix: null,
    };

    toReturn.first_15rows_results = classifiedSet.slice(0, 15); //<-- Getting 15 rows to return to the front-end:
    toReturn.correctness = correctOrNot;
    toReturn.detailed_accuracy = detailedAccuracy;
    toReturn.confusion_matrix = confusionMatrix;
    res.end(JSON.stringify(toReturn));
});

//RETURN THE CLASSIFIED SET WITH UPLOADED TEST SET:
router.post('/api/test-up', function (req, res, next) {
    console.log("/api/test-up is working.");
    res.setHeader('Content-Type', 'application/json');

    let file = req.files;
    console.log('fileName = ' + file);

    let form = new formidable.IncomingForm();

    form.encoding = "utf-8";
    form.parse(req);

    form.on('fileBegin', function (name, file) {

        let str = __dirname;
        let dir_name = str.substring(0, str.length - 7);

        file.path = dir_name + "/uploads/" + file.name;
        console.log('/api/test-up = ' + file.path);

        setTimeout(() => {
            csv()
                .fromFile(file.path)
                .then((jsonObj) => {
                    classifiedSet = [];
                    confusionMatrix = {
                        //the outer KEY is actual classes, the inner key is classified classes:
                        'yes': {
                            'yes': 0,
                            'no': 0
                        },
                        'no': {
                            'yes': 0,
                            'no': 0
                        }
                    };
                    testSet = JSON.parse(JSON.stringify(jsonObj));

                    classifiedSet = classify(csvBody,testSet,laplace);

                    detailedAccuracy = statistics.getDetailedAccuracyByClass(testSet, classifiedSet);
                    correctOrNot = statistics.calcCorectandIncorrectInstances(testSet, classifiedSet);

                    updateConfusionMatrix(testSet, classifiedSet, exportClass(csvBody), confusionMatrix);

                    let toReturn = {
                        first_15rows_results: null,
                        correctness: null,
                        detailed_accuracy: null,
                        confusion_matrix: null,
                    };
                
                    toReturn.first_15rows_results = classifiedSet.slice(0, 15); //<-- Getting 15 rows to return to the front-end:
                    toReturn.correctness = correctOrNot;
                    toReturn.detailed_accuracy = detailedAccuracy;
                    toReturn.confusion_matrix = confusionMatrix;

                    res.status(202).end(JSON.stringify(toReturn));
                })
                .then(() => {
                        console.log("api/test-up OK");
                    }
                );
        }, 50);
    });
});

//WHEN USER UPLOADS A CSV FILE
router.post('/submit-form', (req, res, next) => {

    var form = new formidable.IncomingForm();

    var csvIsEmpty;
    if (csvBody == null) {
        csvIsEmpty = 'Before this, the CSV Body is empty';
    } else {
        csvIsEmpty = 'Before this, the CSV Body is NOT empty';
    }

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
                    //console.log(jsonObj);
                    testSet = JSON.parse(JSON.stringify(jsonObj));
                    csvBody = JSON.parse(JSON.stringify(jsonObj));

                    //get only numeric cols: --> this will return a JSON:
                    csvBodyNumeric = getNumeric.getNumericAttributes(csvBody);
                    csvBodyNumericNormalised = getNumeric.getNumericAttributesNormalised(csvBody);

                    //CALC EACH ATTRIBUTE:
                    csvContentJson = gatherDataForEvidence(csvBody, false);

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

//K-FOLD VALIDATION:
const updateConfusionMatrix = function (OriginalSet, ClassifiedSet, classAttribute, ConfusionMatrixTemplate) {
    //!\The test set and the classified set must have the same number of rows
    //classAttribute will be 'y'
    //This function will use the available labels in ConfusionMatrixTemplate as classifier outcome to calculate:

    let classList = [];

    let originalData = JSON.parse(JSON.stringify(OriginalSet));
    let classifiedData = JSON.parse(JSON.stringify(ClassifiedSet));

    //ConfusionMatrixTemplate.forEach((each) => {
    classList = (Object.keys(ConfusionMatrixTemplate));
    // });

    //classList = [...new Set(classList)];
    //console.log('classList = ' + classList);

    let length_to_test = ClassifiedSet.length;
    //console.log('ClassifiedSet.length = ' + ClassifiedSet.length);

    //Getting the False ones:
    classList.forEach((actualClass) => {
        classList.forEach((classifiedClass) => {
                for (let m = 0; m < length_to_test; m++) {
                    if (originalData[m][classAttribute] === actualClass
                        && classifiedData[m][classAttribute] === classifiedClass) {
                        ConfusionMatrixTemplate[actualClass][classifiedClass]++;
                    }
                }
            }
        )
    });

};


//------------------------------------------------------------------------------------------------

//Function to reset/delete the dataset:
const deleteUploaded = function () {
    const directory = 'uploads';
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
    csvBody = null;
    testSet = null;
    classifiedSet = null;
};


//------------------------------------------------------------------------------------------------

//The grande collection of naive bayes functions:

const getGeneralCount = function (data) {

    var evidenceList = {};

    var Data = JSON.parse(JSON.stringify(data));
    var keysOfData = Object.keys(Data[0]);

    var evidenceAttributeList = {};
    var anEvidenceAttribute = "";
    var value;
    var classifierOutcomeList;
    var classCol = "";

    var labels = [];
    var values = [];
    var count = 0;

    classCol = exportClass(Data);
    classifierOutcomeList = exportClassifierOutcomeList(Data);
    classifierOutcomeList = [...new Set(classifierOutcomeList)];

    console.log("classifierOutcomeList: " + classifierOutcomeList);

    keysOfData.forEach((aKey) => {
        evidenceAttributeList = {};
        Data.forEach((element) => {
            anEvidenceAttribute = (element[aKey]);
            evidenceAttributeList[anEvidenceAttribute] = "";

            value = 0;
            classifierOutcomeList.forEach((aClass) => {
                value += (InstanceofFrequency(Data, aKey, anEvidenceAttribute, classCol, aClass, false));
            });

            evidenceAttributeList[anEvidenceAttribute] = value;
        });
        labels = Object.keys(evidenceAttributeList);
        values = Object.values(evidenceAttributeList);
        
        evidenceAttributeList = {};
        evidenceAttributeList['labels'] = labels;
        evidenceAttributeList['values'] = values;

        //Get the total:
        values.forEach((aValue) => {
            count ++;
        });
        evidenceAttributeList['count'] = count + " instances";

        evidenceList[aKey] = evidenceAttributeList;
    });

    return evidenceList;
};

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

var gatherDataForEvidence = function (data, laplace) {
    var Data = JSON.parse(JSON.stringify(data));
    var evidenceList = {};
    var keysOfData = Object.keys(Data[0]);
    var evidenceAttributeList = {};
    var anEvidenceAttribute = "";

    var value;
    let count = {};

    var classifierOutcomeList;
    var classCol = "";

    classCol = exportClass(Data);
    classifierOutcomeList = exportClassifierOutcomeList(Data);
    classifierOutcomeList = [...new Set(classifierOutcomeList)];

    keysOfData.forEach((aKey) => {
        //count = {};
        evidenceAttributeList = {};
        Data.forEach((element) => {
            anEvidenceAttribute = (element[aKey]);
            evidenceAttributeList[anEvidenceAttribute] = "";

            value = {};
            classifierOutcomeList.forEach((aClass) => {
                /* value[aClass] = (InstanceofFrequency(Data, aKey, anEvidenceAttribute, classCol, aClass, laplace)
                    + "/"
                    + ProbalityDenominator(Data, aKey, classCol, aClass, laplace)); */
                value[aClass] = (InstanceofFrequency(Data, aKey, anEvidenceAttribute, classCol, aClass, laplace));
                
            });
            evidenceAttributeList[anEvidenceAttribute] = value;
        });
        classifierOutcomeList.forEach((aClass) => {
            count[aClass] = ProbalityDenominator(Data, aKey, classCol, aClass, laplace);
        });
        evidenceAttributeList['count'] = count;
        evidenceList[aKey] = evidenceAttributeList;
    });
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
    if (laplace === true) {
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

var EvidenceAttributeList = {
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

var getMean = function (Data, Attribute_Need_To_findMean) {
    var data = JSON.parse(JSON.stringify(Data));
    var sumAll = 0;
    var n = 0;
    data.forEach((aDict) => {
        sumAll += parseFloat(aDict[Attribute_Need_To_findMean]);
        n++;
    });
    //console.log(sumAll + "/" + n + " = " + (sumAll / n));
    return (sumAll / n);
};

var getStdDeviation = function (Data, Attribute_Need_To_findStdDev) {
    var numeratorOfStdDev = 0;
    var mean = getMean(Data, Attribute_Need_To_findStdDev);
    var x;
    var data = JSON.parse(JSON.stringify(Data));
    var n = 0;

    data.forEach((aDict) => {
        x = aDict[Attribute_Need_To_findStdDev];
        numeratorOfStdDev += Math.abs(Math.pow((x - mean), 2));
        n++;
    });
    return (numeratorOfStdDev / (n - 1));

};

//THE LAPLACE will applied in this function:
var getLikelihood = function (Data, Class, ClassifierOutcome, EvidenceAttributeList, laplace) {
    var countClass = 0;
    var evidenceAttribute_value;
    var finalLikelihood = 0;
    var total_finalLikelihood = 1;
    var numerator = 0;
    var probalityDenominator = 0;
    var x;
    var stdDev;
    var mean;
    var attribute;

    Data.forEach(function (element) {
        if (element[Class] === ClassifierOutcome) {
            countClass++;
        }
    });

    countClass = countClass / (Data.length);

    var evidenceKeys = Object.keys(EvidenceAttributeList);

    for (var i = 0; i < evidenceKeys.length - 1; i++) {

        attribute = evidenceKeys[i];
        evidenceAttribute_value = EvidenceAttributeList[attribute];

        if (isNaN(parseInt(evidenceAttribute_value)) === false &&
            (typeof parseInt(evidenceAttribute_value) == "number")
        ) {
            mean = getMean(Data, attribute);
            stdDev = getStdDeviation(Data, attribute);
            x = evidenceAttribute_value;

            finalLikelihood = (1 / (stdDev * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.abs(Math.pow((x - mean), 2)) / (2 * Math.pow(stdDev, 2))));
        } else {
            numerator = InstanceofFrequency(Data, attribute, evidenceAttribute_value, Class, ClassifierOutcome, laplace);
            probalityDenominator = ProbalityDenominator(Data, attribute, Class, ClassifierOutcome, laplace);
            finalLikelihood = numerator / probalityDenominator;
        }

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
var classify = function (Data, TestSet, laplace) {
    var originData = JSON.parse(JSON.stringify(Data));

    var toReturn = JSON.parse(JSON.stringify(TestSet));

    var attributeList = Object.keys(toReturn[0]);
    var classAttr = attributeList[attributeList.length - 1];
    var classList = [];
    toReturn.forEach((dict) => {
        classList.push(dict[classAttr])
    });
    classList = [...new Set(classList)];

    var results = [];
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
                'likelihood': getLikelihood(originData, classAttr, aClass, dict, laplace),
                'normalised_probability': 0
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
        theHighestProbability = results[0].normalised_probability;
        theHighestProbability_class = results[0].class_name;

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