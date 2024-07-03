class Diode extends Resistor
{
    static symbol;
    constructor(resistance,p1,p2)
    {
        super(resistance,p1,p2);
        this.type = Diode;
        this.emmision_coeff = 25.0;
        this.i_sat = 1/1000;
        this.temp = 300;
        this.i_cont = 0;
        this.vD = 0;
    }

    updateValues(outVec,indeps,deps)
    {
        if(!this.isCollapsed())
        {
            super.updateValues(outVec);
            this.i = this.i_cont;
        }
    }
    updateParams(paramList)
    {
        let current_offset = this.i_cont-this.vD/this.resistance;
        paramList[this.connections[0][0]] += current_offset;
        paramList[this.connections[1][0]] -= current_offset;
    }

    calcRealNodeCurrents(testDeps, testIndeps)
    {
        let vT = ( 1.380649 * 10**(-4) ) * this.temp / 1.602176634;
        let n1 = this.connections[0][0]; 
        let n2 = this.connections[1][0]; 

        let vD = testIndeps[n1]-testIndeps[n2];
        let i = this.i_sat*(Math.exp(vD/(this.emmision_coeff*vT))-1);
        testDeps[n2] += i;
        testDeps[n1] -= i;
        this.i_cont = i;
        this.vD = vD;

        let derivative = this.i_sat*Math.exp(vD/(this.emmision_coeff*vT))/(this.emmision_coeff*vT);
        this.resistance = 1/derivative;
        this.constrnts[0][2] = -derivative;
        this.constrnts[1][2] =  derivative;
        this.constrnts[2][2] =  derivative;
        this.constrnts[3][2] = -derivative;
    }
}