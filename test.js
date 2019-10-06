let anything = { 
    ahmed : 1,
    nigga : 2
}
let arr = Object.keys(anything).map(function(k) { return anything[k] });
console.log(arr)