import React  from 'react';
import AesKeyCollection from './aes/AesKeyCollection.jsx';

import transitions from 'material-ui/styles/transitions';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {grey900, grey800, grey600} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import VpnKey from 'material-ui/svg-icons/communication/vpn-key';
import ArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import ArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        overflow: 'auto',
        maxHeight: 1400,
        transition: transitions.create('max-height', '500ms', '0ms', 'ease-in-out'),
    },
    paperHidden: {
        maxHeight: 0,
        overflow: 'hidden'
    },
    keycollection: {
        margin: 20,
    }
};

class AesKeys extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            visible: false
        };
    };

    toggleState = () => {
        this.setState({visible: !this.state.visible});
    };

    render() {
        var fn = this;

        let keyDivStyle = Object.assign({}, styles.paper, styles.paperHidden);
        let barIcon = <ArrowDown/>;
        if (this.state.visible) {
            keyDivStyle = styles.paper;
            barIcon = <ArrowUp/>;
        }

        return (
            <div>
                <div className="row">
                    <div className="col-xs-12">
                        <AppBar
                            title="AES Keys"
                            iconElementLeft={<IconButton><VpnKey /></IconButton>}
                            iconElementRight={<IconButton onClick={this.toggleState}>{barIcon}</IconButton>}
                        />
                        <Paper className="row" style={keyDivStyle}>
                            {mapObject(fn.props.userKeys, function (key, value) {
                                return <AesKeyCollection key={key} userKey={value} style={styles.keycollection}/>;
                            })}
                        </Paper>
                    </div>
                </div>
            </div>
        );
    };
}

export default AesKeys;