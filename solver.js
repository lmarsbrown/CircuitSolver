

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