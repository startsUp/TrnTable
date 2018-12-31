import React, { Component } from 'react'
import '../../App.css'

class SpotifyPlayer extends Component {
constructor(props) {
    super(props)
    // set the initial state
    this.state = {
    token: this.props.accessToken,
    deviceId: "",
    user: this.props.user,
    error: "",
    trackName: "",
    artistName: "",
    albumName: "",
    artURL:"",
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
    

// when we receive a new update from the player
onStateChanged(state) {
    // only update if we got a real state
    if (state !== null) {
    const {
        current_track: currentTrack,
        position,
        duration,
    } = state.track_window
    console.log(state)

    //   if(!state.paused){
    //       console.log(state.paused)
    //     this.player.togglePlay()
    //   }
        
    const artURL = currentTrack.album.images[0].url
    const trackName = currentTrack.name
    const albumName = currentTrack.album.name
    const artistName = currentTrack.artists
                                .map(artist => artist.name)
                                .join(", ")
    const playing = !state.paused
    this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
        artURL
    })
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
    trackName,
    artistName,
    albumName,
    artURL,
    error,
    playing
    } = this.state
    console.log(this.state)
    return (
    <div className='spotify-player-container'>
        <div>
        <h2>Now Playing</h2>
        <p>A Spotify Web Playback API Demo.</p>
        </div>
    
        {error && <p>Error: {error}</p>}
        <div>      
        <p><img src={artURL}/></p> 
        <p>Artist: {artistName}</p>
        <p>Track: {trackName}</p>
        <p>Album: {albumName}</p>
        <p>
            <button onClick={() => this.onPrevClick()}>Previous</button>
            <button onClick={() => this.onPlayClick()}>{playing ? "Pause" : "Play"}</button>
            <button onClick={() => this.onNextClick()}>Next</button>
        </p>
        </div>
    </div>
    )
}
}

export default SpotifyPlayer
