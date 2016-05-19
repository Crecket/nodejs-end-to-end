import React  from 'react';
import UserList from './UserList.jsx';
import NewMessageForm from './NewMessageForm.jsx';
import MessageList from './MessageList.jsx';

class Chat extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            messageList: []
        };

        this.addMessage = this.addMessage.bind(this);
        this.removeMessage = this.removeMessage.bind(this);
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
                        newMessageCallback={this.addMessage.bind(this)}
                    />
                </div>
                <div className="col-xs-12 col-sm-6 col-md-7 col-lg-8">
                    <MessageList
                        messageList={this.state.messageList}
                    />
                </div>
            </div>
        );
    }
}


export default Chat;