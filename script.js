
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
    drawGrid();
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


function mouseHover(event)
{
    let gridPos = getGridPos(Matrix.vec(event.offsetX,event.offsetY));
    let end = getComponentEnd(gridPos);
    // console.log(end)
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));
    // document.getElementById("mousething").innerText  = "rX: "+roundPos[0]+", "+"rY: "+roundPos[1]+"\n";
    // document.getElementById("mousething").innerText += "X: " +event.offsetX+ ", "+"Y: "+event.offsetY+"\n";
    draw();
    // console.log(Math.abs(roundScreenPos[0]-event.offsetX))
    // console.log(roundPos)
    if(Math.abs(roundScreenPos[0]-event.offsetX)<5&&Math.abs(roundScreenPos[1]-event.offsetY)<5)
    {
        //Is on a node
        let localNode = getGridNode(roundPos[0],roundPos[1])
        // console.log(currentHover);
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
    let node = getGridNode(roundPos[0],roundPos[1]);

    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        for(let j = 0; j < c.connections.length; j++)
        {
            if(c.connections[j][0] == node-1)
            {
                return [i,j];
            }
        }
    }
}

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
];
var currentNode = 2;

draw();
