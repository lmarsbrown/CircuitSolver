/*

   v0, v1, v2, is
i0 
i1 
i2
vs

 */


let nodes= 3;

let independents = getNodeInd();
let dependents = [];

appendConstraints(getResistor  (0,1,1));
appendConstraints(getResistor  (1,2,1));
appendConstraints(getVoltageSrc(2,0,1));
solveCircuit(independents,dependents);


function solveCircuit(ind,dep)
{
    let mat = Matrix.mat(ind.length);
    for(let i = 0; i < dep.length; i++)
    {
        let c = dep[i];
        Matrix.addElement(mat,c[0],c[1],c[2]);
    }
    let outMat = Matrix.mat(ind.length);
    console.log(Matrix.invert(mat,outMat));
    let out = Matrix.mulVec(outMat,ind);
    Matrix.logVec(out);
    Matrix.logMat(mat);
}


/*
Constraint: [in (voltage),out (current),val]
*/
function getResistor(n1,n2,r)
{
    let indep = [];
    let dep = [
        //n1 current
        [n1,n1, -1/r],
        [n2,n1,  1/r],
        //n2 current
        [n1,n2,  1/r],
        [n2,n2, -1/r]
    ];
    return [indep,dep];
}
function getVoltageSrc(n1,n2,v)
{
    let indep = [v];
    let iInd = independents.length;
    console.log(iInd);
    let dep = [
        //n1 voltage
        [n1,iInd, -1],
        [n2,iInd,  1],
        //n1 current
        [iInd,n1, -1],
        //n2 current
        [iInd,n2,  1],
    ];
    return [indep,dep];
}


function appendConstraints(comp)
{
    for(let i = 0; i < comp[0].length; i++)
    {
        independents.push(comp[0][i]);
    }
    for(let i = 0; i < comp[1].length; i++)
    {
        dependents.push(comp[1][i]);
    }
}

function getNodeInd()
{
    let out = [];
    for(let i = 0; i < nodes; i++)
    {
        out[i] = 0;
    }
    return out;
}