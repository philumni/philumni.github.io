var myApp = myApp || {};

function oneAnswer()
{

let textA=get("textA");
let textB=get("textB");

let answer=get("oneAnswer");
answer.value=getCommonSt(textA.value,textB.value);
}




function get(s)
{
	return document.getElementById(s);
}

function getCommonSt(textA,textB)
{
	let common="";
	for (let x=0; x<textA.length;x++)
	{
		let test = textA.charAt(x);

		let i = textB.indexOf(test);
		if (i !=-1)

			{
				common+=test;
				textB.split("").splice(i,1);
			}
	}

return common;
}


function twoAnswer()
{
	let count =parseInt(get("fCount").value,10);

	let result=[];
		// 0 is n/a. 1 is n/a.
		result[0]="0";
		result[1]="1";

		for (let j=2; j<count+1; j++)
		{
			let key="";
			if (j%3==0)
				{ key="Fizz";
					if (j%5==0)
					{
						key+="Buzz";
					}
					result[j]=key;
					continue;
				}

			if (j%5==0) {key="Buzz"; result[j]=key; continue; }

			key=""+j;
			result[j]=key;
		}

	let answer=get("twoAnswer");
	answer.value=result;
}
