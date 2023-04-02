
class Inductor extends Resistor
{
    constructor(current,inductance,p1,p2)
    {
        super(inductance,p1,p2);
        this.type = Inductor;
        this.defaultSize = 2.5;

        this.v = 0;
        this.i = current;
        

        this.t = 0;
    }
    addIndependents(currentList)
    {
        currentList[this.connections[0][0]] += this.current;
        currentList[this.connections[1][0]] -= this.current;
    }
}