let testMat = Matrix.mat(10);
for(let i = 0; i < 100; i++)
{
    testMat[i] = Math.random();
}
let outmat = Matrix.invert(testMat);

let idenTest = Matrix.mat(10);
Matrix.mulMat(testMat,outmat,idenTest);

console.log("idenTest");
Matrix.logMat(idenTest);

