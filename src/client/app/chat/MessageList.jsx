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
        var fn = this;
        return (
            <List className="userListReact">
                <Subheader>Messages</Subheader>
                {Object.keys(this.props.messageList).map(function (key) {
                    return <Message
                        key={key}
                        messageKey={key}
                        userClickCallback={fn.props.userClickCallback}
                        from={fn.props.messageList[key]['from']}
                        when={fn.props.messageList[key]['when']}
                        message={fn.props.messageList[key]['message']}/>;
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