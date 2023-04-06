


function mouseHover()
{
    let gridPos = getGridPos(mouse.pos);
    let roundPos = [Math.round(gridPos[0]),Math.round(gridPos[1])];
    let roundScreenPos = getScreenPos(Matrix.vec(roundPos[0],roundPos[1]));

    let positions = {screenPos:mouse.pos,gridPos:gridPos,roundPos:roundPos,roundScreenPos:roundScreenPos};
    
    if(currentCompHover != undefined)
    {
        if(!currentCompHover.isHovered())
        {
            currentCompHover.selected = false
            currentCompHover = undefined;
            currentCompHoverIndex = undefined;
        }
    }

    if(currentCompHover == undefined)
    {
        for(let i = 0; i < comps.length; i++)
        {
            if(comps[i].isHovered())
            {
                comps[i].selected = true;
                currentCompHover = comps[i];
                currentCompHoverIndex = i;
                break;
            }
        }
    }

    currentNodeHover = undefined;
    for(let i = 0; i < comps.length; i++)
    {
        let c = comps[i];
        if(c == currentCompHover)
        {
            let hover = hoverNode(positions,c);
    
            if(hover != undefined)
            {
                currentNodeHover = [i,hover];
                break;
            }
        }
    }

    if(currentNodeHover!=undefined)
    {
        let localNode = getGridNode(roundPos[0],roundPos[1])
        document.getElementById("DataPanel").innerText = "Node Voltage: "+ fixedVals[localNode-1];
        ctx.fillStyle = `rgb(0,0,255)`;
        drawGridNode(roundPos[0],roundPos[1],8);
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
var dT =   10/(1000);
var t = 0;

let pV = 0;
let pD = 0;
let max = 0;
    
var mouse = {pos:Matrix.vec(2),downPos:Matrix.vec(2),down:false};

var dragMode = 0;
var currentNodeHover;
var currentCompHover;
var currentCompHoverIndex;
var currentEditing;





/**
@type {Array<Component>}
*/    
var comps = [
];
function deleteHovered()
{
    if(currentCompHover != undefined)
    {
        comps.splice(currentCompHoverIndex,1);
        currentCompHover = undefined;
        currentCompHoverIndex = undefined;
        parseCircuit();
    }
}

function main()
{
    can.addEventListener("mousemove",(event)=>{
        mouse.pos[0] = event.offsetX;
        mouse.pos[1] = event.offsetY;
    });
    can.addEventListener("mousedown",(event)=>{
        if(event.button == 0)
        {
            mouse.down = true;
            mouse.downPos[0] = mouse.pos[0];
            mouse.downPos[1] = mouse.pos[1];
            if(dragMode != 0)
            {
                let pos = getGridPos(mouse.pos);
                let rPos1 = Matrix.vec(Math.round(pos[0]),Math.round(pos[1]));
                let rPos2 = Matrix.vec(2);
                Matrix.copyMat(rPos1,rPos2);
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
                        newComp = new Resistor(6,rPos1,rPos2);
                        break;
                    case 4:
                        newComp = new VoltageSource(12,rPos1,rPos2);
                        break;
                    case 5:
                        newComp = new CurrentSource(10,rPos1,rPos2);
                        break;
                    case 6:
                        newComp = new Inductor(0,10,rPos1,rPos2);
                        break;
                    case 7:
                        newComp = new Capacitor(0,0.1,rPos1,rPos2);
                        break;
                }
    
                comps.push(newComp);
                if(dragMode!=2)
                {
                    currentNodeHover = [comps.length-1,1];
                }
                else
                {
                    currentNodeHover = [comps.length-1,0];
                }
                parseCircuit();
            }

        }
        else if(event.button == 2)
        {
        }
    });
    can.addEventListener("mouseup",(event)=>{
        if(event.button == 0)
        {
            mouse.down = false;
            if(dragMode!=0)
            {
                if(comps[currentNodeHover[0]].isCollapsed())
                {
                    comps.splice(currentNodeHover[0],1);
                }
                parseCircuit();
            }
        }
        if(event.button == 2)
        {
            if(currentEditing != undefined)
            {
                currentEditing.editing = false;
                currentEditing = undefined;
            }
            if(currentCompHover != undefined)
            {
                currentCompHover.editing = true;
                currentEditing = currentCompHover;
            }
        }
    });
    window.addEventListener("keydown",(event)=>{
        switch(event.key)
        {
            case "Escape":
                dragMode = 0;
                if(currentEditing != undefined)
                {
                    currentEditing.editing = false;
                    currentEditing = undefined;
                }
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
            if(currentCompHover != undefined)
            {
                currentCompHover.selected = false;
                currentCompHover = undefined;
                currentCompHoverIndex = undefined;
            }
        }
        console.log(event.key)
    })

    can.oncontextmenu = ()=>{return false;};
    parseCircuit()
    draw();
}