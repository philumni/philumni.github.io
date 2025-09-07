var myApp = myApp || {};



myApp.isPalindrome = function(s)
{

let leftIndex=0;
let rightIndex=s.length-1;


let lc=s.charAt(leftIndex);
let rc=s.charAt(rightIndex);

return (myApp.innerPalindrome(leftIndex,rightIndex,s));
}


myApp.innerPalindrome = function(leftIndex,rightIndex,s)
{
	console.log("testing");
	if (leftIndex==rightIndex) return true;
	if (leftIndex>rightIndex && rightIndex<leftIndex) return true;

	if (s.charAt(leftIndex)!=s.charAt(rightIndex)) return false;

	leftIndex++;
	rightIndex--;
	return myApp.innerPalindrome(leftIndex,rightIndex,s);
}

myApp.doPalindrome = function()
{
	let word=get("pWord");
	let answer=get("pAnswer");

	if (myApp.isPalindrome(word.value.toLowerCase()) )
	{
		answer.value="Yep, it's a apalindrome.";
	}
	else answer.value="No, it's not a palindrome.";
	console.log("tested " + word.value);
return;
}

