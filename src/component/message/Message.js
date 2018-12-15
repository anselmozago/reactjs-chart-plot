import React from 'react'
import PropTypes from 'prop-types';

const Message = props => {
    return (
        <div className="messageBox">
            <div className="messageTitle">
                <h1>{props.title}</h1>
            </div>
            <p className="messageText">{props.message}</p>
            <p>{props.children}</p>
        </div>
    )
}

Message.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
}

export default Message