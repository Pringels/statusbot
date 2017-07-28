import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	render() {
		return (
			<div className="App">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
				<button id="quickstart-sign-in">Sign in</button>
				{this.props.updates.length > 0
					? this.props.updates.map(({ today, yesterday, blockers, user }, i) =>
							<div key={i}>
								<h2>
									Yesterday: {yesterday}
								</h2>
								<h2>
									Today: {today}
								</h2>
								<h2>
									Blockers: {blockers}
								</h2>
								<h3>
									{user}
								</h3>
							</div>
						)
					: 'Connecting...'}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	console.log('DATA UPDATE', state.updates);
	return {
		updates: state.updates
	};
};

export default connect(mapStateToProps)(App);
