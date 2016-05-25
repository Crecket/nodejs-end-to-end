import React  from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
    inputs: {
        width: '100%',
    },
    imageInput: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
    },
};

class NewMessageForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            // checkboxToggle: false,
            messageLoading: false
        };

        this._SocketMessageCallback = this._SocketMessageCallback.bind(this);
    };

    componentDidMount() {
        var fn = this;
        // Received a message from server
        socket.on('message_callback', fn._SocketMessageCallback);
    };

    componentWillUnmount() {
        var fn = this;
        // Remove socket listeners if component is about to umount
        socket.removeListener('message_callback', fn._SocketMessageCallback);
    };

    handleSubmit = (e) => {
        e.preventDefault();
        if (!this.state.messageLoading && SessionHelper.hasTarget()) {
            var message = this.refs.inputMessage.input.value;

            if (message && message.length > 0 && message.length < 255) {
                this.setState({messageLoading: true});
                if (SessionHelper.sendMessage(message)) {
                    this.props.newMessageCallback(SessionHelper.getUsername(), message);
                }
            } else {
                this.setState({messageLoading: false});
            }
        }

    };

    _SocketMessageCallback(res) {
        this.setState({messageLoading: false});
    }

    // checkboxClick = () => {
    //     this.setState({checkboxToggle: !this.state.checkboxToggle}, function () {
    //         SessionHelper.setFileSetting(this.state.checkboxToggle);
    //     });
    // };

    render() {

        /*
         until we fix everything else this will be disabled

         var fileSendDiv;
         if (this.state.checkboxToggle) {
         fileSendDiv = (
         <RaisedButton
         label="Choose an Image"
         labelPosition="before"
         style={styles.button}
         primary={true}
         >
         <input type="file" style={styles.imageInput}/>
         </RaisedButton>
         );
         <Checkbox
         label="Allow people to send me files"
         checked={this.state.checkboxToggle}
         onClick={this.checkboxClick}
         />
         <br />

         {fileSendDiv}

         }*/

        return (
            <form onSubmit={this.handleSubmit} method="post">
                <div className="row middle-xs">

                    <div className="col-xs-12">
                        <div className="box-row">
                            <TextField
                                style={styles.inputs}
                                hintText="Target"
                                floatingLabelText="Target"
                                value={this.props.targetName}
                                type="text"
                                disabled={true}
                                readOnly required
                            />
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <div className="box-row">
                            <TextField
                                style={styles.inputs}
                                hintText="Message"
                                ref="inputMessage"
                                floatingLabelText="Message"
                                type="text"
                                required autocomplete="off"
                            />
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <div className="box-row">
                            <RaisedButton
                                type="submit"
                                label="Send Message"
                                primary={true}
                                style={styles.inputs}
                            />
                        </div>
                    </div>

                </div>
            </form>
        );
    };
}

export default NewMessageForm;