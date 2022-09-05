import './App.css';
import React from 'react';

const numberRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const symmetryMap = {a:"b", b:"a", c:"f", f:"c", d:"e", e:"d", g:"h", h:"g"};

function validNumber(input, valid) {
  return numberRegex.test(input) && Number.isFinite(valid);
}

class Dynamics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {arrowSize: 0.1,

                  // Figure 1.6
                  input: {a:0, b:0, c:1, d:1, e:1, f:1, g:0, h:0},
                  valid: {a:0, b:0, c:1, d:1, e:1, f:1, g:0, h:0},

                  // Figure 2.1
                  symmetry: false};
  }

  setGame(a,b,c,d,e,f,g,h) {
    const input = {a,b,c,d,e,f,g,h};
    const valid = {a,b,c,d,e,f,g,h};
    let symmetry = true;
    for (const key in symmetryMap) {
      if (valid[key] !== valid[symmetryMap[key]]) {
        symmetry = false;
        break;
      }
    }
    this.setState({input, valid, symmetry});
  }

  setGameButton(label,a,b,c,d,e,f,g,h) {
    return <button type="button" onClick={this.setGame.bind(this,a,b,c,d,e,f,g,h)}>{label}</button>;
  }

  handleChange(key, e) {
    const input = e.target.value;
    const valid = Number.parseFloat(input);
    if (validNumber(input, valid)) {
      this.setState(s => ({...s, valid: ({...s.valid, [key]:valid})}));
      if (this.state.symmetry) {
        this.setState(s => ({...s, valid: ({...s.valid, [symmetryMap[key]]:valid})}));
        this.setState(s => ({...s, input: ({...s.input, [symmetryMap[key]]:input})}));
      }
    }
    this.setState(s => ({...s, input: ({...s.input, [key]:input})}));
  }

  payoffInput(key) {
    const input = this.state.input[key];
    const valid = this.state.valid[key];
    return <input className={validNumber(input, valid) ? "payoff valid" : "payoff invalid"}
                  type="number"
                  value={this.state.input[key]}
                  onChange={this.handleChange.bind(this,key)}/>;
  }

  handleSymmetryChange(e) {
    const symmetry = e.target.checked;
    this.setState({symmetry: symmetry});
    if (symmetry) {
      const updated = {};
      for (const key in symmetryMap) {
        if (!(key in updated)) {
          const input = this.state.input[key];
          const valid = this.state.valid[key];
          if (validNumber(input, valid)) {
            this.setState(s => ({...s, valid: ({...s.valid, [symmetryMap[key]]:valid})}));
            this.setState(s => ({...s, input: ({...s.input, [symmetryMap[key]]:input})}));
            updated[symmetryMap[key]] = true;
          }
        }
      }
    }
  }

  handleArrowSizeChange(e) {
    const arrowSize = Number.parseFloat(e.target.value);
    if (Number.isFinite(arrowSize) && arrowSize > 0) {
      this.setState({arrowSize: arrowSize});
    }
  }

  render() {
    const a=this.state.valid.a,
          b=this.state.valid.b,
          c=this.state.valid.c,
          d=this.state.valid.d,
          e=this.state.valid.e,
          f=this.state.valid.f,
          g=this.state.valid.g,
          h=this.state.valid.h,
          arrowSize=this.state.arrowSize;
    const n=20;
    const lines=[];
    for (let i=0; i<=n; i++) {
      const y=i/n; // Proportion of Player 1 strategy B
      for (let j=0; j<=n; j++) {
        const x=j/n; // Proportion of Player 2 strategy B
        const dy = (((1-x)*e + x*g) - ((1-x)*a + x*c)) * y*(1-y);
        const dx = (((1-y)*d + y*h) - ((1-y)*b + y*f)) * x*(1-x);
        //          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^   ^^^^^^^
        //        Payoff difference between strategies   Equation A.2
        if (dy || dx)
          lines.push(<line x1={x-dx*arrowSize} y1={y-dy*arrowSize} x2={x+dx*arrowSize} y2={y+dy*arrowSize} key={`${i},${j}`}/>); // Figure 3.3
      }
    }
    for (let j=0; j<=n; j++) {
      const x=j/n; // Proportion of strategy B
      const dx = (((1-x)*(d+e) + x*(g+h)) - ((1-x)*(a+b) + x*(c+f))) * x*(1-x);
      if (dx)
        lines.push(<line x1={x-dx*arrowSize} y1={-.13} x2={x+dx*arrowSize} y2={-.13} key={j}/>); // Figure 3.2
    }
    // This is/isn't a complementary coordination game (Section 1.4.2)
    return (
      <div className="App">
        <div className="controls">
          <table>
            <thead>
              <tr><th/><th/><th scope="col" colSpan="2">Player 2</th></tr>
              <tr><th/><th/><th scope="col">A</th><th scope="col">B</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row" rowSpan="2">Player 1</th>
                  <th scope="row">A</th>
                  <td>{this.payoffInput("a")},{this.payoffInput("b")}</td>
                  <td>{this.payoffInput("c")},{this.payoffInput("d")}</td></tr>
              <tr><th scope="row">B</th>
                  <td>{this.payoffInput("e")},{this.payoffInput("f")}</td>
                  <td>{this.payoffInput("g")},{this.payoffInput("h")}</td></tr>
            </tbody>
          </table>
          <div>
            <input type="checkbox" id="symmetry" checked={this.state.symmetry} onChange={this.handleSymmetryChange.bind(this)}/>
            <label htmlFor="symmetry">Enforce symmetry</label>
          </div>
          <div>
            This { e>a && c>g && d>b && f>h ? "is" : "is not" } a complementary coordination game.
          </div>
          <div>
            {this.setGameButton("Driving",         1,1,0,0,0,0,1,1)}
            {this.setGameButton("Bach-Stravinsky", 2,1,0,0,0,0,1,2)}
            {this.setGameButton("Dancing",         0,0,1,1,1,1,0,0)}
            <br/>
            {this.setGameButton("MFEO",            0,0,2,2,1,1,0,0)}
            {this.setGameButton("Leader-follower", 0,0,1,2,2,1,0,0)}
            {this.setGameButton("Hawk-dove",       0,0,3,1,1,3,2,2)}
          </div>
          <div>
            <input type="range" id="arrowSize" min="0.025" max="0.25" step="0.025" value={arrowSize} onChange={this.handleArrowSizeChange.bind(this)}/>
            <label htmlFor="arrowSize">Arrow size</label>
          </div>
        </div>
        <svg className="plot" viewBox="-.06 -.19 1.12 1.25" width="100%" height="100%" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg">
          <marker id="arrow" viewBox="0 -1 1 2" orient="auto-start-reverse" preserveAspectRatio="none" markerWidth="5" markerHeight="5" refX=".8">
            <path d="M1,0 l-1,-1 v2 z" fill="black"/>
          </marker>
          <g stroke="black" strokeWidth="0.002" markerEnd="url(#arrow)">
            {lines}
          </g>
        </svg>
      </div>
    );
  }
}

function App() {
  return <Dynamics/>;
}

export default App;
