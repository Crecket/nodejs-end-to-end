import React  from 'react';
import AesKeyCollection from './aes/AesKeyCollection.jsx';

import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {blue100, cyanA400, lightBlue500} from 'material-ui/styles/colors';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        overflow: 'auto',
        maxHeight: 1400,
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
        
        return (
            <div>
                <div className="row">
                    <div className="col-xs-12">
                        <Card className="box-row">
                            <CardHeader
                                title="AES Keys"
                                style={{background: cyanA400}}
                                actAsExpander={true}
                                showExpandableButton={true}
                            />
                            <CardText
                                expandable={true}
                            >
                                {mapObject(fn.props.userKeys, function (key, value) {
                                    return <AesKeyCollection key={key} userKey={value} style={styles.keycollection}/>;
                                })}
                            </CardText>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };
}

export default AesKeys;