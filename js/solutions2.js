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


myApp.sixAnswer=function()
{
    const theN = Number(myApp.get("nPrimes").value);

    let theAnswer=
        myApp.doSieveOfEratosthenesString(myApp.doSieveOfEratosthenesMain(theN));
    let sixAnswer=myApp.get("sixAnswer");
    sixAnswer.value = theAnswer;
}


myApp.doSieveOfEratosthenesString= function(primes)
{
    let j = 0;

    let output = "";
    for (; j < primes.length - 1; j++)
    {
        if (primes[j]) output += j + ", ";
    }

    if (primes[j]) output += "" + j;
    if (output.endsWith(", ")) output = output.substring(0, output.length - 2);
    output+= ".";
    return output;
}

myApp.doSieveOfEratosthenesMain=function(n)
{
    const primes = new Array(n + 1);
    for (let i = 2; i <= n; i++) primes[i] = true;

    for (let p = 2; p * p <= n; p++)
    {
        if (primes[p] === true)
        {
            for (let i = p * p; i <= n; i += p)
            primes[i] = false;
        }
    }

    primes[0] = false;
    primes[1] = false;
    return primes;
}

/*
myApp.sixAnswer = function()
{
    let theCelsius = myApp.get("celsius");
    let celsiusValue=parseFloat(theCelsius.value);

    let theAnswer = (celsiusValue * 1.8) + 32;
    theAnswer = Number(theAnswer.toFixed(2));

    let sixAnswer=myApp.get("sixAnswer");
    sixAnswer.value = theAnswer;
}
*/

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


