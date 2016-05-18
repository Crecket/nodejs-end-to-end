import UserList from './UserList.jsx';
import NewMessageForm from './NewMessageForm.jsx';
import MessageList from './MessageList.jsx';

class Chat extends React.component {
    getInitialState() {
        return {
            messageList: []
        };
    };

    render() {
        return (
            <div>
                <div className="col-xs-12 col-sm-6 col-md-5 col-lg-4">
                    <UserList
                        users={this.props.users}
                        userClickCallback={this.props.userClickCallback}
                    />
                    <NewMessageForm
                        targetName={this.props.targetName}
                        newMessageCallback={this.addMessage}
                    />
                </div>
                <div className="col-xs-12 col-sm-6 col-md-7 col-lg-8">
                    <MessageList
                        messages={this.state.messageList}
                        removeMessage={this.removeMessage}
                    />
                </div>
            </div>
        );
    };

    componentDidMount() {
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
    };

    addMessage(from, message) {
        // get current list
        var currentMessages = this.state.messageList;

        // push new message to list
        currentMessages.push({when: curDate(), from: from, message: message});

        // update the message list state
        this.setState({messageList: currentMessages});
    };

    removeMessage(key) {
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
}


export default Chat;