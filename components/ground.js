
class Ground extends Component
{
    constructor(position)
    {
        
        super();
        this.connections = [
            [0,position,0]
        ];

        let node = this.connections[0][0];
        this.index = 0;
        this.dep = [
            //voltage
            [node,this.index, 1],
            //n1 current
            [this.index,node, 1]
        ];
    }
    getIndependents(count)
    {
        this.index = count;
        return [0];
    }
    getDependents()
    {
        let node = this.connections[0][0];
        this.dep[0][0] = node;
        this.dep[1][1] = node;

        this.dep[0][1] = this.index;
        this.dep[1][0] = this.index;
        return this.dep;
    }
    updateValues(outVec)
    {
        
    }
    draw()
    {
        let p = this.connections[0][1];
        let loc = getScreenPos(p);

        ctx.fillStyle=`rgb(100,100,100)`;
        ctx.fillRect(loc[0]-10,loc[1]-10,20,20);
    }

    /**
     * @param {MousePositions}positions
     */
    dragNode(positions,conn)
    {
        if(
            Matrix.vecDist(positions.roundPos, this.connections[conn][1]) > 0.1
            )
        {
            Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
            return true;
        }
        return false;
    }
    drawCurrentOverlay()
    {

    }
    isHovered()
    {
        return false;
    }
    isCollapsed()
    {
        return false;
    }
}