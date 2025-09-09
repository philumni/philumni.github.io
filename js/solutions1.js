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

	if (s.charAt(leftIndex)!=s.charAt(rightIndex)) return false;

	leftIndex++;
	rightIndex--;
	return myApp.innerPalindrome(leftIndex,rightIndex,s);
}

myApp.threeAnswer = function()
{
	let word=get("pWord");
	let answer=get("threeAnswer");

	if (myApp.isPalindrome(word.value.toLowerCase()) )
	{
		answer.value="Yep, it's a apalindrome.";
	}
	else answer.value="No, it's not a palindrome.";
	console.log("tested " + word.value);
}

