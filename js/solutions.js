var myApp = myApp || {};

myApp.oneAnswer=function()
{

let textA=myApp.get("textA");
let textB=myApp.get("textB");

let answer=myApp.get("oneAnswer");
answer.value=myApp.getCommonSt(textA.value,textB.value);
console.log(textA.value + " " + textB.value);
}


myApp.get=function(s)
{
	return document.getElementById(s);
}

myApp.getCommonSt = function(textA,textB)
{
	let common="";

  // Turn the second string into a char array, this is so we can splice it.
  textB=textB.split(""); // is now a char array.

	for (let x=0; x<textA.length;x++)
	{
		let test = textA.charAt(x);

		let i = textB.indexOf(test);
		if (i !==-1)

			{
				common+=test;
        textB.splice(i,1);
   		}
	}

return common;
}


myApp.twoAnswer=function()
{
	let count =parseInt(myApp.get("fCount").value,10);

	let result=[];

		for (let j=0; j<count+1; j++)
		{
			let key="";
			if (j%3===0)
				{ key="Fizz";
					if (j%5===0)
					{
						key+="Buzz";
					}
					result[j]=key;
					continue;
				}

			if (j%5===0) {key="Buzz"; result[j]=key; continue; }

			key=""+j;
			result[j]=key;
		}

	let answer=myApp.get("twoAnswer");
	answer.value=result;
}
