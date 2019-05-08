
module.exports = {

    discretise: function (NumBin, Data) {
        var data = JSON.parse(JSON.stringify(Data));
        var numBin = NumBin;

        //Get keys of the data:
        var keyList = Object.keys(data[1]);
        var keyListNumeric = [];

        keyList.forEach((key) => {
            data.forEach((object => {
                if ((typeof parseInt(object[key])) == "number") {
                    keyListNumeric.push(key);
                }
            }));
        });

        //This is for removing duplications:
        keyListNumeric = [...new Set(keyListNumeric)];

        var bin = [];

        //Start discretisation:
        var numList = [];
        var numListMax = 0;
        var numListMin = 0;
        var numListRange = 0;
        var binSize = 0;
        var n = 0;
        var i;
        var oldValue = 0;

        keyListNumeric.forEach((key) => {
            console.log("\nCurrent key: " + key);
            numList = [];
            //for example: key is now age:
            data.forEach((object => {
                numList.push(parseInt(object[key]));
            }));
            console.log(numList);
            //Example: numList = [0,1,2,2,4,4,4,4,5,6,6,6,7,8,];
            numListMax = Math.max(...numList);
            console.log("Max: " + numListMax);

            numListMin = Math.min(...numList);
            console.log("Min: " + numListMin);

            numListRange = numListMax - numListMin;
            if (numListMax < 0 && numListMin < 0) {
                numListRange = Math.abs(numListMin) - Math.abs(numListMax);
            }
            if (numListMax > 0 && numListMin > 0) {
                numListRange = numListMax - numListMin;
            }
            if (numListMax >= 0 && numListMin < 0) {
                numListRange = numListMax + Math.abs(numListMin);
            }

            console.log("numListRange: " + numListMin);

            binSize = numListRange / numBin;
            console.log("binSize: " + numListMin);

            console.log("Prepare for for:");
            for (i = numListMin; i <= numListMax; i += binSize) {
                n = 0;
                data.forEach((object => {
                    if (object[key] == numListMax) {
                        oldValue = object[key];
                        data[n][key] = "From "
                            + (Math.round((numListMax - binSize)*100)/100)
                            + " to "
                            + (Math.round(numListMax*100)/100);
                        console.log(oldValue + " goes to " + object[key]);
                    } else if (object[key] == numListMin) {
                        oldValue = object[key];
                        data[n][key] = "From "
                            + (Math.round(numListMin*100)/100)
                            + " to "
                            + (Math.round((numListMin + binSize)*100)/100);
                        console.log(oldValue + " goes to " + object[key]);
                    } else if (object[key] >= i && object[key] < (i + binSize)) {
                        oldValue = object[key];
                        //object[key] = "From " + i + " to " + (i+binSize);
                        data[n][key] = "From "
                            + (Math.round(i*100)/100)
                            + " to "
                            + (Math.round((i + binSize)*100)/100);
                        console.log(oldValue + " goes to " + object[key]);
                    }
                    n++;
                }));
            }
        });

        console.log("Transformed data: " + data);
        return data;
    },

    isThereNumericInside: function (data) {
        var keyList = Object.keys(data[1]);
        var keyListNumeric = [];
        var toReturn = null;

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

