
function clear()
{
    ctx.clearRect(0,0,canW,canH);
    ctx.fillStyle = `black`;
    ctx.fillRect(0,0,canW,canH);
}


function drawGridNode(x,y,rad)
{
    let coord = getScreenPos(Matrix.vec(x,y));
    ctx.fillRect(coord[0]-rad,coord[1]-rad,rad*2,rad*2);
}
function drawGrid()
{
    for(let y = 0; y < gridH; y++)
    {
        for(let x = 0; x < gridW; x++)
        {
            if(getGridNode(x,y) > 1)
            {
                ctx.fillStyle = `rgb(0,0,255)`;
                drawGridNode(x,y,5);
            }
            if(getGridNode(x,y) == 1)
            {
                ctx.fillStyle = `rgb(100,100,100)`;
                drawGridNode(x,y,5);
            }
        }
    }
}

function drawComponents()
{
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].draw(getScreenPos);
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

function draw()
{
    clear();
    populateNodes();
    drawComponents();
    // drawGrid();
}

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
            // console.log(conn);
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

function getGridNode(x,y)
{
    return  grid[x+y*gridW];
}

function evalCircuit()
{
    populateNodes();
    let simples = [];
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].updateSimple();
        simples.push(comps[i].simple);
    }
    let solu = Solver.solve(simples,currentNode-1);
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
}

function mouseHover(event)
{
    let screenPos = Matrix.vec(event.offsetX,event.offsetY);
    let gridPos = getGridPos(screenPos);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));

    let positions = {screenPos:screenPos,gridPos:gridPos,roundPos:roundPos,roundScreenPos:roundScreenPos};

    currentHover = undefined;
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        let hover = c.getHovering(positions);
        if(hover != undefined)
        {
            currentHover = [i,hover];
            break;
        }
    }
    let localNode = getGridNode(roundPos[0],roundPos[1])
    // console.log(currentHover);
    draw();
    if(localNode != 0)
    {
        if(localNode>1)
        {
            ctx.fillStyle = `rgb(0,0,255)`;
            drawGridNode(roundPos[0],roundPos[1],8);
        }
        if(localNode==1)
        {
            ctx.fillStyle = `rgb(100,100,100)`;
            drawGridNode(roundPos[0],roundPos[1],8);
        }
    }

    // draw();
    // // console.log(Math.abs(roundScreenPos[0]-event.offsetX))
    // // console.log(roundPos)
    // if(Math.abs(roundScreenPos[0]-event.offsetX)<5&&Math.abs(roundScreenPos[1]-event.offsetY)<5)
    // {
    //     //Is on a node
    //     let localNode = getGridNode(roundPos[0],roundPos[1])
    //     // console.log(currentHover);
    //     if(localNode != 0)
    //     {
    //         if(localNode>1)
    //         {
    //             ctx.fillStyle = `rgb(0,0,255)`;
    //             drawGridNode(roundPos[0],roundPos[1],8);
    //         }
    //         if(localNode==1)
    //         {
    //             ctx.fillStyle = `rgb(100,100,100)`;
    //             drawGridNode(roundPos[0],roundPos[1],8);
    //         }
    //         currentHover = getComponentEnd(gridPos);
    //     }
    //     else
    //     {
    //         currentHover = undefined;
    //     }
    // }
    // else
    // {
    //     currentHover = undefined;
    // }
}

function dragNode(event)
{
    if(currentHover!=undefined)
    {
        let screenPos = Matrix.vec(event.offsetX,event.offsetY);
        let gridPos = getGridPos(screenPos);
        let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
        let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));
    
        let positions = {screenPos:screenPos,gridPos:gridPos,roundPos:roundPos,roundScreenPos:roundScreenPos};
    
        comps[currentHover[0]].drag(positions,currentHover[1]);
        
        draw();
    }
}
let can = document.createElement("canvas");
const canW = 600;
const canH = 600;
can.width = canW;
can.height = canH;
document.body.appendChild(can);
let ctx = can.getContext("2d");

const gridW = 20;
const gridH = 20;
var grid = new Uint16Array(gridW*gridH);

can.addEventListener("mousemove",(event)=>{
    if(!mouse.down)
    {
        mouseHover(event);
    }
    else
    {
        dragNode(event);
    }
});
can.addEventListener("mousedown",()=>{
    mouse.down = true;
});
can.addEventListener("mouseup",()=>{
    mouse.down = false;
});

let mouse = {x:0,y:0,down:false};

let comps = [
    new Resistor(100,Matrix.vec(2,2),Matrix.vec(4,4)),
    new Resistor(200,Matrix.vec(4,4),Matrix.vec(4,6)),
    new VoltageSource(5,Matrix.vec(4,6),Matrix.vec(4,8)),
    new Ground(Matrix.vec(7,7)),
    new Wire(Matrix.vec(7,7),Matrix.vec(8,8))
];
var currentNode = 2;

draw();
