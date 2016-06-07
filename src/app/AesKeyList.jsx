import React  from 'react';
import AesKeyCollection from './aes/AesKeyCollection.jsx';

import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {grey900, grey800, grey600} from 'material-ui/styles/colors';

const styles = {
    paper: {
        display: 'inline-block',
        width: '100%',
        padding: 20,
    },
    card: {
        backgroundColor: ''
    },
    cardtext: {
        backgroundColor: grey600
    }
};

class AesKeys extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };

    render() {
        var fn = this;
        return (
            <div>
                <div className="row">
                    <div className="col-xs-12">
                        <Card className="box-row">
                            <CardHeader
                                style={{backgroundColor: grey900}}
                                title="Stored AES keys"
                                actAsExpander={true}
                                showExpandableButton={true}
                            />
                            <CardText expandable={true} style={styles.cardtext}>
                                <div className="row">
                                    {mapObject(fn.props.userKeys, function (key, value) {
                                        return <AesKeyCollection key={key} userKey={value}/>;
                                    })}
                                </div>
                            </CardText>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };
}

export default AesKeys;