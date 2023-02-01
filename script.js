


function mouseHover()
{
    let gridPos = getGridPos(mouse.pos);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));

    let positions = {screenPos:mouse.pos,gridPos:gridPos,roundPos:roundPos,roundScreenPos:roundScreenPos};

    currentNodeHover = undefined;
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        let hover = hoverNode(positions,c);

        if(hover != undefined)
        {
            currentNodeHover = [i,hover];
            break;
        }
    }
    if(currentCompHover != undefined)
    {
        currentCompHover.selected = false
        currentCompHover = undefined;
    }
    for(let i = 0; i < comps.length; i++)
    {
        if(comps[i].isHovered())
        {
            comps[i].selected = true;
            currentCompHover = comps[i];
            break;
        }
    }
    
    let localNode = getGridNode(roundPos[0],roundPos[1])
    
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
    else if(currentCompHover!=undefined)
    {
        document.getElementById("DataPanel").innerText = "Current: " + currentCompHover.i;
    }
    else
    {
        document.getElementById("DataPanel").innerText = "";
    }
}

function dragNode()
{
    let screenPos = mouse.pos;
    let gridPos = getGridPos(screenPos);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));

    let positions = {screenPos:screenPos,gridPos:gridPos,roundPos:roundPos,roundScreenPos:roundScreenPos};
    let dragSuccess = comps[currentNodeHover[0]].dragNode(positions,currentNodeHover[1]);
    if(dragSuccess)
    {
        console.log("success")
        parseCircuit();
        solveCircuit();
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
var dT =   50/(1000);
var t = 0;

let pV = 0;
let pD = 0;
let max = 0;
    
var mouse = {pos:Matrix.vec(2),downPos:Matrix.vec(2),down:false};

var dragMode = 0;
var currentNodeHover;
var currentCompHover;



    
var comps = [
];

function deleteHovered()
{
    if(currentCompHover != undefined)
    {
        comps.splice(comps.findIndex((ele)=>{ele == currentCompHover}),1);
        parseCircuit();
    }
}

function main()
{
    can.addEventListener("mousemove",(event)=>{
        mouse.pos[0] = event.offsetX;
        mouse.pos[1] = event.offsetY;
    });
    can.addEventListener("mousedown",()=>{
        mouse.down = true;
        mouse.downPos[0] = mouse.pos[0];
        mouse.downPos[1] = mouse.pos[1];
        if(dragMode != 0)
        {
            let pos = getGridPos(mouse.pos);
            let rPos1 = Matrix.vec(Math.round(pos[0]),Math.round(pos[1]));
            let rPos2 = Matrix.vec(2);
            Matrix.copyMat(rPos1,rPos2);
            rPos1[0]++;
            let newComp;
            switch(dragMode)
            {
                case 1:
                    newComp = new Wire(rPos1,rPos2);
                    break;
                case 2:
                    newComp = new Ground(rPos1);
                    break;
                case 3:
                    newComp = new Resistor(10,rPos1,rPos2);
                    break;
                case 4:
                    newComp = new VoltageSource(5,rPos1,rPos2);
                    break;
                case 5:
                    newComp = new CurrentSource(10,rPos1,rPos2);
                    break;
                case 6:
                    newComp = new Inductor(0,1,rPos1,rPos2);
                    break;
                case 7:
                    newComp = new Capacitor(0,10,rPos1,rPos2);
                    break;
            }

            comps.push(newComp);
            currentNodeHover = [comps.length-1,0];
            parseCircuit();
        }
    });
    can.addEventListener("mouseup",()=>{
        mouse.down = false;
    });
    window.addEventListener("keydown",(event)=>{
        switch(event.key)
        {
            case "Escape":
                dragMode = 0;
                break;
            case "w":
                dragMode = 1;
                break;
            case "g":
                dragMode = 2;
                break;
            case "r":
                dragMode = 3;
                break;
            case "v":
                dragMode = 4;
                break;
            case "i":
                dragMode = 5;
                break;
            case "l":
                dragMode = 6;
                break;
            case "c":
                dragMode = 7;
                break;
            case "Delete":
            case "Backspace":
                deleteHovered();
                break;
        }
        if(dragMode == 0)
        {
            can.style.cursor="";
        }
        else
        {
            can.style.cursor="crosshair";
        }
        console.log(event.key)
    })
    parseCircuit()
    draw();
}

