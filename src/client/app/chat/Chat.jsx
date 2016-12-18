import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import UserList from './UserList.jsx';
import NewMessageForm from './NewMessageForm.jsx';
import MessageList from './MessageList.jsx';

import Paper from 'material-ui/Paper';

const style = {
    paper: {
        display: 'inline-block',
        width: '100%',
        minHeight: 268,
        padding: 20,
    },
    paperAlt: {
        display: 'inline-block',
        width: '100%',
        padding: 20,
        maxHeight: 450,
        minHeight: 268,
        overflowX: 'hidden',
        overflowY: 'auto',
    },
};

class Chat extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            messageList: []
        };
    };

    componentDidMount() {
        var fn = this;

        // Received a message from server
        this.props.socket.on('message', fn._SocketMessage);
    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        this.state.socket.removeListener('message', fn._SocketMessage);
    };

    _SocketMessage = (res) => {
        var fn = this;
        // send to session handler
        SessionHelper.receiveMessage(res, function (callbackMessage) {
            if (callbackMessage !== false) {
                fn.addMessage(res.from, callbackMessage);
            }
        });
    };

    addMessage = (from, message) => {
        // get current list
        var currentMessages = this.state.messageList;

        // push new message to list
        currentMessages.unshift({when: curDate(), from: from, message: message});

        // update the message list state
        this.setState({messageList: currentMessages});
    };

    render() {
        return (
            <div className="row">

                <div className="col-xs-12 col-sm-6 col-md-3 last-md">
                    <div className="box-row">
                        <Paper style={style.paperAlt}>
                            <UserList
                                users={this.props.users}
                                userClickCallback={this.props.userClickCallback}
                            />
                        </Paper>
                    </div>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-3">
                    <div className="box-row">
                        <Paper style={style.paper}>
                            <NewMessageForm
                                targetName={this.props.targetName}
                                newMessageCallback={this.addMessage}
                            />
                        </Paper>
                    </div>
                </div>

                <div className="col-xs-12 col-sm-12 col-md-6">
                    <div className="box-row">
                        <Paper style={style.paperAlt}>
                            <MessageList
                                messageList={this.state.messageList}
                                userClickCallback={this.props.userClickCallback}
                            />
                        </Paper>
                    </div>
                </div>

            </div>
        );
    };
}

// give theme context
Chat.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default Chat;