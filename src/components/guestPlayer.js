import React, { Component } from 'react'
import '../App.css'
import CurrentTrack from './track'
import PlayerControls from './playerControls'
import ConfirmActionPopup from './confirmPopup.js'
import placeholderArt from '../res/images/placeholderTrackImage.png'
import ProgressBar from './progressBar'
import { Direction } from 'react-player-controls'
class GuestPlayer extends Component {
constructor(props) {
    super(props)
    console.log(this.props)
    
    var artURL = placeholderArt
    var albumName = ""
    var trackName = "" 
    var id = "" 
    var artistName = ""

    
    if(this.props.tracks.length > 0){
        artURL = this.props.tracks[0].albumArt[1].url
        trackName = this.props.tracks[0].trackName
        albumName = this.props.tracks[0].albumName
        artistName = this.props.tracks[0].artists
    }
    this.state = {
        token: this.props.accessToken,
        user: this.props.user,
        error: "",
        track: {id: "",
                trackName: trackName,
                artistName: artistName,
                albumName: albumName,
                artURL:artURL},
        listeners: [],
        popup: {}
    }
    // this will later be set by setInterval
    this.playerCheckInterval = null
}



    
// updateTrackForGuests = () => {
//     this.props.dbRef
//                 .collection('rooms')
//                 .doc(this.props.roomCode)
//                 .collection('nowPlaying')
//                 .doc('track')
//                 .set({
//                     track: this.state.track
//                 })
// }

// when we receive a new update from the player


componentDidUpdate = (prevProps, prevState) =>{
    
}



render() {
    const {
    token,
    error,
    playing,
    track,
    popup,
    position,
    duration
    } = this.state
    
    const value = position / duration
   
    return (
    <div className='spotify-player-container'>
        {error && <ConfirmActionPopup 
                    popupInfo={popup}/>
        }
            <img src={track.artURL} className='track-art'/>
            <CurrentTrack track={track}/>

            <PlayerControls 
                togglePlay={this.onPlayClick} 
                next={this.onNextClick}
                prev={this.onPrevClick}
                playing={playing}
                votingEnabled
                vote={this.props.vote}
            />
    </div>
    )
}
}

export default GuestPlayer
