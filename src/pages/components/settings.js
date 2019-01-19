import React, { Component } from 'react'
import '../../App.css'

const Settings = props => (
    <div className='settings-container'>
        <div className='settings'>
            <div>

            </div>
            <div onClick={props.endSession}>
                End Session
            </div>
        </div>
    </div>
        
)
export default Settings
