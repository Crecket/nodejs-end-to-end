import React  from 'react';
import Message from './Message.jsx';

import RaisedButton from 'material-ui/RaisedButton';
import {List} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';

class MessageList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

    };

    render() {
        var fn = this;
        return (
            <div className="col-xs-12">
                <div className="row">
                    <div className="panel panel-success">
                        <div className="panel-heading">
                            Messages
                        </div>
                        <div className="panel-body">
                            <List className="userListReact">
                                {Object.keys(this.props.messageList).map(function (key) {
                                    return <Message
                                        key={key}
                                        messageKey={key}
                                        from={fn.props.messageList[key]['from']}
                                        when={fn.props.messageList[key]['when']}
                                        message={fn.props.messageList[key]['message']}/>;
                                })}
                            </List>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default MessageList;