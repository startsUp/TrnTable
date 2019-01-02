import React, { Component } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import SessionType from './pages/session'
import ImportTrack from './pages/trackImport'
import SpotifyPlayer from './pages/components/spotifyPlayer'
import './App.css'
import SpotifyWebApi from 'spotify-web-api-js'
const spotifyApi = new SpotifyWebApi()

// const spotifyApi = new SpotifyWebApi()

// const TrackCard = props => (
//     //
//     <Container onClick={() => props.addTrack(props.trackInfo.uri)}>
//         <Card>
//     <Image src={props.trackInfo.albumArt.url}/>
//     <Card.Content>
//       <Card.Header>{props.trackInfo.trackName}</Card.Header>
//       <Card.Meta>
//         <span className='date'>{props.trackInfo.albumName}</span>
//       </Card.Meta>
//       <Card.Description>{props.trackInfo.artists}</Card.Description>
//     </Card.Content>
//   </Card>
//     </Container>
           
// )

class App extends Component {
    constructor(props){
		super(props)
		const params = this.getHashParams()
        const token = params.access_token
        const refreshToken = params.refresh_token
        
		if (token) {
		  spotifyApi.setAccessToken(token)
        }
        
		this.state = {
          loggedIn: token ? true : false,
          page: token ? 'trackImport':'trackImport',
          roomRef: null,
          user: null,
          token: token,
          refreshToken: refreshToken,
          queue: []
        }
        
    }
    componentDidMount = () => {
        if(this.state.token){
            spotifyApi.getMe().then((userData)  => {
                this.setState({user: userData})
            })
        
            .catch((err) => console.log(err)) //get access token here
            
            
        }
        
    }
  
    refreshAccessToken = () => {
        fetch('https://jukebox-2952e.firebaseapp.com/refresh_token?refresh_token=' + this.state.refreshToken)
                .then((res) => console.log(res))
                .catch((err) => console.log(err))
    }

    getHashParams = () => {
		var hashParams = {}
		var e, r = /([^&=]+)=?([^&]*)/g,
			q = window.location.hash.substring(1)
		
		e = r.exec(q)
		while (e) {
		   hashParams[e[1]] = decodeURIComponent(e[2])
		   e = r.exec(q)
		}
		return hashParams
    }
    
    changePage = (nextPage, tracks=null) => {
        if(this.state.page === 'trackImport' && nextPage === 'dashboard') 
            this.createPlaylist(this.getDate() + ' TrnTable Session')
        this.setState({page: nextPage})
        
    }
    getDate = () => {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];
      
        var date = new Date()
        var day = date.getDate()
        var monthIndex = date.getMonth()
        var year = date.getFullYear()
      
        return day + ' ' + monthNames[monthIndex] + ' ' + year
      }
      
    searchForTrack = (track, options, callback) => {
       spotifyApi.searchTracks(track, options, callback)
    }

    getUserPlaylists = (user, options, callback) => {
        spotifyApi.getUserPlaylists(user.id, options, callback)
        // spotifyApi.transferMyPlayback()
    

    }

    getPlaylistTracks = (user, playlistID, options, callback) => {
        // spotifyApi.getPlaylistTracks(user.id, playlistID, options, callback)
        // spotifyApi.getAlbumTracks(albumID, options)
    }

    setRoomCode = (roomCode) => {
        this.setState({roomRef: roomCode})
    }

    createPlaylist = (name) => {
        spotifyApi.createPlaylist(this.state.user.id, {name: name})
                .then((playlist) => {
                    var playlistObj = {href: playlist.href, uri: playlist.uri, id: playlist.id, owner: playlist.owner}
                    this.setState({playlistRef: playlistObj}) //store playlist object in state

                    this.props.dbRef
                                .collection('rooms')
                                .doc(this.props.roomCode)
                                .collection('playlist')
                                .set(playlistObj)

                }) 
                .catch((err) => console.log(err))
    }

  render() {
    var page = <Login/>
    const currentPage = this.state.page
    const user = this.state.user
    console.log('room', this.state.roomRef)
    if(currentPage === 'sessionType') 
        page = <SessionType dbRef={this.props.dbRef} changePage={this.changePage} 
                            user={user} setRoomCode={this.setRoomCode} />
    else if(currentPage === 'dashboard') 
        page = <Dashboard user={user} 
                apiRef={spotifyApi} dbRef={this.props.dbRef} 
                roomCode={this.state.roomRef} accessToken={this.state.token}/>
    else if(currentPage === 'trackImport') 
        page = <ImportTrack roomCode={this.state.roomRef} user={user} apiRef={spotifyApi} roomCode={this.state.roomRef} changePage={this.changePage}/>
    
    
    return (
      <div className='App'>
            {page}
      </div>
    )
  }
}

export default App