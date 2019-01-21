import React, { Component } from 'react'
import AppLogo from './logo'
const HostBar = props => (
    <div className='dashboard-header' id={props.dark?'dashboard-header-dark':''}>
        <div className='dashboard-roominfo'>
            <AppLogo styleName='dashboard-logo'/>
            <div id='host-roomcode'>{props.roomCode}</div>
        </div>
        <div className='dashboard-title'>
            {props.title}
        </div>
        <div className='dashboard-settings-container'>
            {props.guestsIcon}
            {props.icon}
        </div>
    </div>
)
export default HostBar