import React  from 'react';

import {List, ListItem} from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';

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
        return (
            <ListItem
                onClick={this.userClickCallback.bind(this)}
                rightIcon={<ActionInfo />}
                primaryText={this.props.username}
                key={this.props.username}
            />
        );
    };
}


export default User;