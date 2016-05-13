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
            // log(server_info);
            fn.setState({users: server_info.user_list, time: server_info.time});
        });
    },
    render: function () {
        return (
            <div className="panel">
                <ReactUserList users={this.state.users}/>
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
            messageList: [{when: curDate(), from: 'user', message: 'message'}]
        };
    },
    render: function () {
        var fn = this;
        return (
            <ul className="userListReact">
                {Object.keys(this.state.messageList).map(function (key) {
                    return <ReactMessage
                        key={key}
                        from={fn.state.messageList[key]['from']}
                        when={fn.state.messageList[key]['when']}
                        message={fn.state.messageList[key]['message']}/>;
                })}
            </ul>
        );
    },
    addMessage: function (from, message) {
        // get current list
        var currentMessages = this.state.messages;
        // push new message to list
        currentMessages.push({when: curDate(), from: from, message: message});
        // update the message list state
        this.setState({messageList: currentMessages});
    },
    componentDidMount: function () {
        var fn = this;
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
});

var ReactMessage = React.createClass({
    render: function () {
        return (
            <p><strong>{this.props.when} {this.props.from}</strong>: {escapeHtml(this.props.message)}</p>
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
                    <div className="row">
                        <div className="panel panel-info">
                            <div className="panel-heading">
                                Users
                            </div>
                            <div className="panel-body">
                                <ReactUserList users={this.state.users}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8">
                    <div className="row">
                        <div className="panel panel-info">
                            <div className="panel-heading">
                                Messages
                            </div>
                            <div className="panel-body">
                                <ReactMessageList/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
