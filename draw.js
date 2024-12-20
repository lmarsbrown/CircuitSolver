
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
function drawComponents()
{
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].draw(getScreenPos);
    }
}

function drawOverlays()
{
    for(let i = 0; i < comps.length; i++)
    {
        comps[i].drawCurrentOverlay(getScreenPos);
    }
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


let resetCirc = false;

function draw()
{
    let tempMax = 0;
    for(let i = 0; i < 1; i++)
    {
        solveCircuit();
        if(comps.length>1)
        {
            let vVal = comps[1].v;
            if(Math.abs(vVal)>tempMax)
            {
                tempMax = Math.abs(vVal);
            }
        }
    }
    clear();
    drawComponents();
    drawOverlays();
    max = tempMax;
    // drawGrid();
    if(!mouse.down)
    {
        if(dragMode == 0)
        {
            mouseHover();
        }
    }
    else
    {
        if(currentNodeHover!=undefined)
        {
            dragNode();
        }
        else if(currentCompHover != undefined)
        {
            currentCompHover.drag();
        }
    
    }
    t+=dT;
    

    requestAnimationFrame(draw);
}