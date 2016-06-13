import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import AesKeyCollection from './aes/AesKeyCollection.jsx';

import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';

const styles = {
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

    render() {
        var fn = this;

        return (
            <div>
                <div className="row">
                    <div className="col-xs-12">
                        <Card className="box-row">
                            <CardHeader
                                title="AES Keys"
                                style={{background: this.props.muiTheme.palette.primary1Color}}
                                actAsExpander={true}
                                showExpandableButton={true}
                            />
                            <CardText
                                expandable={true}
                            >
                                <div className="row">
                                    {mapObject(fn.props.userKeys, function (key, value) {
                                        return <AesKeyCollection key={key} userKey={value}
                                                                 style={styles.keycollection}/>;
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

// give theme context
AesKeys.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(AesKeys);