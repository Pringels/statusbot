import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';
import RaisedButton from 'material-ui/RaisedButton';

import { List, ListItem } from 'material-ui/List';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import { pinkA200, transparent } from 'material-ui/styles/colors';

class App extends Component {
	render() {
		return (
			<div className="App">
				<RaisedButton id="quickstart-sign-in">Sign in</RaisedButton>
				{this.props.updates.length > 0 && Object.keys(this.props.users).length > 0
					? this.props.updates.map(({ today, yesterday, blockers, user }, i) =>
							<ListItem
								primaryText={this.props.users[user].name}
								secondaryText={
									<ul>
										<li>
											Yesterday: {yesterday}
										</li>
										<li>
											Today: {today}
										</li>
										<li>
											Blockers: {blockers}
										</li>
									</ul>
								}
								secondaryTextLines={4}
							/>
						)
					: 'Connecting...'}
				<List>
					{Object.values(this.props.users).map((user, i) =>
						<ListItem
							primaryText={user.name}
							key={i}
							leftIcon={<ActionGrade color={pinkA200} />}
							insetChildren={true}
						/>
					)}
				</List>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	console.log('DATA UPDATE', state.updates);
	return {
		updates: state.updates,
		users: state.users
	};
};

export default connect(mapStateToProps)(App);
