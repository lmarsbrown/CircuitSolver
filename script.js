
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


var simples = [];

function getGridNode(x,y)
{
    return grid[x+y*gridW];
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

function mouseHover()
{
    
    let gridPos = getGridPos(mouse.pos);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));

    let positions = {screenPos:mouse.pos,gridPos:gridPos,roundPos:roundPos,roundScreenPos:roundScreenPos};

    currentHover = undefined;
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        let hover = hoverNode(positions,c);

        if(hover != undefined)
        {
            currentHover = [i,hover];
            break;
        }
    }
    let localNode = getGridNode(roundPos[0],roundPos[1])
    
    // console.log(currentHover);
    if(localNode != 0)
    {
        document.getElementById("DataPanel").innerText = "Node Voltage: "+ nVoltages[localNode-2];
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
    else
    {
        document.getElementById("DataPanel").innerText = "";
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
        let dragSuccess = comps[currentHover[0]].drag(positions,currentHover[1]);
        if(dragSuccess)
        {
            console.log("success")
            parseCircuit();
            solveCircuit();
        }
        
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
var currentNode = 2;
var nVoltages = [];
var dT =   10/1000;
var t = 0;

let pV = 0;
let pD = 0;
let max = 0;
    
var mouse = {pos:Matrix.vec(2),down:false};

    
var comps = [
    // new Resistor(1,Matrix.vec(1,1),Matrix.vec(5,1)),
    // new Resistor(1000,Matrix.vec(1,2),Matrix.vec(5,2)),
    // new Resistor(1000,Matrix.vec(1,3),Matrix.vec(5,3)),
    // new Resistor(1000,Matrix.vec(1,4),Matrix.vec(5,4)),
    // new Resistor(1000,Matrix.vec(1,5),Matrix.vec(5,5)),
    // new Resistor(1000,Matrix.vec(1,6),Matrix.vec(5,6)),
    // new VoltageSource(10,Matrix.vec(6,7),Matrix.vec(8,7)),
    // new CurrentSource(10,Matrix.vec(6,7),Matrix.vec(8,7)),
    new Wire(Matrix.vec(8,4),Matrix.vec(8,8)),
    // new Wire(Matrix.vec(8,8),Matrix.vec(8,12)),
    new Wire(Matrix.vec(14,4),Matrix.vec(14,8)),
    // new Wire(Matrix.vec(14,8),Matrix.vec(14,12)),
    // new VoltageSource(10,Matrix.vec(6,8),Matrix.vec(8,8)),
    // new Inductor(0,1,Matrix.vec(6,9),Matrix.vec(8,9)),
    new Inductor(0,1,Matrix.vec(8,4),Matrix.vec(14,4)),
    new Capacitor(50,0.1,Matrix.vec(8,8),Matrix.vec(14,8)),
    new Ground(Matrix.vec(8,8)),
    // new Wire(Matrix.vec(10,10),Matrix.vec(11,11)),
    // new Wire(Matrix.vec(10,10),Matrix.vec(11,11))
];


function draw()
{
    solveCircuit();
    clear();
    populateNodes();
    drawComponents();
    drawGrid();
    if(!mouse.down)
    {
        mouseHover();
    }
    
    let v = comps[2].v;
    let dV = v-pV;

    if(Math.sign(dV)!=Math.sign(pD))
    {
        max = v;
    }
    pV = v;
    pD = dV;
    t+=dT;
    if(Math.abs(v)<1)
    {
        console.log(t);
    }
    requestAnimationFrame(draw);
}


function main()
{


    can.addEventListener("mousemove",(event)=>{
        mouse.pos[0] = event.offsetX;
        mouse.pos[1] = event.offsetY;
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
    parseCircuit()
    draw();

}

