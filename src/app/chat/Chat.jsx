import React  from 'react';
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

        this.addMessage = this.addMessage.bind(this);
    };

    componentDidMount() {
        var fn = this;

        // TODO test message
        this.addMessage('crecket', 'some text');
        this.addMessage('crecket2', 'some text2');

        // Received a message from server
        socket.on('message', fn._SocketMessage);
    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        socket.removeListener('message', fn._SocketMessage);
    };

    _SocketMessage(res) {
        // send to session handler
        SessionHelper.receiveMessage(res, function (callbackMessage) {
            if (callbackMessage !== false) {
                this.addMessage(res.from, callbackMessage);
            }
        }).bind(this);
    };

    addMessage(from, message) {
        // get current list
        var currentMessages = this.state.messageList;

        // push new message to list
        currentMessages.push({when: curDate(), from: from, message: message});

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
                                newMessageCallback={this.addMessage.bind(this)}
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

export default Chat;