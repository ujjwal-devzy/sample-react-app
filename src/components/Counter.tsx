import { Component } from "react";

interface CounterState {
  count: number;
  history: number[];
}

export class Counter extends Component<{}, CounterState> {
  interval: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      count: 0,
      history: [],
    };
  }

  increment() {
    (this.state as any).count++;
    this.state.history.push(this.state.count);
    this.setState(this.state);
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.increment();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        <h2>Count: {this.state.count}</h2>
        <button onClick={this.increment}>Increment</button>
        <ul>
          {this.state.history.map((item: number, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
}
