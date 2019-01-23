import React, { Component } from 'react'
import '../App.css'
import CurrentTrack from './track'
import PlayerControls from './playerControls'
import ConfirmActionPopup from './confirmPopup.js'
import placeholderArt from '../res/images/placeholderTrackImage.png'
import ProgressBar from './progressBar'
import { Direction } from 'react-player-controls'
class GuestPlayer extends Component {
// when we receive a new update from the player
render() {
    const {
    token,
    error,
    playing,
    track,
    popup,
    position,
    duration
    } = this.props
    const trackDesc = {trackName: track.content, artistName: track.subContent}
    return (
    <div className='spotify-player-container'>
        {error && <ConfirmActionPopup 
                    popupInfo={popup}/>
        }
            <img src={track.albumArt[1].url} className='track-art'/>
            <CurrentTrack track={trackDesc}/>

            <PlayerControls 
                togglePlay={this.onPlayClick} 
                next={this.onNextClick}
                prev={this.onPrevClick}
                playing={playing}
                votingEnabled
                vote={this.props.vote}
                {...this.props}
            />
    </div>
    )
}
}

export default GuestPlayer
