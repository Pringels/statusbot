import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';
import './normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import * as Blueprint from '@blueprintjs/core';
import * as statusBotActions from './actions/statusBot';

class App extends Component {
	render() {
		return (
			<div className="App">
				<div className="Header">
					<button id="quickstart-sign-in">Sign in</button>
				</div>
				<ul className="users">
					{Object.values(this.props.users).map((user, i) =>
						<li
							className={`user ${this.props.activeUsers.includes(user)
								? 'is-active'
								: ''}`}
							onClick={
								this.props.activeUsers.includes(user)
									? () => this.props.removeActiveUser(user)
									: () => this.props.setActiveUser(user)
							}
							key={i}
						>
							{user.name}
						</li>
					)}
				</ul>
				<div className="updates">
					{this.props.updates.length > 0 && Object.keys(this.props.users).length > 0
						? this.props.updates.map(
								({ today, yesterday, blockers, user, date }, i) =>
									this.props.activeUsers.includes(this.props.users[user]) ||
									!this.props.activeUsers.length
										? <div key={i} className="pt-card pt-elevation-1 update">
												<h1>
													{this.props.users[user].name}
												</h1>
												<h3>
													{new Date(date).toDateString()}
												</h3>
												<div className="updateItem pt-card pt-elevation-1">
													<h2>Yesterday</h2>
													<p>
														{yesterday}
													</p>
												</div>
												<div className="updateItem pt-card pt-elevation-1">
													<h2>Today</h2>
													<p>
														{today}
													</p>
												</div>
												<div className="updateItem pt-card pt-elevation-1">
													<h2>Blockers</h2>
													<p>
														{blockers}
													</p>
												</div>
											</div>
										: null
							)
						: 'Connecting...'}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	console.log('DATA UPDATE', state.updates);
	return {
		updates: state.updates,
		users: state.users,
		activeUsers: state.activeUsers
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		setActiveUser: user => {
			dispatch(statusBotActions.setActiveUser(user));
		},
		removeActiveUser: user => {
			dispatch(statusBotActions.removeActiveUser(user));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
