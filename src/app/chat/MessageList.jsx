import Message from './Message.jsx';

class MessageList extends React.component {
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
                                {Object.keys(this.props.messages).map(function (key) {
                                    return <Message
                                        key={key}
                                        messageKey={key}
                                        deleteCallback={fn.deleteCallback}
                                        from={fn.state.messageList[key]['from']}
                                        when={fn.state.messageList[key]['when']}
                                        message={fn.state.messageList[key]['message']}/>;
                                })}
                            </ul>
                            <a id="clear_messages" onClick={fn.deleteAllCallback}
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