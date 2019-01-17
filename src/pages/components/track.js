import React, { Component } from 'react'
import '../../App.css'

const CurrentTrack = props => (
    <div className='track-container'>
        <div style={{fontSize: '2em'}}>
            {props.track.trackName}
        </div>
        <div style={{fontSize: '1.2em'}}>
            {props.track.artistName}
        </div>        
    </div>
        
)
export default CurrentTrack
