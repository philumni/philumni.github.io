var myApp = myApp || {};


myApp.fiveAnswer = function()
{
  let theRadius = myApp.get("radius");

  let radiusValue = parseFloat(theRadius.value);

  let fiveAnswer = myApp.get("fiveAnswer");
  let theAnswer = Math.PI * Math.pow(radiusValue, 2.0);
  theAnswer = theAnswer.toFixed(2);
  fiveAnswer.value = theAnswer;
}


myApp.sixAnswer = function()
{
    let theCelsius = myApp.get("celsius");
    let celsiusValue=parseFloat(theCelsius.value);

    let theAnswer = (celsiusValue * 1.8) + 32;
    theAnswer = Number(theAnswer.toFixed(2));

    let sixAnswer=myApp.get("sixAnswer");
    sixAnswer.value = theAnswer;
}

myApp.sevenAnswer = function() {

  let thePrincipal = myApp.get("sPrincipal");
  let theRate = myApp.get("sRate");
  let theTime = myApp.get("sYears");

  let principalValue = parseFloat(thePrincipal.value);
  let rateValue = parseFloat(theRate.value);
  let timeValue = parseFloat(theTime.value);
  let theAnswer = (principalValue * rateValue * timeValue) / 100.0;
  theAnswer = theAnswer.toFixed(2);


  let sevenAnswer = myApp.get("sevenAnswer");
  sevenAnswer.value = theAnswer;
}

myApp.eightAnswer = function() {

  let thePrincipal = myApp.get("cPrincipal");
  let theRate = myApp.get("cRate");
  let theTime = myApp.get("cYears");
  let thePeriods = myApp.get("cPeriods");

  let principalValue = parseFloat(thePrincipal.value);
  let rateValue = parseFloat(theRate.value)/100;
  let timeValue = parseFloat(theTime.value);
  let periodValue = parseFloat(thePeriods.value);

  let a = principalValue * Math.pow(1+ rateValue/periodValue,timeValue*periodValue);
  let theAnswer= a-principalValue; // just get the interest
  theAnswer = theAnswer.toFixed(2);


  let eightAnswer = myApp.get("eightAnswer");
  eightAnswer.value = theAnswer;
}


