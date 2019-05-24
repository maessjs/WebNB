
module.exports = {

    /*  exportClass: function (Data) {
        var finalColName = Object.keys(Data[0])[Object.keys(Data[0]).length - 1];
        return finalColName;
    },
    
    exportClassifierOutcomeList: function (Data) {
        var finalColName = Object.keys(Data[0])[Object.keys(Data[0]).length - 1];
        var classifierOutcomeList = [];
        Data.forEach((element) => {
            classifierOutcome = element[finalColName];
            classifierOutcomeList.push(classifierOutcome);
        });
        return classifierOutcomeList;
    }, */

    calcCorectandIncorrectInstances: function (originalData, classifiedData) {
        var toReturn = {
            'Correct': 0,
            'Incorrect': 0
        };

        var finalColName = Object.keys(originalData[0])[Object.keys(originalData[0]).length - 1];

        for (var i = 0; i < originalData.length; i++) {

            if (originalData[i][finalColName] === classifiedData[i][finalColName]) {
                toReturn.Correct++;
            } else {
                toReturn.Incorrect++;
            }
        }
        //console.log(toReturn);
        return toReturn;
    },


    //Calculate : TP Rate  FP Rate  Precision  Recall :
    getDetailedAccuracyByClass: function (originalData, classifiedData) {
        var detailedAccuracyByClass = [];

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

        var originalAttributeList = Object.keys(originalData[0]);
        var classifiedAttributeList = Object.keys(classifiedData[0]);

        var originClassAttr = originalAttributeList[originalAttributeList.length - 1]; //y
        console.log('originClassAttr = ' + originClassAttr);

        var classifiedClassAttr = classifiedAttributeList[classifiedAttributeList.length - 1]; //y
        console.log('classifiedClassAttr = ' + classifiedClassAttr);

        var classList = [];
        originalData.forEach((dict) => {
            classList.push(dict[classifiedClassAttr])
        });
        classList = [...new Set(classList)];
        console.log("statistics: classList: " + classList);

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

            ///Getting Sensitivity:
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


            //Recalculate the rate:
            currentDict['TP_Rate'] = currentDict['TP_Rate'] / (currentDict['TP_Rate'] + currentDict['FN_Rate']);
            currentDict['TP_Rate'] = Math.round(currentDict['TP_Rate'] * 100) / 100;
            currentDict['FP_Rate'] = currentDict['FP_Rate'] / (currentDict['FP_Rate'] + currentDict['TN_Rate']);
            currentDict['FP_Rate'] = Math.round(currentDict['FP_Rate'] * 100) / 100;

            detailedAccuracyByClass.push(currentDict);
        });

        return detailedAccuracyByClass;
    }
};