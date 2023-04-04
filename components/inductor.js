
class Inductor extends Resistor
{
    constructor(current,inductance,p1,p2)
    {
        super(2*inductance/dT,p1,p2);
        this.type = Inductor;
        this.defaultSize = 2.5;

        this.v = 0;
        this.i = current;
        this.current = current;
        

        this.t = 0;
    }
    updateValues(outVec,indeps,deps)
    {
        if(!this.isCollapsed())
        {
            super.updateValues(outVec);
            this.current += 2*this.i;
            this.i = this.current;
        }
    }
    updateParams(paramList)
    {
        paramList[this.connections[0][0]] += this.i;
        paramList[this.connections[1][0]] -= this.i;
    }
    initParams(paramList)
    {
        this.updateParams(paramList);
    }
}