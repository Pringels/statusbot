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
					<input type="text" onChange={this.props.filterResults} />
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
				<div className="updatesContainer">
					{[0, -1, -2, -3, -4, -5, -6].map((offset, i) => {
						let date = new Date();
						date.setDate(date.getDate() + offset);
						if (date.getDay() === 0 || date.getDay() === 6 || date.getDay() === 7) {
							return null;
						} else {
							return (
								<div key={i} className="updates">
									<h1 className="dateLine">
										{date.toDateString()}
									</h1>
									{renderUpdates(
										date,
										this.props.updates,
										this.props.users,
										this.props.activeUsers,
										this.props.filter
									)}
								</div>
							);
						}
					})}
				</div>
			</div>
		);
	}
}

const renderUpdates = (date, updates, users, activeUsers, filter = '') => {
	return updates.length > 0 && Object.keys(users).length > 0
		? updates
				.filter(update => date.getDate() === new Date(update.date).getDate())
				.filter(
					({ yesterday = '', today = '', blockers = '' }) =>
						yesterday.toUpperCase().includes(filter.toUpperCase()) ||
						today.toUpperCase().includes(filter.toUpperCase()) ||
						blockers.toUpperCase().includes(filter.toUpperCase()) ||
						filter === ''
				)
				.map(
					({ today, yesterday, blockers, user, date }, i) =>
						activeUsers.includes(users[user]) || !activeUsers.length
							? <div key={i} className="pt-card pt-elevation-1 update">
									<h1>
										{users[user].name}
									</h1>
									<h3>
										{new Date(date).toDateString()}
									</h3>
									<div className="updateItem">
										<hr />
										<h2>Yesterday</h2>
										<p>
											{yesterday}
										</p>
									</div>
									<div className="updateItem">
										<hr />
										<h2>Today</h2>
										<p>
											{today}
										</p>
									</div>
									<div className="updateItem">
										<hr />
										<h2>Blockers</h2>
										<p>
											{blockers}
										</p>
									</div>
								</div>
							: null
				)
		: 'Connecting...';
};

const mapStateToProps = (state, ownProps) => {
	return {
		updates: state.updates,
		users: state.users,
		activeUsers: state.activeUsers,
		filter: state.filter
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		setActiveUser: user => {
			dispatch(statusBotActions.setActiveUser(user));
		},
		removeActiveUser: user => {
			dispatch(statusBotActions.removeActiveUser(user));
		},
		filterResults: e => {
			dispatch(statusBotActions.filterResults(e.target.value));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
