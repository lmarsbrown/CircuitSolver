
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
    parseSuccess = Matrix.invert(mat,outMat);
    tsetMat = mat;
    return outMat;
}

function parseCircuit()
{
    populateNodes();
    depConstraints = [];
    indConstraints = [];
    for(let i = 0; i < currentNode-1; i++)
    {
        indConstraints.push(0);
    }
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        let inds = c.getIndependents(indConstraints.length);
        let deps = c.getDependents();
        for(let i = 0; i < deps.length; i++)
        {
            depConstraints.push(deps[i]);
        }
        for(let i = 0; i < inds.length; i++)
        {
            indConstraints.push(inds[i]);
        }
    }
    circMat = findCircuitMat(depConstraints,indConstraints);
}
var fixedVals;
function solveCircuit()
{
    fixedVals = Matrix.mulVec(circMat,indConstraints);

    if(parseSuccess)
    {
        for(let i = 0; i < comps.length; i++)
        {
            comps[i].updateValues(fixedVals);
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
var indConstraints = [];
var depConstraints = [];
var circMat;