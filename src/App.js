import React, { Component } from 'react';
import './App.css';

import ChartPlotView from './view/chart-plot/ChartPlotView';
import NotFoundView from './view/not-found/NotFoundView';

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/" component={ChartPlotView} />
            <Route component={NotFoundView} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
