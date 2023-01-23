

/**
 * @typedef Component
 * @type {Object}
 * @property {Uint16Array} nodes - Indices of the input and output nodes
 * @property {Float32Array} ivMat - Matrix transforming unknown and 1 to voltage and current.
 */

/*
In
Component Unknowns...
Node Voltages...

Matrix
Node Volt Drop - Component Volt Drop = 0
Node current sum = 0

Out
0
0
...
1
*/
class Solver
{

    /**
     * @param {Component[]} components Components in the circuit
     * @param {Number} nodeCount Number of nodes in the circuit including the reference node. 
     * @type {Float32Array}
     */
    static findCircuitMat(components,nodeCount)
    {
        let size = components.length + nodeCount;
        let outMat = Matrix.mat(size);
        let one = size-1;
        Matrix.setElement(outMat,one,one,1);
        
        for(let i = 0; i < components.length; i++)
        {
            /**@type {Component} */
            let comp = components[i];

            //Nodes
            for(let n = 0; n < 2; n++)
            {
                let node = comp.nodes[n];
                if(node != 0)
                {
                    node --;
                    let nodeI = node + components.length;
                    //Node voltage drop
                    Matrix.addElement(outMat,nodeI,i,1+n*-2);

                    //Node current
                    //Current Unknown;
                    Matrix.addElement(outMat, i  , nodeI, comp.ivMat[2]*(1+n*-2));
                    Matrix.addElement(outMat, one, nodeI, comp.ivMat[3]*(1+n*-2));
                }
            }

            //Component Voltage Drop
            //Resistive
            Matrix.addElement(outMat,i,i,-comp.ivMat[0]);
            //Constant
            Matrix.addElement(outMat,one,i,-comp.ivMat[1]);

        }
        return outMat;
    }


    /*
    ivMat:
    In: unknown, 1
    Out: voltage, current
    */

    /**
     * @param {Uint16Array} nodes Indices of in input and output nodes
     * @param {Number} resistance Resistance of the resistor
     * @type {Component}
     */
    static createResistor(nodes,resistance)
    {
        let ivMat = Matrix.mat(2);
        ivMat[0] = resistance;
        ivMat[1] = 0;
        ivMat[2] = 1;
        ivMat[3] = 0;
        

        return {nodes:nodes,ivMat:ivMat};
    }
    /**
     * @param {Uint16Array} nodes Indices of in input and output nodes
     * @param {Uint16Array} voltage Voltage of the Voltage Source
     * @type {Component}
     */
    static createVoltageSrc(nodes,voltage)
    {
        let ivMat = Matrix.mat(2);
        ivMat[0] = 0;
        ivMat[1] = -voltage;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        return {nodes:nodes,ivMat:ivMat};
    }

    /**
     * @param {Uint16Array} nodes Indices of in input and output nodes
     * @param {Uint16Array} current Current of the Current Source
     * @type {Component}
     */
    static createCurrentSrc(nodes,current)
    {
        let ivMat = Matrix.mat(2);
        ivMat[0] = 1;
        ivMat[1] = 0;
        ivMat[2] = 0;
        ivMat[3] = current;
        
        return {nodes:nodes,ivMat:ivMat};
    }

    /**
     * @param {Component[]} components Components in the circuit
     * @param {Number} nodeCount Number of nodes in the circuit including the reference node. 
     * @type {Float32Array} The unknown values of the components in order followed by the voltages of the nodes in order without ref node
     */
    static solve(components, nodeCount)
    {
        let mat = Solver.findCircuitMat(components,nodeCount);
        if(!Matrix.invert(mat,mat))
        {
            return false;
        }

        let size = components.length + nodeCount;
        let resultVec = Matrix.vec(size);
        resultVec[size-1] = 1;

        return Matrix.mulVec(mat,resultVec);
        
    }

}