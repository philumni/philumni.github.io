var myApp = myApp || {};



myApp.isPalindrome = function(s)
{

let leftIndex=0;
let rightIndex=s.length-1;

return (myApp.innerPalindrome(leftIndex,rightIndex,s));
}


myApp.innerPalindrome = function(leftIndex,rightIndex,s)
{
	if (leftIndex===rightIndex) return true;
	if (leftIndex>rightIndex && rightIndex<leftIndex) return true;

	if (s.charAt(leftIndex)!==s.charAt(rightIndex)) return false;

	leftIndex++;
	rightIndex--;
	return myApp.innerPalindrome(leftIndex,rightIndex,s);
}

myApp.threeAnswer = function()
{
	let word=myApp.get("pWord");
	let answer=myApp.get("threeAnswer");

	if (myApp.isPalindrome(word.value.toLowerCase()) )
	{
		answer.value="Yep, it's a a palindrome.";
	}
	else answer.value="No, it's not a palindrome.";
	console.log("tested " + word.value);
}

myApp.fourAnswer = function()
{
  let theBase = myApp.get("base");
  let theHeight = myApp.get("ht");
  let baseValue = parseFloat(theBase.value);
  let htValue = parseFloat(theHeight.value);

  let fourAnswer = myApp.get("fourAnswer");
  let theAnswer= 0.5 * baseValue * htValue;
  theAnswer = theAnswer.toFixed(2);
  fourAnswer.value = theAnswer;
}
