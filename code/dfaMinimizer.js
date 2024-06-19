// Helper function to parse transitions
function parseTransitions(transitionStr) {
    let transitions = {};
    let lines = transitionStr.trim().split('\n');
    for (let line of lines) {
        let [from, rest] = line.split(',');
        let [input, to] = rest.split('=');
        if (!transitions[from]) transitions[from] = {};
        transitions[from][input] = to;
    }
    return transitions;
}

// Main function to minimize DFA
function minimizeDFA() {
    let states = document.getElementById('states').value.split(',');
    let alphabet = document.getElementById('alphabet').value.split(',');
    let transitions = parseTransitions(document.getElementById('transitions').value);
    let startState = document.getElementById('start').value;
    let acceptStates = document.getElementById('accept').value.split(',');

    // Initialize partitions
    let nonAcceptStates = states.filter(state => !acceptStates.includes(state));
    let partitions = [new Set(acceptStates), new Set(nonAcceptStates)];

    // Refining partitions
    let changed = true;
    while (changed) {
        changed = false;
        let newPartitions = [];

        for (let part of partitions) {
            let splits = new Map();
            for (let state of part) {
                let signature = alphabet.map(symbol => {
                    let nextState = transitions[state] ? transitions[state][symbol] : null;
                    for (let i = 0; i < partitions.length; i++) {
                        if (partitions[i].has(nextState)) return i;
                    }
                    return -1;
                }).join(',');
                
                if (!splits.has(signature)) splits.set(signature, new Set());
                splits.get(signature).add(state);
            }

            newPartitions.push(...splits.values());
        }

        if (newPartitions.length !== partitions.length) {
            partitions = newPartitions;
            changed = true;
        }
    }

    // Create minimized DFA
    let minimizedDFA = {
        states: partitions.map((part, idx) => `Q${idx}`),
        alphabet,
        transitions: {},
        start: null,
        accept: []
    };

    let stateMap = new Map();
    partitions.forEach((part, idx) => {
        part.forEach(state => stateMap.set(state, `Q${idx}`));
    });

    minimizedDFA.start = stateMap.get(startState);
    acceptStates.forEach(state => {
        let newState = stateMap.get(state);
        if (!minimizedDFA.accept.includes(newState)) minimizedDFA.accept.push(newState);
    });

    partitions.forEach((part, idx) => {
        let repState = [...part][0];
        minimizedDFA.transitions[`Q${idx}`] = {};
        for (let symbol of alphabet) {
            if (transitions[repState] && transitions[repState][symbol]) {
                minimizedDFA.transitions[`Q${idx}`][symbol] = stateMap.get(transitions[repState][symbol]);
            }
        }
    });

    // Display minimized DFA
    document.getElementById('result').textContent = JSON.stringify(minimizedDFA, null, 2);
}
