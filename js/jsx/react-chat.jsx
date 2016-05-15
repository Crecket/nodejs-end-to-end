var ReactChat = React.createClass({
    getInitialState: function () {
        return {
            connected: false,
            time: 0
        }
    },
    render: function () {
        return (
            <div className="panel">
                <ReactUserList users={this.props.users}/>
            </div>
        );
    }
});

var ReactUserList = React.createClass({
    render: function () {
        return (
            <ul className="userListReact">
                {Object.keys(this.props.users).map(function (key) {
                    return <ReactUser key={key} username={key}/>;
                })}
            </ul>
        );
    }
});

var ReactMessageList = React.createClass({
    getInitialState: function () {
        return {
            messageList: []
        };
    },
    addMessage: function (from, message) {
        // get current list
        var currentMessages = this.state.messageList;

        // push new message to list
        currentMessages.push({when: curDate(), from: from, message: message});

        // update the message list state
        this.setState({messageList: currentMessages});
    },
    removeMessage: function (key) {
        // get current list
        var currentMessages = this.state.messageList;

        if (key) {
            // delete message from list
            delete currentMessages[key];
        } else {
            // delete all messages
            currentMessages = [];
        }

        // update the message list state
        this.setState({messageList: currentMessages});
    },
    componentDidMount: function () {
        var fn = this;

        // TODO test message
        this.addMessage('crecket', 'some text');
        this.addMessage('crecket2', 'some text2');
        this.addMessage('crecket3', 'some text3');

        // Received a message from server
        socket.on('message', function (res) {
            // send to session handler
            SessionHelper.receiveMessage(res, function (callbackMessage) {
                if (callbackMessage !== false) {
                    fn.addMessage(res.from, callbackMessage);
                }
            });
        });
    },
    deleteCallback: function (deleteKey) {
        this.removeMessage(deleteKey);
    },
    deleteAllCallback: function () {
        this.removeMessage();
    },
    render: function () {
        var fn = this;
        return (
            <div className="messagesDiv">
                <ul className="userListReact">
                    {Object.keys(this.state.messageList).map(function (key) {
                        return <ReactMessage
                            key={key}
                            messageKey={key}
                            deleteCallback={fn.deleteCallback}
                            from={fn.state.messageList[key]['from']}
                            when={fn.state.messageList[key]['when']}
                            message={fn.state.messageList[key]['message']}/>;
                    })}
                </ul>
                <a id="clear_messages" onClick={fn.deleteAllCallback} className="btn btn-danger btn-sm pull-right">
                    Clear All
                </a>
            </div>
        );
    },
});

var ReactMessage = React.createClass({
    callback: function () {
        this.props.deleteCallback(this.props.messageKey);
    },
    render: function () {
        return (
            <p><strong>{this.props.when} {this.props.from}</strong>: {escapeHtml(this.props.message)}
                <button onClick={this.callback} className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </p>
        );
    }
})

var ReactUser = React.createClass({
    getIntialState: function () {
        return {};
    },
    render: function () {
        return (
            <li key={this.props.username}>{this.props.username}</li>
        );
    }
});

var ReactChat = React.createClass({
    getInitialState: function () {
        return {
            connected: false,
            users: [],
            time: 0
        }
    },
    componentDidMount: function () {
        var fn = this;
        socket.on('server_info', function (server_info) {
            fn.setState({users: server_info.user_list, time: server_info.time});
        });
    },
    render: function () {
        return (
            <div>
                <div className="col-xs-12 col-sm-6 col-md-4">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            Users
                        </div>
                        <div className="panel-body">
                            <ReactUserList users={this.state.users}/>
                        </div>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8">
                    <div className="panel panel-success">
                        <div className="panel-heading">
                            Messages
                        </div>
                        <div className="panel-body">
                            <ReactMessageList/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
