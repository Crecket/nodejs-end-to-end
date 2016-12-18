import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Message from './Message.jsx';

import {List} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

const styles = {};

class MessageList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

    };

    render() {
        return (
            <List className="userListReact">
                <Subheader>Messages</Subheader>
                {Object.keys(this.props.messageList).map( (key)=> {
                    return <Message
                        key={key}
                        messageKey={key}
                        ChatClient={this.props.ChatClient}
                        userClickCallback={this.props.userClickCallback}
                        from={this.props.messageList[key]['from']}
                        when={this.props.messageList[key]['when']}
                        message={this.props.messageList[key]['message']}/>;
                })}
            </List>
        );
    };
}

// give theme context
MessageList.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default MessageList;