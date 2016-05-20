import React  from 'react';

import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';

class NewMessageForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            checkboxToggle: false,
            messageLoading: false
        };

        this.checkboxClick = this.checkboxClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    checkboxClick() {
        this.setState({checkboxToggle: !this.state.checkboxToggle}, function () {
            SessionHelper.setFileSetting(this.state.checkboxToggle);
        });
    };

    handleSubmit(e) {
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

    };

    render() {

        var fileSendDiv;
        if (this.state.checkboxToggle) {
            fileSendDiv = (
                <div>
                    <RaisedButton type="submit" label="Send File" primary={true}/>
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

                                <TextField
                                    hintText="Target"
                                    floatingLabelText="Target"
                                    value={this.props.targetName}
                                    type="text"
                                    disabled={true}
                                    readOnly required
                                /><br />

                                <TextField
                                    hintText="Message"
                                    ref="inputMessage"
                                    floatingLabelText="Message"
                                    type="text"
                                    required autocomplete="off"
                                /><br />

                                <RaisedButton type="submit" label="Send Message" primary={true}/>

                                <div>
                                    <Checkbox
                                        label="Allow people to send me files"
                                        defaultChecked={false}
                                        onClick={this.checkboxClick}
                                    />
                                </div>

                                {fileSendDiv}

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
}

export default NewMessageForm;