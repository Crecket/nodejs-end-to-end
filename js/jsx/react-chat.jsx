var ReactChat = React.createClass({
    getInitialState: function () {
        return {
            messageList: []
        };
    },
    render: function () {
        return (
            <div>
                <div className="col-xs-12 col-sm-6 col-md-5 col-lg-4">
                    <ReactUserList
                        users={this.props.users}
                        userClickCallback={this.props.userClickCallback}
                    />
                    <ReactNewMessageForm
                        targetName={this.props.targetName}
                        newMessageCallback={this.addMessage}
                    />
                </div>
                <div className="col-xs-12 col-sm-6 col-md-7 col-lg-8">
                    <ReactMessageList
                        messages={this.state.messageList}
                        removeMessage={this.removeMessage}
                    />
                </div>
            </div>
        );
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
    }
});


var ReactNewMessageForm = React.createClass({
    getInitialState: function () {
        return {
            checkboxToggle: false,
            messageLoading: false
        };
    },
    checkboxClick: function () {
        this.setState({checkboxToggle: !this.state.checkboxToggle}, function () {
            SessionHelper.setFileSetting(this.state.checkboxToggle);
        });
    },
    handleSubmit: function (e) {
        e.preventDefault();
        if (!this.state.messageLoading && SessionHelper.hasTarget()) {
            var message = this.refs['inputMessage'].value;

            if (message.length > 0 && message.length < 255) {
                this.setState({messageLoading: true});
                if (SessionHelper.sendMessage(message)) {
                    this.props.newMessageCallback(SessionHelper.getUsername(), message);
                }
            } else {
                debug('Message length: ' + message.length);
                this.setState({messageLoading: false});
            }
        }

    },
    render: function () {

        var fileSendDiv;
        if (this.state.checkboxToggle) {
            fileSendDiv = (
                <div className="form-group">
                    <div className="col-xs-12 col-sm-6">
                        <div className="row">
                            <a className="btn btn-lg btn-primary btn-block" id="file_upload">
                                Send File
                            </a>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-6">
                        <div className="row">
                            <label className="">
                                Choose a file <input type="file" id="file_upload_test"/>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="col-xs-12">
                <div className="row">
                    <form onSubmit={this.handleSubmit} method="post">
                        <div className="panel panel-info">
                            <div className="panel-heading body_toggle" data-toggle="new_message_body">
                                New Message
                            </div>
                            <div className="panel-body" id="new_message_body">

                                <div className="form-group">
                                    <label for="inputTarget">Target</label>
                                    <input type="text"
                                           className="form-control input-lg"
                                           value={this.props.targetName}
                                           placeholder="No user selected"
                                           readOnly required/>
                                </div>

                                <div className="form-group">
                                    <label for="inputMessage">Message</label>
                                    <input type="text"
                                           ref="inputMessage"
                                           className="form-control input-lg"
                                           placeholder="Message"
                                           required autocomplete="off"/>
                                    <button className="btn btn-lg btn-primary btn-block" type="submit">
                                        Send Message
                                    </button>
                                </div>

                                <div className="form-group">
                                    <div className="col-xs-12">
                                        <div className="row">
                                            <label>
                                                <input type="checkbox" onClick={this.checkboxClick}/>
                                                Allow people to send me files.
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {fileSendDiv}

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

var ReactUserList = React.createClass({
    render: function () {
        var fn = this;
        return (
            <div className="col-xs-12">
                <div className="row">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            Users
                        </div>
                        <div className="panel-body">
                            <ul className="userListReact">
                                {Object.keys(this.props.users).map(function (key) {
                                    return <ReactUser userClickCallback={fn.props.userClickCallback} key={key}
                                                      username={key}/>;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var ReactMessageList = React.createClass({
    deleteCallback: function (deleteKey) {
        this.props.removeMessage(deleteKey);
    },
    deleteAllCallback: function () {
        this.props.removeMessage();
    },
    render: function () {
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
                                    return <ReactMessage
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
    },
});

var ReactMessage = React.createClass({
    callback: function () {
        this.props.deleteCallback(this.props.messageKey);
    },
    render: function () {
        return (
            <p>
                <strong>{this.props.when} {this.props.from}</strong>: {escapeHtml(this.props.message)}
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
    userClickCallback: function () {
        // send click event to react app
        this.props.userClickCallback(this.props.username);
    },
    render: function () {
        if (SessionHelper.getUsername() === this.props.username) {
            return (
                <li key={this.props.username}>
                    {this.props.username}
                </li>
            );
        } else {
            return (
                <li key={this.props.username}>
                    <a onClick={this.userClickCallback}>{this.props.username}</a>
                </li>
            );
        }
    }
});
