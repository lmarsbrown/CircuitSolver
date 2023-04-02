/*
Make it so that you can edit exiting fixed constraints easily. Then add the current to the existing current constraints for the nodes
*/

class CurrentSource extends Component 
{
    constructor(current,p1,p2)
    {
        super();
        this.type = CurrentSource;
        this.defaultSize = 2;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];
        
        this.v = 0;
        this.i = current;
        
        this.t = 0;
        
        this.current = current;
        this.iInd = 0;

        let n1 = this.connections[0][0]; 
        let n2 = this.connections[1][0]; 
    }
    updateValues(outVec,indeps,deps)
    {
        if(!this.isCollapsed())
        {
            super.updateValues(outVec);
        }
    }
    updateParams(paramList)
    {
        paramList[this.connections[0][0]] += this.current;
        paramList[this.connections[1][0]] -= this.current;
    }
    initParams(paramList)
    {
        this.updateParams(paramList);
    }
}