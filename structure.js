
function populateNodes()
{
    currentNode = 1;
    for(let i = 0; i < gridW*gridH; i++)
    {
        grid[i] = 0;
    }
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        for(let j = 0; j < c.connections.length; j++)
        {
            let conn = c.connections[j];
            let x = conn[1][0];
            let y = conn[1][1];
            let node = getGridNode(x,y);
            if(node==0)
            {
                grid[x+y*gridW] = currentNode;
                c.connections[j][0] = currentNode - 1;
                currentNode++;
            }
            else
            {
                c.connections[j][0] = node-1;
            }
        }
    }
}

var parseSuccess = false;
var tsetMat;
function findCircuitMat(dependents,independents)
{
    let mat = Matrix.mat(independents.length);
    for(let i = 0; i < dependents.length; i++)
    {
        let c = dependents[i];
        Matrix.addElement(mat,c[0],c[1],c[2]);
    }
    let outMat = Matrix.mat(independents.length);
    parseSuccess = Matrix.preciseInvert(mat,outMat,16);
    tsetMat = mat;
    return outMat;
}

function parseCircuit()
{
    populateNodes();
    circuitConstraints = [];
    circuitParams = [];
    for(let i = 0; i < currentNode-1; i++)
    {
        circuitParams.push(0);
    }
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        
        c.initParams(circuitParams);

        c.initConstraints(circuitConstraints);

        // for(let i = 0; i < deps.length; i++)
        // {
        //     circuitConstraints.push(deps[i]);
        // }
    }
    circMat = findCircuitMat(circuitConstraints,circuitParams);
}

var fixedVals;
function solveCircuit()
{
    fixedVals = Matrix.mulVec(circMat,circuitParams);

    if(parseSuccess)
    {
        for(let i = 0; i < comps.length; i++)
        {
            comps[i].updateValues(fixedVals,circuitParams,circuitConstraints);
        }
        for(let i = 0; i < circuitParams.length; i++)
        {
            circuitParams[i] = 0;
        }
        for(let i = 0; i < comps.length; i++)
        {
            comps[i].updateParams(circuitParams);
        }
    }
}


function getScreenPos(pos)
{
    return [(pos[0]+1)*(canW)/(gridW+1),(pos[1]+1)*(canH)/(gridH+1)];
}
function getGridPos(pos)
{
    return [pos[0]*(gridW+1)/(canW)-1,pos[1]*(gridH+1)/(canH)-1];
}

function getGridNode(x,y)
{
    return grid[x+y*gridW];
}
var circuitParams = [];
var circuitConstraints = [];
var circMat;


var node_voltages;


function grad_dec()
{
    node_voltages = Matrix.mulVec(circMat,circuitParams);
    let err = 1.0
    for(let i = 0; i < 250 &err>(10**-15); i++)
    {
        err = grad_step(node_voltages)
    }
}
var currentError;
function grad_step(voltages)
{
    let realCurrents = new Float64Array(circuitParams.length);
    currentError = new Float64Array(circuitParams.length);
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].calcRealNodeCurrents(realCurrents,voltages);
    }
    for(let i = 0; i < currentError.length; i++)
    {
        currentError[i] = 0.1*(circuitParams[i]-realCurrents[i]);
    }
    console.log(currentError)
    console.log(voltages)


    circuitConstraints = [];
    circuitParams = [];
    for(let i = 0; i < currentNode-1; i++)
    {
        circuitParams.push(0);
    }
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        
        c.initParams(circuitParams);

        c.initConstraints(circuitConstraints);
    }
    circMat = findCircuitMat(circuitConstraints,circuitParams);
    let correction = Matrix.mulVec(circMat, currentError);
    console.log(correction)
    node_voltages = Matrix.addVecs(node_voltages,correction);
    return Matrix.vecLength(currentError);
}
