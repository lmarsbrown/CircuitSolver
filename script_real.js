let can = document.createElement("canvas");
const canW = 600;
const canH = 600;
can.width = canW;
can.height = canH;
document.body.appendChild(can);
let ctx = can.getContext("2d");

const gridW = 10;
const gridH = 10;
var grid = new Uint16Array(gridW*gridH);

let circ = new Circuit();
let nodes = [];

circ.components = [
    newComponent(Matrix.vec(2,2),Matrix.vec(4,2),100,0),
    newComponent(Matrix.vec(4,2),Matrix.vec(4,4),100,1)
];

drawGrid();
drawComponents();
createSrcNode(2,2,5);
createSrcNode(4,4,0);
populateNodes();
drawNodes();
circ.solve();



function drawGrid()
{
    ctx.clearRect(0,0,canW,canH);
    ctx.fillStyle = `black`;
    ctx.fillRect(0,0,canW,canH);
    ctx.fillStyle = `rgb(255,255,190)`;
    const sqSize = 6;
    const sqRad = sqSize/2;
    for(let y = 0; y < gridH; y++)
    {
        for(let x = 0; x < gridW; x++)
        {
            let coord = getScreenPos(x,y);
            ctx.fillRect(coord[0]-sqRad,coord[1]-sqRad,sqSize,sqSize);
        }
    }
}

function populateNodes()
{
    for(let i = 0; i < circ.components.length; i++)
    {
        circ.components[i].n1 = getGridNode(circ.components[i].p1[0],circ.components[i].p1[1]);
        circ.components[i].n2 = getGridNode(circ.components[i].p2[0],circ.components[i].p2[1]);
        
    }
}

function drawNodes()
{
    const sqSize = 10;
    const sqRad = sqSize/2;
    const maxVolt = 5;
    for(let i = 0; i < nodes.length; i++)
    {
        let node = nodes[i];
        if(node.src)
        {
            if(node.voltage>=0)
            {
                let c = (node.voltage/maxVolt);
                ctx.fillStyle = `rgb(${200-c*200},${200+c*55},${200-Math.abs(c)*200})`;
            }
            else
            {
                let c = (node.voltage/maxVolt);
                ctx.fillStyle = `rgb(${200+c*55},${200-c*200},${200-Math.abs(c)*200})`;
            }
        }
        else
        {
            ctx.fillStyle = `rgb(0,0,255)`;
        }
        let coord = getScreenPos(node.x,node.y);
        ctx.fillRect(coord[0]-sqRad,coord[1]-sqRad,sqSize,sqSize);
    }
}
function drawComponents()
{
    for(let i = 0; i < circ.components.length; i++)
    {
        drawComponent(circ.components[i]);
    }
}
function drawComponent(comp)
{
    let start = getScreenPos(comp.p1[0],comp.p1[1]);
    let end = getScreenPos(comp.p2[0],comp.p2[1]);
    // let diff = Matrix.subVecs(comp.p1,comp.p0);
    // diff = Matrix.scaleVec(diff,1/3);
    // let perpDiff;

    ctx.strokeStyle=`rgb(255,100,50)`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(start[0],start[1]);
    ctx.lineTo(end[0],end[1]);
    ctx.stroke();
}

function createSrcNode(x,y,voltage)
{
    let node = circ.createNode(true,voltage);
    setGridNode(x,y,node);
}

function getGridNode(x,y)
{
    let index = grid[x+y*gridW];
    if(index==0)
    {
        let node = circ.createNode(false,0.0);
        setGridNode(x,y,node);
        return node;
    }
    else
    {
        return nodes[index-1];
    }
}
function setGridNode(x,y,node)
{
    node.x = x;
    node.y = y;
    nodes.push(node);
    grid[x+y*gridW] = nodes.length;
}

function getScreenPos(x,y)
{
    return [(x+1)*(canW)/(gridW+1),(y+1)*(canH)/(gridH+1)];
}


function newComponent(p1,p2,val,index)
{
    let c = 
    {
        n1:{},
        n2:{},
        val:val,
        name:"Resistor",
        unknownUnit:"A",
        valUnit:"Ohm",
        p1:p1,
        p2:p2,

        //Unknown is current
        //Voltage is current*val
        vVec:[val,0],
        //Current is unknown
        iVec:[1,0]
    };

    
    return c;
}