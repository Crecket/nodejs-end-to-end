import React  from 'react';

import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, red350, greenA200} from 'material-ui/styles/colors';
import {ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';

const smallIconStyle = {
    width: 36,
    height: 36,
};

class Message extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

        this.callback = this.callback.bind(this);
    };

    callback() {
        this.props.deleteCallback(this.props.messageKey);
    };

    render() {
        var messageSender = <span>{this.props.when} {this.props.from}</span>;
        // if its our own message, make bold
        if (SessionHelper.getUsername() === this.props.from) {
            messageSender = <strong>{this.props.when} {this.props.from}</strong>;
        }
        return (
            <ListItem primaryText="Calls" rightToggle={<Toggle />} >
                {messageSender}: {escapeHtml(this.props.message)}
                <IconButton
                    onClick={this.callback.bind(this)}
                    label="Disabled"
                    color={red500}
                    hoverColor={red350}
                    tooltip="Remove this message"
                    className="pull-right"
                    tooltipPosition="bottom-right"
                    iconClassname="muidocs-icon-custom-clear_all"
                />
            </ListItem>
        );
    };
}

export default Message;