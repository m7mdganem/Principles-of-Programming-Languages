import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
const isVowel:(x: string) => boolean = (x: string) => { 
    if(x === 'a' || x==='e' || x==='i' || x==='u' || x==='o') 
        return true; 
    return false;
}

export const countVowels:(x: string) => number = (x: string) => R.filter(isVowel,stringToArray(R.toLower(x))).length;

/* Question 2 */
/*
 * This function recieves a string and returns an array which contains each char in 
 * the string followed by the number of the appearences of this char in sequence.
 *  */
const countLettersSequence:(x:string) => (string|number)[] = (x: string) => {
    return R.reduce( (a:(string|number)[],b:string) => {
        // if the array is empty or the last letter is different than the 
        // current letter,then we ended a sequence and started a new one.
        if(a.length===0 || a[a.length-2] != b){
            return R.concat(a,[b,1]);
        }else if(a[a.length-2] === b && (typeof (a[a.length-1]) === 'number')){
            // else, we are in a previos sequence so we change the number
            // of the letters at the end (we increase it by one) 
            const c:number = <number>a[a.length-1] + 1;
            return R.concat(R.slice(0,a.length-1,a),[c]);
        }
        return a;
    }
    ,[]
    ,stringToArray(x))
}

// filters numbers smaller or equals to 1 in an array of strings and numbers
// returns false iff the element is a number and it is smaller or equals to 1.
const filterNonRelevantElements: (x: (string|number)) => boolean = (x: (string|number)) => {
    if( typeof x === 'number' && x <= 1) 
        return false; 
    return true;
}

//function that converts array to string
const arrayToString = R.join("")

//main function which compresses the string
export const runLengthEncoding:(x:string) => string = (x: string) => arrayToString((R.filter(filterNonRelevantElements,countLettersSequence(x))));

/* Question 3 */
/**
 * the idea of the function/method is :
 * we start with an array of numbers [0,0,0] where:
 * ^ the first number represents the number of the "(" and ")" strings
 * ^ the second number represents the number of the "[" and "]" strings
 * ^ the third number represents the number of the "{" and "}" strings
 * 
 * Whenever we face an opening braces we increase the number by one,
 * and decrease it by one when facing a closing one.
 * If at the end of the execution we find that there is a negative number
 * in the array, then there is a diffect in the sequence of the braces.
 * 
 * ^ NOTE: during the execution when we face a negative number we stop increasing
 *         it, because that negative number says that until now there is more closing
 *         braces than opening ones, thus the sequence is not ok. 
 */
export const isPaired: (x: string) => boolean = (x: string) => {
    const arr:number[] = R.reduce( (a:number[] ,c: string) => {
        if(c === '(' && a[0] >= 0)
            return [a[0]+1,a[1],a[2]];
        else if (c === ')')
            return [a[0]-1,a[1],a[2]];
        else if (c === '[' && a[1] >= 0)
            return [a[0],a[1]+1,a[2]];
        else if (c === ']')
            return [a[0],a[1]-1,a[2]];
        else if (c === '{' && a[2] >= 0)
            return [a[0],a[1],a[2]+1];
        else if (c === '}')
            return [a[0],a[1],a[2]-1];
        else
            return [a[0],a[1],a[2]];
    },[0,0,0],stringToArray(x));

    return R.reduce((a:boolean,b:number) => {
         if( b === 0 ) 
            return (a&&true); 
         else 
            return false;
        },true,arr);
}