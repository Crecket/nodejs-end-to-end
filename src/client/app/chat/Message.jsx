import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import {ListItem} from 'material-ui/List';

class Message extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

    };

    userClickCallback = () => {
        // send click event to react app
        this.props.userClickCallback(this.props.from);
    };

    render() {
        var messageSender = <span>{this.props.when} - {this.props.from}</span>;
        // if its our own message, make bold
        if (this.props.ChatClient.getUsername() === this.props.from) {
            messageSender = <strong>{this.props.when} - {this.props.from}</strong>;
        }
        return (
            <ListItem
                onClick={this.userClickCallback}
                primaryText={escapeHtml(this.props.message)}
                secondaryText={messageSender}
            />
        );
    };
}

// give theme context
Message.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(Message);