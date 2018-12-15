import React, { Component } from 'react'
import Message from '../../component/message/Message'
import string from '../../infrasctuture/strings'

class NotFound extends Component {
    render() {
        return (
            <div className="App">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <Message title={string.label_not_found_title}
                                message={string.label_not_found_message} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

NotFound.propTypes = {

}

export default NotFound