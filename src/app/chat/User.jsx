import React  from 'react';

class User extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

        this.userClickCallback = this.userClickCallback.bind(this);
    };

    userClickCallback() {
        // send click event to react app
        this.props.userClickCallback(this.props.username);
    };

    render() {
        if (SessionHelper.getUsername() === this.props.username) {
            return (
                <li key={this.props.username}>
                    {this.props.username}
                </li>
            );
        } else {
            return (
                <li key={this.props.username}>
                    <a onClick={this.userClickCallback.bind(this)}>{this.props.username}</a>
                </li>
            );
        }
    };
}


export default User;