import React, { Component } from 'react'
import '../App.css'
import CurrentTrack from './track'
import PlayerControls from './playerControls'
import ConfirmActionPopup from './confirmPopup.js'
import placeholderArt from '../res/images/placeholderTrackImage.png'
import ProgressBar from './progressBar'
import { Direction } from 'react-player-controls'
class SpotifyPlayer extends Component {
constructor(props) {
    super(props)

    
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
        this.props.updateCurrentTrack(this.props.tracks[0].id)
    }
    this.state = {
        token: this.props.accessToken,
        deviceId: "",
        user: this.props.user,
        error: "",
        track: {id: "",
                trackName: trackName,
                artistName: artistName,
                albumName: albumName,
                artURL:artURL},
        listeners: ['initialization_error',
                    'authentication_error',
                    'account_error',
                    'playback_error',
                    'player_state_changed',
                    'ready'],
        playing: false,
        position: 0,
        duration: 0,
        playlistRef: this.props.playlistRef,
        popup: {}
    }
    // this will later be set by setInterval
    this.playerCheckInterval = null
}

// when we click the "go" button
componentDidMount = () => {
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000)
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
onStateChanged(playerState) {
    // only update if we got a real state
   
    if (playerState !== null) {
    const {
        current_track: currentTrack,
    } = playerState.track_window
 
    const {position, duration} = playerState
    this.setState({position: position})
    if(this.state.error){
        this.setState({error: ""})
    }
    
    const playing = !playerState.paused

    if(playing !== this.state.playing)
        this.setState({position: position, playing: playing})
    if(currentTrack.id === this.state.track.id)
        return

    
    this.props.updateCurrentTrack(currentTrack.id)
    if (playing)
        this.handleProgress()

    const artURL = currentTrack.album.images[0].url
    const trackName = currentTrack.name
    const albumName = currentTrack.album.name
    const artistName = currentTrack.artists
                                .map(artist => artist.name)
                                .join(", ")
    
    const id = currentTrack.id
    this.setState({track:{
                        id: id,
                        trackName: trackName,
                        albumName: albumName,
                        artistName: artistName,
                        artURL: artURL},
                    position: position, 
                    duration: duration})
    } else {
    // state was null, user might have swapped to another device
        this.setState({error: 'Switched Devices',popup: {show: true, 
            title: '⚠Player Error', 
            message: 'Spotify Player Interrupted! Looks like you might have switched to another device.',
            accept: 'Resume Session',
            deny: 'Stop Session',
            onAccept: this.transferPlaybackHere,
            onDeny: this.props.stopSession,
            modal: true,
        }})

    }
}


handleProgress = () => {
    clearInterval(this.progress)
    this.progress = window.setInterval(()=>{
        if(this.state.playing && this.state.error === "")
            this.setState({position: this.state.position + 1000})
    }, 1000)
}

componentWillUnmount = () => {
    const {listeners} = this.state
    listeners.forEach((listener) => {
        this.player.removeListener(listener)
    })
    this.player.disconnect()
}

createEventHandlers() {
    // problem setting up the player
    this.player.on('initialization_error', e => { console.trace(e) })
    // problem authenticating the user.
    // either the token was invalid in the first place,
    // or it expired (it lasts one hour)
    this.player.on('authentication_error', e => {
        this.props.updateToken()
        console.trace(e)
    })
    // currently only premium accounts can use the API
    this.player.on('account_error', e => { console.trace(e) })
    // loading/playing the track failed for some reason
    this.player.on('playback_error', e => { console.trace(e) })

    // Playback status updates
    this.player.on('player_state_changed', state => this.onStateChanged(state))

    // Ready
    this.player.on('ready', async data => {
    let { device_id } = data
    console.log("Let the music play on!")
    // set the deviceId variable, then let's try
    // to swap music playback to *our* player!
    await this.setState({ deviceId: device_id })
    })
}
componentDidUpdate = (prevProps, prevState) =>{
    
}

checkForPlayer() {
    
    const { token, user } = this.state
    // if the Spotify SDK has loaded
    if (window.Spotify !== null && window.Spotify !== undefined) {
    
     
    // cancel the interval
    clearInterval(this.playerCheckInterval)
    // create a new player
    this.player = new window.Spotify.Player({
        name: "TrnTable Web Player",
        getOAuthToken: cb => { cb(token) },
    }) 
    // set up the player's event handlers
    this.createEventHandlers()
    
    // finally, connect!
    this.player.connect()
    }
}

onPrevClick = ()=> {
    if(this.state.track.id === "" || this.state.error){
        this.startPlaylistPlayback()
        this.setState({error: ""})
        
    }
    else
        this.player.previousTrack()
}

onPlayClick = () => {
    if(this.state.track.id === "" || this.state.error){
        this.startPlaylistPlayback()
        this.setState({error: ""})
    }
    else
        this.player.togglePlay()
}

onNextClick = () => {
    if(this.state.track.id === "" || this.state.error){
        this.startPlaylistPlayback()
        this.setState({error: ""})
  
    }
    else
        this.player.nextTrack()
}
seek = (value) => {
    const { track, error, duration } = this.state
    if(track.id === "" || error){
        this.startPlaylistPlayback()
        this.setState({error: ""})

    }
    else{
        console.log('seeking to', value, ' with duration:', duration)
        this.player.seek(value * duration)
    }
    
}

transferPlaybackHere(shouldPlay=true) {
    const { deviceId } = this.state
    // https://beta.developer.spotify.com/documentation/web-api/reference/player/transfer-a-users-playback/
    this.props.apiRef.transferMyPlayback([deviceId], {play: shouldPlay})
        .catch(err => {

            if(err.status === 401){
                this.props.updateToken()
                    .then(this.transferMyPlayback(shouldPlay))
            }
            
        })
}

startPlaylistPlayback = (offset={position: 0}) => {
    const { deviceId, token, playlistRef } = this.state
    this.props.apiRef.play({device_id: deviceId, context_uri: playlistRef.uri, offset: offset})    
    .then()
    .catch(err => {

        if(err.status === 401){
            this.props.updateToken()
                .then(this.startPlaylistPlayback(offset))
        }
        
    })
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
         {this.props.votes}
            <img src={track.artURL} className='track-art'/>
            <CurrentTrack track={track}/>
           
            <ProgressBar
                isEnabled
                direction= {Direction.HORIZONTAL}
                value={value}
                updateProgress={this.seek}
                />

            <PlayerControls 
                togglePlay={this.onPlayClick} 
                next={this.onNextClick}
                prev={this.onPrevClick}
                playing={playing}
                votingEnabled={false}
            />
            
    </div>
    )
}
}

export default SpotifyPlayer
