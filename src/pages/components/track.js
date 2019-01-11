import React, { Component } from 'react'
import '../../App.css'

const CurrentTrack = props => (
    <div className='track-container'>
        <div className='track-art-container'>
            <img src={props.track.artURL} className='track-art'/>
        </div>
        <div>
            {props.track.trackName}
        </div>
        <div>
            {props.track.artists}
        </div>        
    </div>
        
)
export default CurrentTrack
