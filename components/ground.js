
class Ground
{
    constructor(position)
    {
        

        this.connections = [
            [0,position,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = 0;
        ivMat[1] = 0;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        this.v = 0;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
    }
    updateSimple() 
    {
        this.simple.nodes[0] = this.connections[0][0];
        this.simple.nodes[1] = 0;
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
}