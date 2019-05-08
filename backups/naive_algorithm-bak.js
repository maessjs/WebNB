var data = [{
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
},

    {
        job: 'services',
        marital: 'married',
        education: 'secondary',
        default: 'no',
        housing: 'yes',
        loan: 'yes',
        contact: 'cellular',
        month: 'may',
        poutcome: 'failure',
        y: 'no'
    }];


/*
Notes:
- Data : entire JSON object;
- Evidence: job, maritual, education, ...
- Evidence Attribite: ex: Evidence Attribute of job = 'unemployed', 'services', ...
- Class: y
- ClassiferOutcome: yes or no

LAPLACE ESTIMATOR will be automatically used in all following functions.

*/
//module.exports = {

    var InstanceofFrequency = function (Data, Evidence, EvidenceAttribute, Class, ClassifierOutcome, laplace) {
        var count = 0;
        Data.forEach(function (element) {
            if (element[Evidence] == EvidenceAttribute && element[Class] == ClassifierOutcome) {
                count++;
            }
        });
        //Applying La Place:
        if (laplace == true){
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

var list_to_test_wo_class = {
    job: 'unemployed',
    marital: 'married',
    education: 'primary',
    default: 'no',
    housing: 'no',
    loan: 'no',
    contact: 'cellular',
    month: 'oct',
    poutcome: 'unknown'
};
//THE LAPLACE will applied in this function:
var getLikelihood = function (Data, Class, ClassifierOutcome, EvidenceAttributeList) {
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
            console.log(countClass);
        }
    });

    for (attribute in EvidenceAttributeList) {
        evidenceAttribute_value = EvidenceAttributeList[attribute];

        numerator = InstanceofFrequency(Data, attribute, evidenceAttribute_value, Class, ClassifierOutcome);
        probalityDenominator = ProbalityDenominator(Data, attribute, Class, ClassifierOutcome);


        finalLikelihood = numerator / probalityDenominator;

        //console.log(finalLikelihood);
        total_finalLikelihood *= finalLikelihood;
    };
    total_finalLikelihood *= countClass;
    //console.log(total_finalLikelihood);
    return total_finalLikelihood;
};

var calculateNormalisedProbability = function (LikelihoodTrue, LikelihoodFalse, ClassifierOutcome) {
    //This function helps to convert from Likelihood ro Probability
    //Yes = True, No = False and vice versa
    if (ClassifierOutcome == true) {
        return LikelihoodTrue / (LikelihoodTrue + LikelihoodFalse);
    } else {
        return LikelihoodFalse / (LikelihoodTrue + LikelihoodFalse);
    }

};
//}