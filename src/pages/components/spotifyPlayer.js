import React, { Component } from 'react'
import '../../App.css'
import {ReactComponent as PlayIcon} from '../../res/images/player-play.svg'
import {ReactComponent as PauseIcon} from '../../res/images/player-pause.svg'
import {ReactComponent as NextIcon} from '../../res/images/player-next.svg'
class SpotifyPlayer extends Component {
constructor(props) {
    super(props)
    // set the initial state
    this.state = {
        token: this.props.accessToken,
        deviceId: "",
        user: this.props.user,
        error: "",
        track: {id: "",
                trackName: "",
                artistName: "",
                albumName: "",
                artURL:"",},
        playing: false,
        position: 0,
        duration: 1,
    }
    // this will later be set by setInterval
    this.playerCheckInterval = null
}

// when we click the "go" button
componentDidMount = () => {
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000)
}
    
updateTrackForGuests = () => {
    this.props.dbRef
                .collection('rooms')
                .doc(this.props.roomCode)
                .collection('nowPlaying')
                .doc('track')
                .set({
                    track: this.state.track
                })
}

// when we receive a new update from the player
onStateChanged(playerState) {
    // only update if we got a real state
    if (playerState !== null) {
    const {
        current_track: currentTrack,
        position,
        duration,
    } = playerState.track_window
    
    if(currentTrack.id === this.state.track.id)
        return

    this.updateTrackForGuests()

    const artURL = currentTrack.album.images[0].url
    const trackName = currentTrack.name
    const albumName = currentTrack.album.name
    const artistName = currentTrack.artists
                                .map(artist => artist.name)
                                .join(", ")
    const playing = !playerState.paused
    const id = currentTrack.id
    this.setState({track:{
            id: id,
            position: position,
            duration: duration,
            trackName: trackName,
            albumName: albumName,
            artistName: artistName,
            playing: playing,
            artURL: artURL
         }})
    } else {
    // state was null, user might have swapped to another device
    this.setState({ error: "Looks like you might have swapped to another device?" })
    }
}

createEventHandlers() {
    // problem setting up the player
    this.player.on('initialization_error', e => { console.error(e) })
    // problem authenticating the user.
    // either the token was invalid in the first place,
    // or it expired (it lasts one hour)
    this.player.on('authentication_error', e => {
    console.error(e)
    })
    // currently only premium accounts can use the API
    this.player.on('account_error', e => { console.error(e) })
    // loading/playing the track failed for some reason
    this.player.on('playback_error', e => { console.error(e) })

    // Playback status updates
    this.player.on('player_state_changed', state => this.onStateChanged(state))

    // Ready
    this.player.on('ready', async data => {
    let { device_id } = data
    console.log("Let the music play on!")
    // set the deviceId variable, then let's try
    // to swap music playback to *our* player!
    await this.setState({ deviceId: device_id })
    this.transferPlaybackHere()
    })
}
componentDidUpdate = (prevProps, prevState) =>{
    
}

checkForPlayer() {
    
    const { token, user } = this.state
    // if the Spotify SDK has loaded
    if (window.Spotify !== null && window.Spotify !== undefined) {
    
        console.log(token)
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

onPrevClick() {
    this.player.previousTrack()
}

onPlayClick() {
    this.player.togglePlay()
}

onNextClick() {
    this.player.nextTrack()
}

transferPlaybackHere() {
    const { deviceId, token } = this.state
    const { playlistRef } = this.props
    // https://beta.developer.spotify.com/documentation/web-api/reference/player/transfer-a-users-playback/
    this.props.apiRef.transferMyPlayback([deviceId], {play: false})
}

startPlaylistPlayback = () => {
    const { deviceId, token } = this.state
    this.props.apiRef.play({device_id: deviceId, context_uri: 'spotify:user:shardoodle:playlist:1pXamcAVOGxex3tllc9HDn'})    
    .then()
    .catch((err) => console.log(err))
}

render() {
    const {
    token,
    error,
    playing
    } = this.state
    const { trackName, artURL, albumName, artistName } = this.state.track
    console.log(this.state)
    return (
    <div className='spotify-player-container'>
        {error && <p>Error: {error}</p>}
        <div>      
            <p><img src={artURL}/></p> 
            <p>Artist: {artistName}</p>
            <p>Track: {trackName}</p>
            <p>Album: {albumName}</p>
            <p>
                <button onClick={() => this.onPrevClick()}>
                    <NextIcon className='player-next-icon' id='player-prev'/>
                </button>
                <button onClick={() => this.onPlayClick()}>
                    {playing ? 
                        <PauseIcon className='player-icon'/> 
                        : 
                        <PlayIcon className='player-icon'/>
                    }
                </button>
                <button onClick={() => this.onNextClick()}>
                    <NextIcon className='player-next-icon' id='player-next'/>
                </button>
            </p>
        </div>
    </div>
    )
}
}

export default SpotifyPlayer
