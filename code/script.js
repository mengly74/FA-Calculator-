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

function checkDeterministic() {
    let isDeterministic = true;

    for (let state in fa.transitions) {
        for (let symbol in fa.transitions[state]) {
            if (fa.transitions[state][symbol].length > 1) {
                isDeterministic = false;
                break;
            }
        }
    }

    document.getElementById('deterministic-result').textContent = isDeterministic ? 'The FA is deterministic.' : 'The FA is non-deterministic.';
}

function testString() {
    let input = document.getElementById('test-string').value;
    let currentState = fa.startState;

    for (let i = 0; i < input.length; i++) {
        let symbol = input[i];
        if (fa.transitions[currentState] && fa.transitions[currentState][symbol]) {
            currentState = fa.transitions[currentState][symbol][0];
        } else {
            document.getElementById('acceptance-result').textContent = 'The string is not accepted by the FA.';
            return;
        }
    }

    let isAccepted = fa.acceptStates.includes(currentState);
    document.getElementById('acceptance-result').textContent = isAccepted ? 'The string is accepted by the FA.' : 'The string is not accepted by the FA.';
}
