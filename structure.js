
function populateNodes()
{
    currentNode = 2;
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
                currentNode++;
                c.connections[j][0] = currentNode - 2;
            }
            else
            {
                c.connections[j][0] = node-1;
            }
        }
    }
}

function parseCircuit()
{
    populateNodes();
    simples = [];
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].updateSimple();
        simples.push(comps[i].simple);
    }

    solveCircuit();
}


function solveCircuit()
{
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].updateSimple();
    }

    let solu = Solver.solve(simples,currentNode-1);
    if(!solu)
    {
        return;
    }

    for(let i = 0; i < simples.length; i++)
    {
        let uVec = Matrix.vec(solu[i],1);
        let ivVec = Matrix.mulVec(simples[i].ivMat,uVec);
        comps[i].v = ivVec[0];
        comps[i].i = ivVec[1];

        for(let j = 0; j < comps[i].connections.length; j++)
        {
            if(comps[i].connections[j][0] != 0)
            {
                comps[i].connections[j][2] = solu[comps.length+comps[i].connections[j][0]-1]
            }
        }
    }
    nVoltages = [];
    for(let i = 0; i < currentNode-2; i++)
    {
        nVoltages[i] = solu[comps.length+i];
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
var simples = [];