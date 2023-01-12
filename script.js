class Circuit
{
    constructor()
    {
        this.nodes = [];
        this.components = [];
    }
    createNode(src,voltage=0)
    {
        let node = {index:this.nodes.length,voltage:voltage,src:src};
        if(!src)
        {
            this.nodes.push(node);
        }
        return node;
    }
    
    createComponent(node1,node2,val)
    {
        let c = {n1:node1,n2:node2,val:val};
        this.components.push(c);
        return c;
    }
    getLinear()
    {
        let size = this.components.length+this.nodes.length+1;
        let cLen = this.components.length;
        let mat = Matrix.mat(size);
        let vec = Matrix.vec(size);
        Matrix.setElement(mat,size-1,size-1,1);
        vec[size-1] = 1;
        for(let r = 0; r < this.components.length; r++)
        {
            let comp = this.components[r];
            Matrix.setElement(mat,r,r,comp.val);
            if(!comp.n1.src)
            {
                let ind = cLen+comp.n1.index;
                Matrix.setElement(mat,ind,r,-1);
                Matrix.setElement(mat,r,ind,-1);
            }
            else
            {
                vec[r] = comp.n1.voltage;
            }

            if(!comp.n2.src)
            {
                let ind = cLen+comp.n2.index;
                Matrix.setElement(mat,ind,r,1);
                Matrix.setElement(mat,r,ind,1);
            }
            else
            {
                vec[r] = -comp.n2.voltage;
            }
        }
        return [mat,vec];
    }
}

let circ = new Circuit();
let vin = circ.createNode(true,5);
let n1 = circ.createNode(false);
let n2 = circ.createNode(false);
let gnd = circ.createNode(true,0);

circ.createComponent(vin,n1,1000);

circ.createComponent(n1,gnd,820);
circ.createComponent(n1,n2,1500);

circ.createComponent(n2,gnd,470);

let lin = circ.getLinear();
Matrix.invert(lin[0],lin[0]);
let out = Matrix.mulVec(lin[0],lin[1])

Matrix.logMat(lin[0]);
Matrix.logVec(out);