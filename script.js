
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
            console.log(conn);
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
    new Resistor(100,Matrix.vec(2,2),Matrix.vec(4,4)),
    new Resistor(200,Matrix.vec(4,4),Matrix.vec(4,6)),
];
var currentNode = 2;

draw();
