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

console.log(originalData);

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
        //console.log(evidenceAttribute_List);
    });

    evidenceAttribute_List.forEach(function (element) {
        instanceofFrequency = InstanceofFrequency(Data, Evidence, element, Class, ClassifierOutcome, laplace);
        count = count + instanceofFrequency;
        instanceofFrequency = 0;
    });
    return count;
};

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

var getLikelihood_entire = function (Data, laplace) {
    var toReturn = JSON.parse(JSON.stringify(Data));
    var attributeList = Object.keys(toReturn[1]);
    var classAttr = attributeList[attributeList.length - 1];
    var classList = [];
    toReturn.forEach((dict) => {
        classList.push(dict[classAttr])
    });
    classList = [...new Set(classList)];
    console.log(classList);

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
                'normalised_probability': 0
            });
        });

        results.forEach((eachResult) => {
            sum_likelihood += eachResult.likelihood;
        });

        //Get normalised probability:
        j = 0;
        results.forEach((result) => {

           // console.log(results[j]);
            results[j].normalised_probability = (result.likelihood / sum_likelihood);

            //console.log("Did: " + result.likelihood + "/" + sum_likelihood + " --> " + result.likelihood / sum_likelihood);
            //console.log("Sum is still " + sum_likelihood);
            j = j+ 1;

        });

        console.log(results);
        //Get the highest probability:
        theHighestProbability = 0;
        results.forEach((each) => {
            if (each.normalised_probability > theHighestProbability) {
                theHighestProbability = each.normalised_probability;
                theHighestProbability_class = each.class_name;
            }
        });
        console.log("Therefore the highest is " + theHighestProbability_class + " - " +theHighestProbability + "\n\n");

        //console.log(results);
        //.log("The highest is :" + theHighestProbability_class);
        toReturn[n][classAttr] = theHighestProbability_class;
        n++;
    });
    return toReturn;
};

var tested = getLikelihood_entire(originalData, true);
console.log(originalData);
console.log("This is tested: " + tested);