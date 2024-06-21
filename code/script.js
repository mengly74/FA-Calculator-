let fa = {
    states: [],
    alphabet: [],
    startState: '',
    acceptStates: [],
    transitions: {}
};

function designFA() {
    fa.states = document.getElementById('states').value.split(',').map(s => s.trim());
    fa.alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim());
    fa.startState = document.getElementById('start-state').value.trim();
    fa.acceptStates = document.getElementById('accept-states').value.split(',').map(s => s.trim());
    fa.transitions = {};

    let transitions = document.getElementById('transitions').value.split('\n');
    transitions.forEach(transition => {
        let [from, rest] = transition.split(',');
        let [symbol, to] = rest.split('->');
        from = from.trim();
        symbol = symbol.trim();
        to = to.trim();

        if (!fa.transitions[from]) {
            fa.transitions[from] = {};
        }

        if (!fa.transitions[from][symbol]) {
            fa.transitions[from][symbol] = [];
        }

        fa.transitions[from][symbol].push(to);
    });

    alert('Finite Automaton designed successfully!');
}

// Checking if The FA is DFA or not
function checkDeterministic() {
    let isDeterministic = true;

    for (let state in fa.transitions) {
        for (let symbol in fa.transitions[state]) {
            // Check if there if there is more than one transition 
            // for a symbol from a state
            if (fa.transitions[state][symbol].length > 1) {
                isDeterministic = false;
                break;  
            }
            // check if there are epsilon ('eps') transitions
            if (symbol === 'eps') {
                isDeterministic = false;
                break;
            }
        }
        if (!isDeterministic) break;
    }

    let resultElement = document.getElementById('deterministic-result');
    if (isDeterministic) {
        resultElement.textContent = 'The FA is deterministic.';
        resultElement.className = 'success';
    } else {
        resultElement.textContent = 'The FA is non-deterministic.';
        resultElement.className = 'error';
    }
}

// Test String Acceptance
function testString() {
    let input = document.getElementById('test-string').value;
    let currentState = fa.startState;

    for (let i = 0; i < input.length; i++) {
        let symbol = input[i];
        if (fa.transitions[currentState] && fa.transitions[currentState][symbol]) {
            currentState = fa.transitions[currentState][symbol][0];
        } else {
            let resultElement = document.getElementById('acceptance-result');
            resultElement.textContent = 'The string is not accepted by the FA.';
            resultElement.className = 'error';
            return;
        }
    }

    let isAccepted = fa.acceptStates.includes(currentState);
    let resultElement = document.getElementById('acceptance-result');
    if (isAccepted) {
        resultElement.textContent = 'The string is accepted by the FA.';
        resultElement.className = 'success';
    } else {
        resultElement.textContent = 'The string is not accepted by the FA.';
        resultElement.className = 'error';
    }
}

function parseTransitions(transitionStr) {
    let transitions = {};
    let lines = transitionStr.trim().split('\n');
    for (let line of lines) {
        let [from, rest] = line.split(',');
        let [input, to] = rest.split('->');
        if (!transitions[from]) transitions[from] = {};
        transitions[from][input] = to;
    }
    return transitions;
}

function convertNFAtoDFA() {
    let states = fa.states;
    let alphabet = fa.alphabet;
    let transitions = fa.transitions;
    let startState = fa.startState;
    let acceptStates = fa.acceptStates;

    let dfaStates = [];
    let dfaTransitions = {};
    let dfaStartState = [startState];
    let dfaAcceptStates = [];

    let unmarkedStates = [dfaStartState];
    let markedStates = [];

    while (unmarkedStates.length > 0) {
        let current = unmarkedStates.pop();
        markedStates.push(current);

        let stateName = current.sort().join(',');
        if (!dfaStates.includes(stateName)) {
            dfaStates.push(stateName);
        }

        if (current.some(state => acceptStates.includes(state))) {
            dfaAcceptStates.push(stateName);
        }

        for (let symbol of alphabet) {
            let nextStates = [];
            for (let state of current) {
                if (transitions[state] && transitions[state][symbol]) {
                    nextStates = nextStates.concat(transitions[state][symbol]);
                }
            }
            nextStates = [...new Set(nextStates)];

            let nextStateName = nextStates.sort().join(',');
            if (nextStateName && !dfaStates.includes(nextStateName)) {
                unmarkedStates.push(nextStates);
            }

            if (!dfaTransitions[stateName]) dfaTransitions[stateName] = {};
            dfaTransitions[stateName][symbol] = nextStateName;
        }
    }

    let result = `States: ${dfaStates.join(', ')}\n`;
    result += `Alphabet: ${alphabet.join(', ')}\n`;
    result += `Start State: ${dfaStartState.join(', ')}\n`;
    result += `Accept States: ${dfaAcceptStates.join(', ')}\n`;
    result += `Transitions:\n`;
    for (let state in dfaTransitions) {
        for (let symbol in dfaTransitions[state]) {
            result += `  ${state} --${symbol}--> ${dfaTransitions[state][symbol]}\n`;
        }
    }

    document.getElementById('nfa-dfa-result').innerText = result;
}

function minimizeDFA() {
    let states = fa.states;
    let alphabet = fa.alphabet;
    let transitions = parseTransitions(document.getElementById('transitions').value);
    let startState = fa.startState;
    let acceptStates = fa.acceptStates;

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
        states: partitions.map(part => [...part].join(',')),
        alphabet,
        transitions: {},
        startState: null,
        acceptStates: []
    };

    let stateMap = new Map();
    partitions.forEach(part => {
        let stateName = [...part].join(',');
        part.forEach(state => stateMap.set(state, stateName));
    });

    minimizedDFA.startState = stateMap.get(startState);
    acceptStates.forEach(state => {
        let newState = stateMap.get(state);
        if (!minimizedDFA.acceptStates.includes(newState)) minimizedDFA.acceptStates.push(newState);
    });

    partitions.forEach(part => {
        let repState = [...part][0];
        let stateName = [...part].join(',');
        minimizedDFA.transitions[stateName] = {};
        for (let symbol of alphabet) {
            if (transitions[repState] && transitions[repState][symbol]) {
                minimizedDFA.transitions[stateName][symbol] = stateMap.get(transitions[repState][symbol]);
            }
        }
    });

    // Display minimized DFA
    document.getElementById('dfa-result').textContent = JSON.stringify(minimizedDFA, null, 2);
}

