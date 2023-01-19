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


let comps = [
    newVSrc    (Matrix.vec(2,4),Matrix.vec(2,2),5),
    newResistor(Matrix.vec(2,2),Matrix.vec(4,2),100),
    newResistor(Matrix.vec(4,2),Matrix.vec(5,4),100)
];
var currentNode = 2;

setRefNode(2,4);
setRefNode(5,4);

let refNodes = [
    Matrix.vec(2,4),
    Matrix.vec(5,4)
];
populateNodes();
draw();
let solved = Solver.solve(comps,currentNode-1);
Matrix.logVec(solved);


let currentHover;

let mouse = {x:0,y:0,down:false}
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

function mouseHover(event)
{
    let gridPos = getGridPos(event.offsetX,event.offsetY);
    let end = getComponentEnd(gridPos);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(roundPos[0],roundPos[1]);
    // document.getElementById("mousething").innerText  = "rX: "+roundPos[0]+", "+"rY: "+roundPos[1]+"\n";
    // document.getElementById("mousething").innerText += "X: " +event.offsetX+ ", "+"Y: "+event.offsetY+"\n";
    draw();
    if(Math.abs(roundScreenPos[0]-event.offsetX)<5&&Math.abs(roundScreenPos[1]-event.offsetY)<5)
    {
        //Is on a node
        let localNode = accessGridNode(roundPos[0],roundPos[1])
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
            currentHover = getComponentEnd(gridPos);
            console.log(currentHover);
        }
        else
        {
            currentHover = undefined;
        }
    }
    else
    {
        currentHover = undefined;
    }
}

function getComponentEnd(gridPos)
{
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let node = accessGridNode(roundPos[0],roundPos[1]);

    for(let i = 0; i < comps.length; i++)
    {
        for(let j = 0; j < 2; j++)
        {
            if(comps[i].nodes[j] == node-1)
            {
                return [i,j];
            }
        }
    }
}



// function mouseHover(event)
// {

//     let gridPos = getGridPos(event.offsetX,event.offsetY);
//     let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
//     let roundScreenPos = getScreenPos(roundPos[0],roundPos[1]);
//     document.getElementById("mousething").innerText  = "rX: "+roundPos[0]+", "+"rY: "+roundPos[1]+"\n";
//     // document.getElementById("mousething").innerText += "X: " +event.offsetX+ ", "+"Y: "+event.offsetY+"\n";
//     draw();
//     if(Math.abs(roundScreenPos[0]-event.offsetX)<5&&Math.abs(roundScreenPos[1]-event.offsetY)<5)
//     {
//         //Is on a node
//         let localNode = accessGridNode(roundPos[0],roundPos[1])
//         if(localNode != 0)
//         {
//             if(localNode>1)
//             {
//                 ctx.fillStyle = `rgb(0,0,255)`;
//                 drawGridNode(roundPos[0],roundPos[1],8);
//             }
//             if(localNode==1)
//             {
//                 ctx.fillStyle = `rgb(100,100,100)`;
//                 drawGridNode(roundPos[0],roundPos[1],8);
//             }
//             currentHover = endMap[roundPos[0]][roundPos[1]][0];
//         }
//         else
//         {
//             currentHover = undefined;
//         }
//     }
//     else
//     {
//         currentHover = undefined;
//     }
// }

function dragNode(event)
{

    let gridPos = getGridPos(event.offsetX,event.offsetY);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(roundPos[0],roundPos[1]);

    if(currentHover != undefined)
    {
        if(currentHover[1] == 0)
        {
            comps[currentHover[0]].p1 = roundPos;
            draw();
        }
        else
        {
            comps[currentHover[0]].p2 = roundPos;
            draw();
        }
    }
}



function draw()
{
    clear();
    populateNodes();
    drawComponents();
    drawGrid();
}


function newResistor(p1,p2,resistance)
{
    let c = Solver.createResistor(Matrix.vec(0,0),resistance);
    
    c.name = "Resistor";
    c.type = 0;
    c.unknownUnit = "A";
    c.valUnit = "Ohm";
    c.p1 = p1;
    c.p2 = p2;
    
    return c;
}

function setRefNode(vec)
{
    grid[vec[0]+vec[1]*gridW] = 1;
}

function populateNodes()
{
    currentNode = 2;
    for(let i = 0; i < gridW*gridH; i++)
    {
        grid[i] = 0;
    }
    for(let i = 0; i < refNodes.length; i++)
    {
        setRefNode(refNodes[i]);
    }
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].nodes[0] = getGridNode(comps[i].p1[0],comps[i].p1[1]);
        comps[i].nodes[1] = getGridNode(comps[i].p2[0],comps[i].p2[1]);
    }
}

function getGridNode(x,y)
{
    let node = grid[x+y*gridW];
    if(node==0)
    {
        grid[x+y*gridW] = currentNode;
        currentNode++;
        return currentNode - 2;
    }
    else
    {
        return node-1;
    }
}
function accessGridNode(x,y)
{
    return  grid[x+y*gridW];
}

function getScreenPos(x,y)
{
    return [(x+1)*(canW)/(gridW+1),(y+1)*(canH)/(gridH+1)];
}

function getGridPos(x,y)
{
    
    return [x*(gridW+1)/(canW)-1,y*(gridH+1)/(canH)-1];
}

function clear()
{
    ctx.clearRect(0,0,canW,canH);
    ctx.fillStyle = `black`;
    ctx.fillRect(0,0,canW,canH);
}

function drawGridNode(x,y,rad)
{
    let coord = getScreenPos(x,y);
    ctx.fillRect(coord[0]-rad,coord[1]-rad,rad*2,rad*2);
}
function drawGrid()
{
    for(let y = 0; y < gridH; y++)
    {
        for(let x = 0; x < gridW; x++)
        {
            if(accessGridNode(x,y) > 1)
            {
                ctx.fillStyle = `rgb(0,0,255)`;
                drawGridNode(x,y,5);
            }
            if(accessGridNode(x,y) == 1)
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
        drawComponent(comps[i]);
    }
}

function drawComponent(comp)
{
    let start = getScreenPos(comp.p1[0],comp.p1[1]);
    let end = getScreenPos(comp.p2[0],comp.p2[1]);
    // let diff = Matrix.subVecs(comp.p1,comp.p0);
    // diff = Matrix.scaleVec(diff,1/3);
    // let perpDiff;

    if(comp.type == 0)
    {
        ctx.strokeStyle=`rgb(255,100,50)`;
    }
    else if(comp.type == 1)
    {
        ctx.strokeStyle=`rgb(100,255,50)`;
    }
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(start[0],start[1]);
    ctx.lineTo(end[0],end[1]);
    ctx.stroke();
}

function newResistor(p1,p2,resistance)
{
    let c = Solver.createResistor(Matrix.vec(0,0),resistance);
    
    c.name = "Resistor";
    c.type = 0;
    c.unknownUnit = "A";
    c.valUnit = "Ohm";
    c.p1 = p1;
    c.p2 = p2;
    
    return c;
}

function newVSrc(p1,p2,voltage)
{
    let c = Solver.createVoltageSrc(Matrix.vec(0,0),voltage);
    
    c.name = "Voltage Source";
    c.type = 1;
    c.unknownUnit = "A";
    c.valUnit = "V";
    c.p1 = p1;
    c.p2 = p2;

    return c;
}