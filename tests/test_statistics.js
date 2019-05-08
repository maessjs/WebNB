var originalData = [
    {
        "job": "unemployed",
        "marital": "married",
        "education": "primary",
        "default": "no",
        "housing": "no",
        "loan": "no",
        "contact": "cellular",
        "month": "oct",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "services",
        "marital": "married",
        "education": "secondary",
        "default": "no",
        "housing": "yes",
        "loan": "yes",
        "contact": "cellular",
        "month": "may",
        "poutcome": "failure",
        "y": "no"
    },
    {
        "job": "management",
        "marital": "single",
        "education": "tertiary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "cellular",
        "month": "apr",
        "poutcome": "failure",
        "y": "no"
    },
    {
        "job": "management",
        "marital": "married",
        "education": "tertiary",
        "default": "no",
        "housing": "yes",
        "loan": "yes",
        "contact": "unknown",
        "month": "jun",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "blue-collar",
        "marital": "married",
        "education": "secondary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "unknown",
        "month": "may",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "management",
        "marital": "single",
        "education": "tertiary",
        "default": "no",
        "housing": "no",
        "loan": "no",
        "contact": "cellular",
        "month": "feb",
        "poutcome": "failure",
        "y": "yes"
    },
    {
        "job": "self-employed",
        "marital": "married",
        "education": "tertiary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "cellular",
        "month": "may",
        "poutcome": "other",
        "y": "yes"
    },
    {
        "job": "technician",
        "marital": "married",
        "education": "secondary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "cellular",
        "month": "may",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "entrepreneur",
        "marital": "married",
        "education": "tertiary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "unknown",
        "month": "may",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "services",
        "marital": "married",
        "education": "primary",
        "default": "no",
        "housing": "yes",
        "loan": "yes",
        "contact": "cellular",
        "month": "apr",
        "poutcome": "failure",
        "y": "no"
    },
    {
        "job": "services",
        "marital": "married",
        "education": "secondary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "unknown",
        "month": "may",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "admin.",
        "marital": "married",
        "education": "secondary",
        "default": "no",
        "housing": "yes",
        "loan": "no",
        "contact": "cellular",
        "month": "apr",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "technician",
        "marital": "married",
        "education": "tertiary",
        "default": "no",
        "housing": "no",
        "loan": "no",
        "contact": "cellular",
        "month": "aug",
        "poutcome": "unknown",
        "y": "no"
    },
    {
        "job": "student",
        "marital": "single",
        "education": "secondary",
        "default": "no",
        "housing": "no",
        "loan": "no",
        "contact": "cellular",
        "month": "apr",
        "poutcome": "unknown",
        "y": "yes"
    }
];

var classifiedData = [
    {
    "job": "unemployed",
    "marital": "married",
    "education": "primary",
    "default": "no",
    "housing": "no",
    "loan": "no",
    "contact": "cellular",
    "month": "oct",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "services",
    "marital": "married",
    "education": "secondary",
    "default": "no",
    "housing": "yes",
    "loan": "yes",
    "contact": "cellular",
    "month": "may",
    "poutcome": "failure",
    "y": "no"
}, {
    "job": "management",
    "marital": "single",
    "education": "tertiary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "cellular",
    "month": "apr",
    "poutcome": "failure",
    "y": "yes"
}, {
    "job": "management",
    "marital": "married",
    "education": "tertiary",
    "default": "no",
    "housing": "yes",
    "loan": "yes",
    "contact": "unknown",
    "month": "jun",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "blue-collar",
    "marital": "married",
    "education": "secondary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "unknown",
    "month": "may",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "management",
    "marital": "single",
    "education": "tertiary",
    "default": "no",
    "housing": "no",
    "loan": "no",
    "contact": "cellular",
    "month": "feb",
    "poutcome": "failure",
    "y": "yes"
}, {
    "job": "self-employed",
    "marital": "married",
    "education": "tertiary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "cellular",
    "month": "may",
    "poutcome": "other",
    "y": "yes"
}, {
    "job": "technician",
    "marital": "married",
    "education": "secondary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "cellular",
    "month": "may",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "entrepreneur",
    "marital": "married",
    "education": "tertiary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "unknown",
    "month": "may",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "services",
    "marital": "married",
    "education": "primary",
    "default": "no",
    "housing": "yes",
    "loan": "yes",
    "contact": "cellular",
    "month": "apr",
    "poutcome": "failure",
    "y": "no"
}, {
    "job": "services",
    "marital": "married",
    "education": "secondary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "unknown",
    "month": "may",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "admin.",
    "marital": "married",
    "education": "secondary",
    "default": "no",
    "housing": "yes",
    "loan": "no",
    "contact": "cellular",
    "month": "apr",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "technician",
    "marital": "married",
    "education": "tertiary",
    "default": "no",
    "housing": "no",
    "loan": "no",
    "contact": "cellular",
    "month": "aug",
    "poutcome": "unknown",
    "y": "no"
}, {
    "job": "student",
    "marital": "single",
    "education": "secondary",
    "default": "no",
    "housing": "no",
    "loan": "no",
    "contact": "cellular",
    "month": "apr",
    "poutcome": "unknown",
    "y": "yes"
}
];

var calcCorectandIncorrectInstances = function (originalData, classifiedData) {
    //the class will be understood as the very last column

    var toReturn = {
        'Correct': 0,
        'Incorrect': 0
    };

    var originalAttributeList = Object.keys(originalData[1]);
    var classifiedAttributeList = Object.keys(classifiedData[1]);

    console.log(originalAttributeList);
    console.log(classifiedAttributeList);

    var originClassAttr = originalAttributeList[originalAttributeList.length - 1];
    var classifiedClassAttr = classifiedAttributeList[classifiedAttributeList.length - 1];

    var originalOne = {};
    var classifiedOne = {};

    //var i = 0;
    for (var i = 0; i < originalData.length; i++) {
        console.log(i);

        if (originalData[i]["y"] === classifiedData[i]["y"]) {
            toReturn.Correct++;
        } else {
            toReturn.Incorrect++;
        }
    }
    //console.log(toReturn);
    return toReturn;
};


//Calculate : TP Rate  FP Rate  Precision  Recall :
var getDetailedAccuracyByClass = function (originalData, classifiedData) {
    var detailedAccuracyByClass = [
        {
            'class_name': 'Weighted Average',
            'TP_Rate': 0,
            'FP_Rate': 0,
            'TN_Rate': 0,
            'FN_Rate': 0,
            'Precision': 0,
            'Recall': 0,
            'Sensitivity': 0,
            'Specificity': 0
        }
    ];

    var TP_Rate = 0;
    var FP_Rate = 0;
    var Precision = 0;
    var Recall = 0;
    var Sensitivity = 0;
    var Specificity = 0;

    //Make again a classlist:
    var toReturn = {
        'Correct': 0,
        'Incorrect': 0
    };

    var originalAttributeList = Object.keys(originalData[1]);
    var classifiedAttributeList = Object.keys(classifiedData[1]);

    console.log(originalAttributeList);
    console.log(classifiedAttributeList);

    var originClassAttr = originalAttributeList[originalAttributeList.length - 1]; //y
    var classifiedClassAttr = classifiedAttributeList[classifiedAttributeList.length - 1]; //y

    var classList = [];
    originalData.forEach((dict) => {
        classList.push(dict[originClassAttr])
    });
    classList = [...new Set(classList)];
    console.log(classList);

    var compar = false;
    var countOriginal;
    var countClassified;

    var currentDict;

    classList.forEach((aClass) => {
        var m;
        currentDict = {
            'class_name': aClass,
            'TP_Rate': 0,
            'FP_Rate': 0,
            'TN_Rate': 0,
            'FN_Rate': 0,
            'Precision': 0,
            'Recall': 0,
            'Sensitivity': 0,
            'Specificity': 0
        };

        //Getting TP Rate:
        for (m = 0; m < originalData.length; m++) {
            if (originalData[m][originClassAttr] === aClass
                && classifiedData[m][originClassAttr] === aClass) {
                currentDict['TP_Rate']++;
            }
        }

        //Getting FP Rate:
        for (m = 0; m < originalData.length; m++) {
            if (originalData[m][originClassAttr] !== aClass
                && classifiedData[m][originClassAttr] === aClass) {
                currentDict['FP_Rate']++;
            }
        }

        //Getting FN Rate:
        for (m = 0; m < originalData.length; m++) {
            if (originalData[m][originClassAttr] === aClass
                && classifiedData[m][originClassAttr] !== aClass) {
                currentDict['FN_Rate']++;
            }
        }

        //Getting TN Rate:
        for (m = 0; m < originalData.length; m++) {
            if (originalData[m][originClassAttr] !== aClass
                && classifiedData[m][originClassAttr] !== aClass) {
                currentDict['TN_Rate']++;
            }
        }

        //Getting Sensitivity:
        currentDict['Sensitivity']
            = currentDict['TP_Rate'] / (currentDict['TP_Rate'] + currentDict['FN_Rate']);
        currentDict['Sensitivity'] = Math.round(currentDict['Sensitivity'] * 100) / 100;

        currentDict['Specificity']
            = currentDict['TN_Rate'] / (currentDict['FP_Rate'] + currentDict['TN_Rate']);
        currentDict['Specificity'] = Math.round(currentDict['Specificity'] * 100) / 100;

        currentDict['Recall']
            = currentDict['TP_Rate'] / (currentDict['TP_Rate'] + currentDict['FN_Rate']);
        currentDict['Recall'] = Math.round(currentDict['Recall'] * 100) / 100;

        currentDict['Precision']
            = currentDict['TP_Rate'] / (currentDict['TP_Rate'] + currentDict['FP_Rate']);
        currentDict['Precision'] = Math.round(currentDict['Precision'] * 100) / 100;

        detailedAccuracyByClass.push(currentDict);
    });
    return detailedAccuracyByClass;
};

var detailed = getDetailedAccuracyByClass(originalData, classifiedData);
var correctness = calcCorectandIncorrectInstances(originalData, classifiedData);
//console.log(detailed);
//console.log(correctness);