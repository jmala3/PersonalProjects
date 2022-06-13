//creating level of neural network
class NeuralNetwork{
    constructor(neuronCounts) { //number of neurons in each level
        this.levels = []; //array of level
        for (let i = 0; i < neuronCounts.length - 1; i++) { //for each level specifcy input/output count
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1])); //  adding new level with neuron from i, i+ 1
        }
    }
    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(
            givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }

    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }


}



class Level {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);    //creating input array           * * * *
        this.outputs = new Array(outputCount);  //creates matching ouput array   * * * * <- network w/o connectors
        this.biases = new Array(outputCount); //values above where it will fire
        this.weights = [];
        //connect every input neuron to every output neuron -> each connection has weights (0 = none)
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount); // for each input node we will have output count level connections
        }
        Level.#randomize(this); // we are setting these to random values
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) { // go through all inputs values
            for (let j = 0; j < level.outputs.length; j++) { // going through all values in outputs
                level.weights[i][j] = Math.random() * 2 - 1; // setting every weight to rand val between (- 1, 1)
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs,level){
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }

        for(let i=0;i<level.outputs.length;i++){
            let sum=0
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i];
            }

            if(sum>level.biases[i]){
                level.outputs[i]=1;
            }else{
                level.outputs[i]=0;
            }
        }

        return level.outputs;
    }


}