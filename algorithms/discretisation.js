
module.exports = {

    exportDiscretisedList: function (NumBin, Data, attributeName) {
        let data = JSON.parse(JSON.stringify(Data));
        let numBin = NumBin;
        let key = attributeName;
        let toReturn = [];

        //Start discretisation:
        let numList = [];
        let numListMax = 0;
        let numListMin = 0;
        let numListRange = 0;
        let binSize = 0;
        let i;
        let n;

        numList = [];
        //for example: key is now age:
        data.forEach((object) => {
            numList.push(parseFloat(object[key]));
        });
        //Example: numList = [0,1,2,2,4,4,4,4,5,6,6,6,7,8,];
        numListMax = Math.max(...numList);
        numListMin = Math.min(...numList);

        numListRange = numListMax - numListMin;

        binSize = numListRange / numBin;
            n = 1;
            for (i = numListMin; i < numListMax; i += binSize) {
                if (n <= numBin){
                    //console.log('Dans la range de [' + i  +" - " + (i+binSize)+ ']' );
                    data.forEach((object) => {
                        if (object[key] === numListMax) {
                            toReturn.push(
                                (Math.round((numListMax - binSize) * 100) / 100)
                                + " - "
                                + (Math.round(numListMax * 100) / 100));
                        } else if (object[key] === numListMin) {
                            toReturn.push(
                                (Math.round(numListMin * 100) / 100)
                                + " - "
                                + (Math.round((numListMin + binSize) * 100) / 100));
                        } else if (object[key] >= i && object[key] < (i + binSize)) {
                            toReturn.push(
                                (Math.round(i * 100) / 100)
                                + " - "
                                + (Math.round((i + binSize) * 100) / 100));
                        } else {
                            toReturn.push(
                                (Math.round(i * 100) / 100)
                                + " - "
                                + (Math.round((i + binSize) * 100) / 100));
                        };  
                });  
            }
            n++;
            toReturn = [...new Set(toReturn)];
            //console.log(toReturn);
        };
        toReturn = [...new Set(toReturn)];
        return toReturn;
    },

    discretise: function (NumBin, Data) {
        let data = JSON.parse(JSON.stringify(Data));
        let numBin = NumBin;

        //Get keys of the data:
        let keyList = Object.keys(data[0]);
        let keyListNumeric = [];

        keyList.forEach((key) => {
            data.forEach((object => {
                if ((typeof parseInt(object[key])) == "number") {
                    keyListNumeric.push(key);
                }
            }));
        });

        //This is for removing duplications:
        keyListNumeric = [...new Set(keyListNumeric)];

        //Start discretisation:
        let numList = [];
        let numListMax = 0;
        let numListMin = 0;
        let numListRange = 0;
        let binSize = 0;
        let n = 0;
        let i;

        keyListNumeric.forEach((key) => {
            numList = [];
            //for example: key is now age:
            data.forEach((object) => {
                numList.push(parseFloat(object[key]));
            });
            //Example: numList = [0,1,2,2,4,4,4,4,5,6,6,6,7,8,];
            numListMax = Math.max(...numList);
            numListMin = Math.min(...numList);

            numListRange = numListMax - numListMin;

            binSize = numListRange / numBin;
            for (i = numListMin; i < numListMax; i += binSize) {
                n = 0;
                data.forEach((object => {
                    if (object[key] == numListMax) {
                        oldValue = object[key];
                        data[n][key] = (Math.round((numListMax - binSize) * 100) / 100)
                            + " - "
                            + (Math.round(numListMax * 100) / 100);
                    } else if (object[key] == numListMin) {
                        oldValue = object[key];
                        data[n][key] = (Math.round(numListMin * 100) / 100)
                            + " - "
                            + (Math.round((numListMin + binSize) * 100) / 100);
                    } else if (object[key] >= i && object[key] < (i + binSize)) {
                        oldValue = object[key];
                        //object[key] = "From " + i + " to " + (i+binSize);
                        data[n][key] = (Math.round(i * 100) / 100)
                            + " - "
                            + (Math.round((i + binSize) * 100) / 100);
                    }
                    n++;
                }));
            }
        });
        return data;
    },

    isThereNumericInside: function (data) {
        let keyList = Object.keys(data[1]);
        let keyListNumeric = [];
        let toReturn = null;

        keyList.forEach((key) => {
            data.forEach((object => {
                if ((typeof object[key]) == "number") {
                    keyListNumeric.push(key);
                }
            }));
        });
        if (keyListNumeric !== []) {
            return true;
        } else {
            return false;
        }
    }

};

