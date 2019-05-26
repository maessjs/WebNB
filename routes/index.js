var ProgressBar = require('progress');
var bar;

const converter = require('json-2-csv');
var statistics = require('../algorithms/statistics.js');
var getNumeric = require('../algorithms/get_only_numeric_cols.js');

var multer = require('multer');

const fs = require('fs');
const path = require('path');

const csv_parser = require('csv-parser');

var express = require('express');
var router = express.Router();
const app = express();
var formidable = require('formidable');
var csv = require('csvtojson');
const RESULT_TO_ARRAY = true;

var classifiedSet;
var classifiedSet_plusOriginalClass;
var detailedAccuracy;

var accuracy;
var kappa = 0;
var MAE = 0;
var MSE = 0;
var SSE = 0;

var csvBody;
var testSet;
var csvBodyNumericNormalised;
var csvBodyNumeric;
var probabilityList = [];
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var isNumericInside;
let laplace = true;
var correctOrNot;

var k = 1;
var confusionMatrix;

var trainingDataFilename = '';

var generalStatus = {
    trainingDataUploaded: false,
    trainingDataFilename: null,
    testingDataFileName: null,
    tested: false,
    testingMode: 0,
    hasOriginalClass: null
};

//HOME PAGE:
router.get('/', function (req, res, next) {
});

router.delete('/api/reset', function (req, res, next) {
    deleteUploaded();
    generalStatus = {
        trainingDataUploaded: false,
        trainingDataFilename: null,
        tested: false,
        testingMode: 0
    };

    res.status(202).end(JSON.stringify(generalStatus));
});

//WHEN USER CLICKS ON DOWNLOAD SAMPLE DATASET:
router.get('/api/download', function (req, res, next) {
    let fileNameToDownLoad = req.query.fileName;
    let file = './downloads/' + fileNameToDownLoad;
    res.download(file);
});

//API FOR FETCHING ENTIRE ORIGINAL UPLOADED DATA:
router.get('/api/fetch-data', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(csvBody));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/api/fetch-data-numeric', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(csvBodyNumeric));
});

//API FOR FETCHING CORRECTNESS TABLE:
router.get('/api/fetch-correctness', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(correctOrNot));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/api/fetch-data-numeric-normalised', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(csvBodyNumericNormalised));
});

//API FOR FETCHING CLASSIFIED DATA
router.get('/api/fetch-data-classified', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(classifiedSet));
});


//API FOR FETCHING ONLY NUMERIC DATA:
router.get('/api/fetch-accuracy', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(detailedAccuracy));
});

//GET DATA FOR CHART:
router.get('/api/fetch-evidence-for-chart', function (req, res, next) {
    bar = new ProgressBar(':bar', { total: 5 });
    res.setHeader('Content-Type', 'application/json');
    bar.tick();
    let nummericData = getNumeric.getNumericAttributes(csvBody);
    let nonNummericData = getNumeric.getNonNumericAttributes(csvBody);
    bar.tick();
    let toFetch = {};
    toFetch = Object.assign({}, getGeneralCount(nummericData, true), getGeneralCount(nonNummericData, false));
    bar.tick();
    //Order as the order of original training dataset:
    let toReturn = {};
    bar.tick();
    (Object.keys(csvBody[0])).forEach((key) => {
        toReturn[key] = toFetch[key];
    });
    bar.tick();
    res.end(JSON.stringify(toReturn));
});

//GET ATTRIBUTE SPECS:
router.get('/api/fetch-attributes-specs', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    let nummericData = getNumeric.getNumericAttributes(csvBody);
    let nonNummericData = getNumeric.getNonNumericAttributes(csvBody);

    let toFetch = [];
    toFetch = toFetch.concat(exportAttributeSpecs(nummericData, true));
    toFetch.pop(); //<-- remove the last 
    toFetch = toFetch.concat(exportAttributeSpecs(nonNummericData, false));
    toFetch.pop(); //<-- remove the last 

    //Order as the order of original training dataset:
    let toReturn = [];
    let orderedKeyList = (Object.keys(csvBody[0]));
    orderedKeyList.forEach((key) => {
        toFetch.forEach((eachDict) => {
            if (eachDict['name'] === key) {
                toReturn.push(eachDict);
            }
        });
    });

    res.end(JSON.stringify(toReturn));
});

//GET THE CONFUSION MATRIX:
router.get('/api/fetch-confusion-matrix', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(confusionMatrix));
});

//GET THE STATUS
router.get('/api/status', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(generalStatus));
});

//EXPORT THE PROBABILITY LIST:
router.get('/api/fetch-probability', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(probabilityList));
});

//GET THE STATUS
router.get('/api/train', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    let k = req.query.k;
    res.end(JSON.stringify(exportBestModelTrainingSet(csvBody, k, laplace)));
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
    if (isNaN(k)) {
        res.end(JSON.stringify(['Your k is not a valid number, please recheck.']));
        return;
    } else {
        k = Math.floor(k);
        if (k < 1) {
            res.end(JSON.stringify(['Number k must be greater than 1, please recheck.']));
            return;
        }
        if (k > csvBody.length){
            k = csvBody.length;
        }
    }

    //DOING THE K-FOLD-VALIDATION HERE:
    console.log("Doing k-fold with k = " + k);
    var amountOfInstances_eachTestSet = Math.floor(csvBody.length / k);
    var instance_cursor = 0;

    classifiedSet = [];
    probabilityList = [];

    confusionMatrix = buildConfusionMatrix(csvBody);

    let tempTestSet;
    let tempTrainingSet = JSON.parse(JSON.stringify(csvBody));
    let tempTestSetClassified;

    bar = new ProgressBar(':bar', { total: csvBody.length });

    while (instance_cursor < csvBody.length) {

        //Restore the tempTrainingSet to full csvBody:
        tempTrainingSet = JSON.parse(JSON.stringify(csvBody));

        //Make the test set:
        tempTestSet = csvBody.slice(instance_cursor, instance_cursor + amountOfInstances_eachTestSet);

        //Substract the training set based on k-fold validation:
        if (k === 1) {
        } else {
            tempTrainingSet.splice(instance_cursor, amountOfInstances_eachTestSet);
        }

        if (tempTestSet !== []) {
            //Classify:
            tempTestSetClassified = classify(tempTrainingSet, tempTestSet, laplace);
            //Accummulate the Probability:
            probabilityList = probabilityList.concat(exportProbability(tempTrainingSet, tempTestSet, laplace));
            //Update confusion matrix:
            updateConfusionMatrix(tempTestSet, tempTestSetClassified, exportClass(csvBody), confusionMatrix);
        }
        classifiedSet = classifiedSet.concat(tempTestSetClassified);
        instance_cursor += amountOfInstances_eachTestSet;
    }

    correctOrNot = {};
    detailedAccuracy = statistics.getDetailedAccuracyByClass(csvBody, classifiedSet);
    correctOrNot = statistics.calcCorectandIncorrectInstances(csvBody, classifiedSet);

    classifiedSet_plusOriginalClass = appendOriginalClass(classifiedSet, csvBody);

    //adding error estimator here:
    accuracy = correctOrNot.Correct / (correctOrNot.Correct + correctOrNot.Incorrect);

    //calculate the ERROR:
    probabilityList.forEach((each) => {
        //NOTE: each is already absolute
        MAE += each.probabilityError;
        MSE += Math.pow(each.probabilityError, 2);
    });
    MAE = parseFloat((MAE / probabilityList.length).toFixed(3));
    MSE = parseFloat(Math.sqrt(MSE / probabilityList.length).toFixed(3));

    correctOrNot['Mean Absolute Error'] = MAE;
    correctOrNot['Mean Squared Error'] = MSE;
    correctOrNot['Accuracy'] = parseFloat((accuracy * 100).toFixed(2)) + "%";

    let toReturn = {
        first_15rows_results: null,
        correctness: null,
        detailed_accuracy: null,
        confusion_matrix: null,
        status: null,
    };

    //UPDATE GENERAL STATUS:
    generalStatus.tested = true;
    generalStatus.testingDataFileName = generalStatus.trainingDataFilename;
    generalStatus.hasOriginalClass = true;
    if (k === 1) {
        generalStatus.testingMode = 1;
    } else {
        generalStatus.testingMode = 2;
    }

    if (RESULT_TO_ARRAY === true) {
        toReturn.first_15rows_results = toArray_oneDim(classifiedSet_plusOriginalClass.slice(0, 15)); //<-- Getting 15 rows to return to the front-end:
        toReturn.correctness = toArray_oneDim(correctOrNot);
        toReturn.detailed_accuracy = toArray_oneDim(detailedAccuracy);
        toReturn.confusion_matrix = toArray_twoDim(confusionMatrix);
    } else {
        toReturn.first_15rows_results = classifiedSet_plusOriginalClass.slice(0, 15); //<-- Getting 15 rows to return to the front-end:
        toReturn.correctness = correctOrNot;
        toReturn.detailed_accuracy = detailedAccuracy;
        toReturn.confusion_matrix = confusionMatrix;
    }
    toReturn.status = generalStatus;

    res.end(JSON.stringify(toReturn));
});

//RETURN THE CLASSIFIED SET WITH UPLOADED TEST SET:
router.post('/api/test-up', function (req, res, next) {
    console.log("/api/test-up is working.");
    res.setHeader('Content-Type', 'application/json');

    let file = req.files;
    let hasOriginalClass;

    let form = new formidable.IncomingForm();
    let promise;

    form.encoding = "utf-8";
    form.parse(req);

    form.on('fileBegin', function (name, file) {

        let str = __dirname;
        let dir_name = str.substring(0, str.length - 7);

        probabilityList = [];

        file.path = dir_name + "/uploads/" + file.name;

        setTimeout(() => {
            csv()
                .fromFile(file.path)
                .then((jsonObj) => {
                    classifiedSet = [];
                    confusionMatrix = buildConfusionMatrix(csvBody);
                    testSet = JSON.parse(JSON.stringify(jsonObj));

                    hasOriginalClass = hasOriginalClassBefore(testSet, exportClass(csvBody));

                    classifiedSet = classify(csvBody, testSet, laplace);
                    classifiedSet_plusOriginalClass = appendOriginalClass(classifiedSet, testSet);
                    probabilityList = exportProbability(csvBody, testSet, laplace);

                    correctOrNot = {};
                    detailedAccuracy = statistics.getDetailedAccuracyByClass(testSet, classifiedSet);
                    correctOrNot = statistics.calcCorectandIncorrectInstances(testSet, classifiedSet);

                    //adding error estimator here:
                    accuracy = correctOrNot.Correct / (correctOrNot.Correct + correctOrNot.Incorrect);

                    //calculate the ERROR:
                    probabilityList.forEach((each) => {
                        //NOTE: each is already absolute
                        MAE += each.probabilityError;
                        MSE += Math.pow(each.probabilityError, 2);
                    });
                    MAE = parseFloat((MAE / probabilityList.length).toFixed(3));
                    MSE = parseFloat(Math.sqrt(MSE / probabilityList.length).toFixed(3));

                    correctOrNot['Mean Absolute Error'] = MAE;
                    correctOrNot['Mean Squared Error'] = MSE;
                    correctOrNot['Accuracy'] = parseFloat((accuracy * 100).toFixed(2)) + "%";

                    updateConfusionMatrix(testSet, classifiedSet, exportClass(csvBody), confusionMatrix);

                    let toReturn = {
                        first_15rows_results: null,
                        correctness: null,
                        detailed_accuracy: null,
                        confusion_matrix: null,
                        status: null
                    };

                    //UPDATE GENERAL STATUS:
                    generalStatus.tested = true;
                    generalStatus.testingMode = 3;
                    generalStatus.testingDataFileName = file.name;

                    if (testSet[0][exportClass(csvBody)] === null || testSet[0][exportClass(csvBody)].trim() === "") {
                        hasOriginalClass = false;
                    } else {
                        hasOriginalClass = true;
                    }
                    generalStatus.hasOriginalClass = hasOriginalClass;

                    if (RESULT_TO_ARRAY === true) {
                        toReturn.first_15rows_results = toArray_oneDim(classifiedSet_plusOriginalClass.slice(0, 15)); //<-- Getting 15 rows to return to the front-end:
                        toReturn.correctness = toArray_oneDim(correctOrNot);
                        toReturn.detailed_accuracy = toArray_oneDim(detailedAccuracy);
                        toReturn.confusion_matrix = toArray_twoDim(confusionMatrix);
                    }
                    else {
                        toReturn.first_15rows_results = classifiedSet_plusOriginalClass.slice(0, 15); //<-- Getting 15 rows to return to the front-end:
                        toReturn.correctness = correctOrNot;
                        toReturn.detailed_accuracy = detailedAccuracy;
                        toReturn.confusion_matrix = confusionMatrix;
                    }
                    toReturn.status = generalStatus;

                    res.status(202).end(JSON.stringify(toReturn));
                })
                .then(() => {
                    console.log("api/test-up OK");
                }
                );
        }, 500);
    });
});

//RETURN THE CLASSIFIED SET WITH UPLOADED TEST SET:
router.post('/api/evaluate', function (req, res, next) {
    console.log("/api/evaluate is working.");
    res.setHeader('Content-Type', 'application/json');

    let testdata = req.query.testdata;

    probabilityList = [];
    classifiedSet = [];
    confusionMatrix = buildConfusionMatrix(csvBody);
    testdata = JSON.parse((testdata));
    testdata.push("");

    testSet = [{}];
    let n =0;
    (Object.keys(csvBody[0])).forEach((aKey)=>{
        testSet[0][aKey] = null;
        testSet[0][aKey] = testdata[n];
        n++;
    });

    classifiedSet = classify(csvBody, testSet, laplace);
    let toReturn = classifiedSet[0][exportClass(csvBody)];

    res.status(202).end((toReturn));
});

//DOWNLOAD THE CLASSIFIED SET:
router.get('/api/download-classified', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    let toWriteToCSV = { "rows": [] };
    let file = './classified_csv/classified.csv';
    toWriteToCSV.rows = classifiedSet;

    let json2csvCallback = function (err, csv) {
        if (err) throw err;
        fs.writeFile(file, csv, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured: file either not saved or corrupted.');
            } else {
                console.log('It\'s saved!');
                res.download(file);
            }
        });
    };

    converter.json2csv(toWriteToCSV.rows, json2csvCallback, {
        prependHeader: true
    });;
});

//WHEN USER UPLOADS A CSV FILE
router.post('/submit-form', (req, res, next) => {

    var form = new formidable.IncomingForm();

    form.encoding = "utf-8";
    form.parse(req);

    form.on('fileBegin', function (name, file) {

        var str = __dirname;
        var dir_name = str.substring(0, str.length - 7);

        file.path = dir_name + "/uploads/" + file.name;
        trainingDataFilename = file.name;

        setTimeout(() => {
            csv()
                .fromFile(file.path)
                .then((jsonObj) => {

                    //THIS IS THE MAIN AND RAW CSV CONTENT THAT NEED TO BE PROCESSED:
                    testSet = JSON.parse(JSON.stringify(jsonObj));
                    csvBody = JSON.parse(JSON.stringify(jsonObj));

                    //get only numeric cols: --> this will return a JSON:
                    csvBodyNumeric = getNumeric.getNumericAttributes(csvBody);
                    csvBodyNumericNormalised = getNumeric.getNumericAttributesNormalised(csvBody);

                    //UPDATE GENERAL STATUS:
                    generalStatus.trainingDataUploaded = true;
                    generalStatus.trainingDataFilename = trainingDataFilename;
                    generalStatus.tested = false;
                    generalStatus.testingMode = 0;

                    res.status(201).send();

                })
                .then(() => {
                    console.log("Rendered OK");
                }
                );
        }, 50);
    });
});

module.exports = { router: router, csvBody: "OK" };

//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------

//SELECT THE BEST TRAINING DATASET:
const appendOriginalClass = function (classifiedSet, trainingSet) {
    let classCol = exportClass(trainingSet);
    let classWholeList = [];
    let attrList = Object.keys(trainingSet[0]); //<- This one is not including the CLASS col
    attrList.pop();
    trainingSet.forEach((eachDict) => {
        classWholeList.push(eachDict[classCol]);
    });
    let newStructure = {};
    let toReturn = [];
    newStructure['OriginalClass'] = null;
    newStructure['ClassifiedClass'] = null;
    classifiedSet.forEach((eachDict) => {
        newStructure = {};
        attrList.forEach((attr) => {
            newStructure[attr] = eachDict[attr];
        });
        newStructure['OriginalClass'] = null;
        newStructure['ClassifiedClass'] = eachDict[classCol];
        toReturn.push(newStructure);
    });
    for (i = 0; i < classifiedSet.length; i++) {
        toReturn[i]['OriginalClass'] = trainingSet[i][classCol];
    }
    return toReturn;
}

const exportBestModelTrainingSet = function (OriginalSet, number_k, laplace) {

    let originalSet = JSON.parse(JSON.stringify(OriginalSet));

    let amountOfInstances_eachTestSet;
    let instance_cursor;
    let correctOrNot;
    let accuracy;
    let accuracyTable = {};
    let classifiedSet = [];

    let tempTestSet;
    let tempTrainingSet = JSON.parse(JSON.stringify(originalSet));
    let tempTestSetClassified;

    let k = 1;

    while (k <= number_k) {
        amountOfInstances_eachTestSet = Math.floor(originalSet.length / k);
        accuracyTable["k=" + k] = {};
        instance_cursor = 0;
        while (instance_cursor < originalSet.length) {

            //Restore the tempTrainingSet to full originalSet:
            tempTrainingSet = JSON.parse(JSON.stringify(originalSet));

            //Make the test set:
            tempTestSet = originalSet.slice(instance_cursor, instance_cursor + amountOfInstances_eachTestSet);

            //Substract the training set based on k-fold validation:
            if (k === 1) {
            } else {
                tempTrainingSet.splice(instance_cursor, amountOfInstances_eachTestSet);
            }
            if (tempTestSet !== []) {
                tempTestSetClassified = classify(tempTrainingSet, tempTestSet, laplace);
            }
            correctOrNot = statistics.calcCorectandIncorrectInstances(tempTestSet, tempTestSetClassified);
            accuracy = correctOrNot.Correct / (correctOrNot.Correct + correctOrNot.Incorrect);
            accuracyTable["k=" + k]["fold-" + instance_cursor] = accuracy;

            instance_cursor += amountOfInstances_eachTestSet;
        }
        k++;
    }

    let aDict_per_k;
    let selectionInfo = {
        k: null,
        fold_to_remove: null
    }
    let max = 0;

    //Select the maximum number:
    (Object.keys(accuracyTable)).forEach((k_value) => {
        aDict_per_k = accuracyTable[k_value];
        (Object.keys(aDict_per_k)).forEach((fold_Value) => {
            if (aDict_per_k[fold_Value] > max) {
                max = aDict_per_k[fold_Value];
                selectionInfo.k = k_value.slice(2);
                selectionInfo.fold_to_remove = fold_Value.slice(5);
            }
        });
    });

    //Conduct slicing the original data to have the best traing set:
    originalSet.splice(selectionInfo.k * Math.floor(originalSet.length / k), Math.floor(originalSet.length / k));
    return accuracyTable;
}

//UPDATE THE CONTINGENCY TABLE:
const updateConfusionMatrix = function (OriginalSet, ClassifiedSet, classAttribute, ConfusionMatrixTemplate) {
    //!\The test set and the classified set must have the same number of rows
    //classAttribute will be 'y'
    //This function will use the available labels in ConfusionMatrixTemplate as classifier outcome to calculate:

    let classList = [];

    let originalData = JSON.parse(JSON.stringify(OriginalSet));
    let classifiedData = JSON.parse(JSON.stringify(ClassifiedSet));

    classList = (Object.keys(ConfusionMatrixTemplate));

    let length_to_test = ClassifiedSet.length;

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

//Function build confusion matrix:
const exportAttributeSpecs = function (Data, isNumeric) {
    let eachSpec = {};
    let toReturn = [];
    let floatList = [];
    let classifierOutcomeList = [];
    let colNames = Object.keys(Data[0]);
    colNames.forEach((finalColName) => {
        eachSpec = {};
        floatList = [];
        classifierOutcomeList = [];
        eachSpec['name'] = finalColName;
        Data.forEach((element) => {
            classifierOutcome = element[finalColName];
            classifierOutcomeList.push(classifierOutcome);
            classifierOutcomeList = [...new Set(classifierOutcomeList)];
            floatList.push(isFloatorInt(classifierOutcome));
        });
        if (isNumeric === true) {
            eachSpec['numerical'] = true;
            if (checkTypeInArray(floatList) === 'float') {
                eachSpec['float'] = true;
            } else {
                eachSpec['float'] = false;
            }
        } else {
            eachSpec['numerical'] = false;
            eachSpec['options'] = classifierOutcomeList;
        }
        toReturn.push(eachSpec);
    });
    return toReturn;
}

const checkTypeInArray = function (typeList) {
    checkType = '';
    typeList.forEach((aType) => {
        if (aType === "string") {
            return 'string';
        } else {
            if (aType === "integer") {
                checkType = 'integer';
            } else if (aType === "float") {
                checkType = 'float';
                return 'float';
            }
        }
    });
    return checkType;
}

const isFloatorInt = function (val) {
    theNum = 0;
    if (isNaN(val) === true) {
        return "string"
    } else { //<-- if it IS A NUMBER:
        theNum = Number(val);
        if (Number.isInteger(theNum) === true) {
            return "integer";
        } else {
            if (isFloat(theNum) === true) {
                return "float";
            } else {
                return 'unknown';
            }
        }

    }
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

const buildConfusionMatrix = function (Data) {
    let data = JSON.parse(JSON.stringify(Data));
    let classCol = exportClass(data);
    let classList = [];
    let confusion_table = {};
    data.forEach((dict) => {
        classList.push(dict[classCol])
    });
    classList = [...new Set(classList)];
    classList.forEach((actualClass) => {
        confusion_table[actualClass] = {}
        classList.forEach((predictedsClass) => {
            confusion_table[actualClass][predictedsClass] = 0;
        });
    });
    return confusion_table;
};

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
const getKappa = function (confusionMatrix) {
    let accurrateClassified = 0;

    let TP, TN, FP, FN;
    let classes = [];

    (Object.keys(confusionMatrix)).forEach((eachKey) => {
        accurrateClassified += confusionMatrix[eachKey][eachKey];
        TP;
    });
};

const getGeneralCount = function (data, isNumeric) {

    var evidenceList = {};

    var Data = JSON.parse(JSON.stringify(data));
    var keysOfData = Object.keys(Data[0]);

    var evidenceAttributeList = {};
    var anEvidenceAttribute = "";
    var value;

    let valuesByClass = {};
    let rawList = [];

    let labels = [];
    let values = [];
    let rawClassList = [];
    let classes = [];
    let eachClass = {};
    let tempEvidenceAttributeList = {};

    let classCol = exportClass(Data);
    let classifierOutcomeList = exportClassifierOutcomeList(Data);
    classifierOutcomeList = [...new Set(classifierOutcomeList)];

    Data.forEach((aDict) => {
        rawClassList.push(aDict[classCol]);
    });

    if (isNumeric === true) {
        keysOfData.pop();
    }

    keysOfData.forEach((aKey) => {
        evidenceAttributeList = {};
        Data.forEach((element) => {
            anEvidenceAttribute = (element[aKey]);
            evidenceAttributeList[anEvidenceAttribute] = "";

            value = 0;
            valuesByClass = {};
            classifierOutcomeList.forEach((aClass) => {
                value += (InstanceofFrequency(Data, aKey, anEvidenceAttribute, classCol, aClass, false));
            });

            evidenceAttributeList[anEvidenceAttribute] = value;
        });
        labels = Object.keys(evidenceAttributeList);
        values = Object.values(evidenceAttributeList);

        evidenceAttributeList = {};
        classes = [];
        eachClass = {
            name: null,
            values: null,
        };

        //Export the statistics by class 'yes' or 'no':
        if (isNumeric === false) {
            //Get the 'All' first:
            evidenceAttributeList['labels'] = labels;
            eachClass.name = 'All';
            eachClass.values = values;
            classes.push(eachClass);
            tempEvidenceAttributeList = {};

            //Get for each class:
            classifierOutcomeList.forEach((aClass) => {
                eachClass = {};
                //isNumeric to use in the next line is always FALSE:
                tempEvidenceAttributeList[aClass] = gatherDataForEvidence(Data, aKey, false, false);
                valuesByClass[aClass] = [];
                (Object.keys(tempEvidenceAttributeList[aClass])).forEach((aKey) => {
                    valuesByClass[aClass].push(tempEvidenceAttributeList[aClass][aKey][aClass]);
                });
                valuesByClass[aClass].pop();
                eachClass['name'] = aClass;
                eachClass['values'] = valuesByClass[aClass];
                classes.push(eachClass);
            });
        } else {
            //Get the 'All' first:
            rawList = [];
            Data.forEach((eachDict) => {
                rawList.push(eachDict[aKey]);
            });
            eachClass['name'] = 'All';
            eachClass['values'] = rawList;
            classes.push(eachClass);

            //Get for each class:
            valuesByClass = {};
            classifierOutcomeList.forEach((aClass) => {
                valuesByClass[aClass] = [];
            });
            for (n = 0; n < rawList.length; n++) {
                classifierOutcomeList.forEach((aClass) => {
                    if (rawClassList[n] === aClass) {
                        valuesByClass[aClass].push(rawList[n]);
                    };
                });
            };
            classifierOutcomeList.forEach((aClass) => {
                eachClass = {};
                eachClass['name'] = aClass;
                eachClass['values'] = valuesByClass[aClass];
                classes.push(eachClass);
            });
        }

        evidenceAttributeList['classes'] = classes;

        //Export the table for showing next to be chart:
        evidenceAttributeList['table'] = toArray_twoDim(gatherDataForEvidence(Data, aKey, isNumeric, false));

        evidenceList[aKey] = evidenceAttributeList;
    });

    return evidenceList;
};

const exportClass = function (Data) {
    var finalColName = Object.keys(Data[0])[Object.keys(Data[0]).length - 1];
    return finalColName;
};

const exportClassifierOutcomeList = function (Data) {
    var finalColName = Object.keys(Data[0])[Object.keys(Data[0]).length - 1];
    var classifierOutcomeList = [];
    Data.forEach((element) => {
        classifierOutcome = element[finalColName];
        classifierOutcomeList.push(classifierOutcome);
    });
    return classifierOutcomeList;
};

const gatherDataForEvidence = function (data, key, isNumeric, laplace) {
    var Data = JSON.parse(JSON.stringify(data));
    var evidenceList = {};
    var evidenceAttributeList = {};
    var anEvidenceAttribute = "";
    let aKey = key;
    var value;
    let count = {};

    let classCol = exportClass(Data);
    let classifierOutcomeList = exportClassifierOutcomeList(Data);
    classifierOutcomeList = [...new Set(classifierOutcomeList)];

    evidenceAttributeList = {};
    Data.forEach((element) => {
        anEvidenceAttribute = (element[aKey]);
        evidenceAttributeList[anEvidenceAttribute] = "";

        value = {};
        classifierOutcomeList.forEach((aClass) => {
            value[aClass] = (InstanceofFrequency(Data, aKey, anEvidenceAttribute, classCol, aClass, laplace));
        });
        evidenceAttributeList[anEvidenceAttribute] = value;
    });
    classifierOutcomeList.forEach((aClass) => {
        count[aClass] = ProbalityDenominator(Data, aKey, classCol, aClass, laplace);
    });
    evidenceAttributeList['count'] = count;
    evidenceList = evidenceAttributeList;

    //Handling if the return contains only numeric:
    if (isNumeric === true) {
        let min, max, mean, stddev;

        evidenceList = {};

        evidenceList.min = {};
        evidenceList.max = {};
        evidenceList.mean = {};
        evidenceList.stddev = {};
        evidenceList['count'] = {};

        classifierOutcomeList.forEach((aClass) => {
            mean = getMeanIf(Data, key, classCol, aClass);
            stddev = getStdDeviationIf(Data, key, classCol, aClass);
            min = getMinMaxIf('min', Data, key, classCol, aClass);
            max = getMinMaxIf('max', Data, key, classCol, aClass);

            evidenceList.min[aClass] = parseFloat(min.toFixed(2));
            evidenceList.max[aClass] = parseFloat(max.toFixed(2));
            evidenceList.mean[aClass] = parseFloat(mean.toFixed(2));
            evidenceList.stddev[aClass] = parseFloat(stddev.toFixed(2));

            count[aClass] = ProbalityDenominator(Data, aKey, classCol, aClass, laplace);
            evidenceList['count'][aClass] = count[aClass];
        })
    }

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

//Get mean and standard deviation:
var getMean = function (Data, Attribute_Need_To_findMean) {
    var data = JSON.parse(JSON.stringify(Data));
    var sumAll = 0;
    var n = 0;
    data.forEach((aDict) => {
        sumAll += parseFloat(aDict[Attribute_Need_To_findMean]);
        n++;
    });
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

//Get mean and standard deviation WITH CONDITION:
var getMeanIf = function (Data, Attribute_Need_To_findMean, classCol, class_to_findMean) {
    var data = JSON.parse(JSON.stringify(Data));
    var sumAll = 0;
    var n = 0;
    data.forEach((aDict) => {
        if (aDict[classCol] === class_to_findMean) {
            sumAll += parseFloat(aDict[Attribute_Need_To_findMean]);
            n++;
        }
    });
    return (sumAll / n);
};

var getMinMaxIf = function (MinOrMax, Data, Attribute_Need_To_findMean, classCol, class_to_findMean) {
    var data = JSON.parse(JSON.stringify(Data));
    var sumAll = [];
    var n = 0;
    data.forEach((aDict) => {
        if (aDict[classCol] === class_to_findMean) {
            sumAll.push(parseFloat(aDict[Attribute_Need_To_findMean]));
            n++;
        }
    });
    let toReturn;
    if (MinOrMax === "min") {
        toReturn = Math.min.apply(null, sumAll);
    } else {
        toReturn = Math.max.apply(null, sumAll);
    }
    return toReturn;
};

var getStdDeviationIf = function (Data, Attribute_Need_To_findStdDev, classCol, class_to_findStdDev) {
    var numeratorOfStdDev = 0;
    var mean = getMeanIf(Data, Attribute_Need_To_findStdDev, classCol, class_to_findStdDev);
    var x;
    var data = JSON.parse(JSON.stringify(Data));
    var n = 0;

    data.forEach((aDict) => {
        if (aDict[classCol] === class_to_findStdDev) {
            x = aDict[Attribute_Need_To_findStdDev];
            numeratorOfStdDev += Math.abs(Math.pow((x - mean), 2));
            n++;
        }
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

        if (isNaN(evidenceAttribute_value) === false &
            isNaN(parseInt(evidenceAttribute_value)) === false &&
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


//------------------------------------------------------------------------------------------------

//Using the training data set to test:
var classify = function (Data, TestSet, laplace) {
    var originData = JSON.parse(JSON.stringify(Data));

    var toReturn = JSON.parse(JSON.stringify(TestSet));

    var attributeList = Object.keys(toReturn[0]);
    var classAttr = attributeList[attributeList.length - 1];
    var classList = [];

    originData.forEach((dict) => {
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
        //Assign new class:
        toReturn[n][classAttr] = theHighestProbability_class;
        bar.tick();
        n++;
    });
    return toReturn;
};

//Classify exporting the probability list:
//Using the training data set to test:
const exportProbability = function (Data, TestSet, laplace) {
    var originData = JSON.parse(JSON.stringify(Data));
    var toReturn = JSON.parse(JSON.stringify(TestSet));

    let toExport = [];

    let error;
    let originalClass;

    let probabilityList = {};

    var attributeList = Object.keys(toReturn[0]);
    var classAttr = attributeList[attributeList.length - 1];
    var classList = [];

    originData.forEach((dict) => {
        classList.push(dict[classAttr])
    });
    classList = [...new Set(classList)];

    var results = [];
    var sum_likelihood = 0;
    var theHighestProbability = 0;
    var theHighestProbability_class = ''; //the class (yes or no) in order to assign to the class.

    //Classify each row of data set:
    let n = 0;
    let j = 0;

    toReturn.forEach((dict) => {
        results = [];
        sum_likelihood = 0;

        probabilityList = {
            instanceNo: null,
            originalClass: null,
            classifiedClass: null,
            probabilityError: null
        };

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

        //Reserve the original class:
        originalClass = toReturn[n][classAttr];
        //Assign new class:
        toReturn[n][classAttr] = theHighestProbability_class;

        //Calc the error rate:
        if (originalClass === null || originalClass.trim() === "") {
            error = 0;
        } else {
            if (originalClass !== theHighestProbability_class) {
                error = theHighestProbability;
            } else {
                error = 1 - theHighestProbability;
            }
        };

        probabilityList.instanceNo = n;
        probabilityList.classifiedClass = theHighestProbability_class;
        probabilityList.originalClass = originalClass;
        probabilityList.probabilityError = error;

        toExport.push(probabilityList);

        n++;
    });
    return toExport;
};

//------------------------------------------------------------------------------------------------

//Check if the testset uploaded has some class before or not:
const hasOriginalClassBefore = function (TestSet, classColName) {
    let data = JSON.parse(JSON.stringify(TestSet));
    let toReturn = null;
    if (data[0][classColName] === null || data[0][classColName].trim() === "") {
        toReturn = false;
    } else {
        toReturn = true;
    }
};

//Convert Dictionary to arrays:
const toArray_oneDim = function (Data) {
    let data = JSON.parse(JSON.stringify(Data));
    let toReturn = [];

    if (isDict(data) == false) {
        toReturn.push(Object.keys(data[0]));
        //Getting the contents:
        data.forEach((each) => {
            toReturn.push(Object.values(each));
        });
    } else {
        toReturn.push(Object.keys(data));
        toReturn.push(Object.values(data));
    }
    return toReturn;
};

const isDict = function (v) {
    return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

//The following 'twoDim' take the outter dict as row beginner, and inner dict as column header:
const toArray_twoDim = function (dict) {
    let data = JSON.parse(JSON.stringify(dict));
    let toReturn = [];
    let headers_X = [""];
    let eachRow = [];

    //Getting the header X:
    Object.keys(data).forEach((aKey) => {
        Object.keys(data[aKey]).forEach((aDict) => {
            headers_X.push(aDict);
        });
    });
    headers_X = [...new Set(headers_X)];
    toReturn.push(headers_X);

    //Getting each row to whole:
    Object.keys(data).forEach((aKey) => {
        eachRow = [];
        eachRow.push(aKey);
        Object.values(data[aKey]).forEach((aValue) => {
            eachRow.push(aValue);
        });
        toReturn.push(eachRow);
    });
    return toReturn;
};
