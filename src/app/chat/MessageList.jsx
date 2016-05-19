import React  from 'react';
import Message from './Message.jsx';

class MessageList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

        this.deleteCallback = this.deleteCallback.bind(this);
        this.deleteAllCallback = this.deleteAllCallback.bind(this);
    };

    deleteCallback(deleteKey) {
        this.props.removeMessage(deleteKey);
    };

    deleteAllCallback() {
        this.props.removeMessage();
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
                            <ul className="userListReact">
                                {Object.keys(this.props.messageList).map(function (key) {
                                    return <Message
                                        key={key}
                                        messageKey={key}
                                        deleteCallback={fn.deleteCallback}
                                        from={fn.props.messageList[key]['from']}
                                        when={fn.props.messageList[key]['when']}
                                        message={fn.props.messageList[key]['message']}/>;
                                })}
                            </ul>
                            <a id="clear_messages" onClick={this.deleteAllCallback.bind(this)}
                               className="btn btn-danger btn-sm pull-right">
                                Clear All
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default MessageList;