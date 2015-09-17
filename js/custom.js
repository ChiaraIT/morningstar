
//////////////////////////////////////////////////
//begin
//////////////////////////////////////////////////
var PortfolioCalculation = function(){

    /*********************************************************************
    OBJECTS
    *********************************************************************/
    // locally scoped Object
    var myObject = {};

    // It counts the total amount of portfolio
    var cashRegister = {
        countR:0,
        //Dynamic variables are added from portfolioAjaxRequest
        add: function(itemCost, transactionSecurityId){
            var dynamicName = "count"+transactionSecurityId;

            this[dynamicName] += itemCost;
            this.countR ++;
        },
        subtraction: function(itemCost, transactionSecurityId){
            var dynamicName = "count"+transactionSecurityId;

            this[dynamicName] -= itemCost;
            this.countR ++;
        }
    };

    /*********************************************************************
    PUBLIC FUNCTION
    *********************************************************************/
    this.portfolio = function(portfolio, date){

        //SAVE DATA FROM CLIENT'S REQUEST
        myObject.requestedDate = date;
        myObject.requestedPortfolio = portfolio;

        //LOAD THE PORTFOLIO
        portfolioAjaxRequest(portfolio, date);
    };



    /*********************************************************************
    //PRIVATE FUNCTIONS
    *********************************************************************/

    ///////////////////////////////////////////////////////////////////////////
    //LOAD PORTFOLIO JSON
    ///////////////////////////////////////////////////////////////////////////
    var portfolioAjaxRequest = function(){
        $.ajax({
            url: "/Portfolios/" + myObject.requestedPortfolio + ".json",
            type: "POST",
            crossDomain: true,
            dataType: "json",

            success: function (result) {

                //result obj
                $.each( result, function( key, val ) {
                    
                    if(key === "transactions"){
                        
                        myObject.cashRegisterCount = val.length;
                        myObject.transactionSecurityIdArray = [];
        

                        for(i = 0; i < myObject.cashRegisterCount; i++){
                            var transactionSecurityId = val[i].securityId;
                            var transactionType = val[i].type;
                            var transactionDate = val[i].date;
                            var transactionAmount = val[i].amount;

                            var dynamicName = "count"+transactionSecurityId;
                            cashRegister[dynamicName] = 0;

                            myObject.transactionSecurityIdArray.push(transactionSecurityId);

                            //Load securities json passing the right securityIdValue (A, B)
                            securitiesAjaxRequest (transactionSecurityId, transactionType, transactionDate, transactionAmount);
                        }
                    }
                });
            },

            error: function (xhr,status,error) {
                alert(status);
            }
        });
    };

    ///////////////////////////////////////////////////////////////////////////
    //LOAD SECURITIES JSON BASED ON THE DATA IN THE PORTFOLIO JSON 
    ///////////////////////////////////////////////////////////////////////////
    var securitiesAjaxRequest = function(transactionSecurityId, transactionType, transactionDate, transactionAmount){

        $.ajax({
            url: "/Securities/" + transactionSecurityId + ".json",
            type: "POST",
            crossDomain: true,
            dataType: "json",

            success: function (result) {
          
                //Save the transaction RequestedDate Value
                var priceOfSecurityRequestedDate = getValue(result,myObject.requestedDate);
                var sharesValue = getSharesValue(result, transactionDate, transactionAmount);
                var portfolioValue = getPortfolioValue(priceOfSecurityRequestedDate, sharesValue);
                
                //console.log(transactionSecurityId +" - " + sharesValue);
                
                //SHOW PORTFOLIO VALUE
                calculationPortfolioValue(portfolioValue, transactionType, transactionSecurityId);
            },

            error: function (xhr,status,error) {
                alert(status);
            }
        });
    };


    ///////////////////////////////////////////////////////////////////////////
    //ADD AND SUBSTRACT VALUES
    ///////////////////////////////////////////////////////////////////////////
    var calculationPortfolioValue = function(sharesValue, transactionType, transactionSecurityId){
        if(transactionType === "buy"){
            cashRegister.add(sharesValue, transactionSecurityId);
        }else{
            cashRegister.subtraction(sharesValue, transactionSecurityId);
        }

        //Call the function when the process is done
        if(cashRegister.countR === myObject.cashRegisterCount){
            $("#portfolio-value").html(getTheTotalAmount());
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    //FINAL SUM FROM DIFFERENT TRANSACTIONS
    ///////////////////////////////////////////////////////////////////////////
    var getTheTotalAmount = function(){

        var uniqueArray = eliminateDuplicates(myObject.transactionSecurityIdArray);

        var total = 0;
        for(i = 0; i < uniqueArray.length; i++){
            var dynamic = "count"+uniqueArray[i];
            total += cashRegister[dynamic];
        }

        return total;
    };

    ///////////////////////////////////////////////////////////////////////////
    //GET THE VALUE FROM A SPECIFIC DATE
    ///////////////////////////////////////////////////////////////////////////
    var getValue = function(result, transactionDate){

        //Search the transactionDate value
        var objValueResults = getObjects(result, "endDate", transactionDate);
     
        for(i = 0; i < objValueResults.length; i++){
            return objValueResults[i].value;
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    //SEARCH A PROPERTY WITH A SPECIFIC VALUE IN AN OBJECT THE RESULT IS AN OBJ
    ///////////////////////////////////////////////////////////////////////////
    var  getObjects = function(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));
            } else if (i == key && obj[key] == val) {
                objects.push(obj);
            }
        }
        return objects;
    };

    ///////////////////////////////////////////////////////////////////////////
    // GET THE SHARES VALUE
    ///////////////////////////////////////////////////////////////////////////
    var getSharesValue = function(result, transactionDate, transactionAmount){

        var value = getValue(result, transactionDate);
        return transactionAmount / value;
      
    };

    ///////////////////////////////////////////////////////////////////////////
    //GET PORTFOLIO VALUE
    ///////////////////////////////////////////////////////////////////////////
    var getPortfolioValue = function (priceOfSecurityRequestedDate, sharesValue) {
    
        return (priceOfSecurityRequestedDate * sharesValue);
        
    };

    ///////////////////////////////////////////////////////////////////////////
    //ELIMINATE DUPLICATES FROM AN ARRAY
    ///////////////////////////////////////////////////////////////////////////
    var eliminateDuplicates = function(arr) {
        var i,
        len=arr.length,
        out=[],
        obj={};

        for (i=0;i<len;i++) {
            obj[arr[i]]=0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    };
};



