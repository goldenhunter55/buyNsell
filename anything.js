let x = 100 ; 
let i = 0;
while (x>0.00001){
    x = x * 0.99;
    i++;
}
console.log(i);