import React, { Component } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import SessionType from './pages/session'
import ImportTrack from './pages/trackImport'
import SpotifyPlayer from './pages/components/spotifyPlayer'
import { getSpotifyToken } from './helpers'
import logo from './res/images/logo.png'
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

const LoadingScreen = () => (
		<div className='loading-container'>
            <div id='logo-container'>
                <p id='logo-title'>TrnTable</p>
			    <img src={logo} className="loading-logo" alt="Loading" />
            </div>

		</div>
)


class App extends Component {
    constructor(props){
		super(props)
		const params = this.getHashParams()
        const firebaseToken = params.token
        const token = params.access_token
        const refreshToken = params.refresh_token
        
		if (token) {
		  spotifyApi.setAccessToken(token)
        }
        
        
		this.state = {
          loggedIn: token ? true : false,
          page: token ? 'sessionType':'loading', //original : sType, login 
          roomRef: null,
          user: null, 
          token: token,
          firebaseToken: firebaseToken,
          refreshToken: refreshToken,
          queue: []
        }
        
    }
    componentDidMount = () => {
        const {firebaseToken} = this.state
        if(firebaseToken){
            this.props.firebase
                .auth()
                .signInWithCustomToken(firebaseToken)
                .catch(err=> console.log(err))
        }
            
        
        this.props.firebase.auth().onAuthStateChanged((user)=>{
            if(user){
                this.setState({user: user})
                //get access token and refresh token
                if(this.state.token)
                    this.setState({page: 'sessionType'})
                else{
                    this.refreshAccessToken('sessionType', user)
                }
            }
            else if (!this.state.firebaseToken){
                this.setState({page: 'login'})
            }
        })
    }
  
    refreshAccessToken = (changePageTo=null, user=this.state.user) => {
        getSpotifyToken(user.uid)
        .then((res)=>{
            const token = res.access_token
            changePageTo === null ? this.setState({token: token}) :
                                    this.setState({page: 'sessionType', token: token})

            spotifyApi.setAccessToken(token)
        })
        .catch((err) => {
            console.log(err)
        })
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

    var page = <LoadingScreen/>
    const currentPage = this.state.page
    const user = this.state.user
    if(currentPage === 'sessionType') 
        page = <SessionType dbRef={this.props.dbRef} changePage={this.changePage} 
                            user={user} setRoomCode={this.setRoomCode}/>
    else if(currentPage === 'dashboard') 
        page = <Dashboard user={user} 
                apiRef={spotifyApi} dbRef={this.props.dbRef} 
                roomCode={this.state.roomRef} accessToken={this.state.token} 
                updateToken={this.refreshAccessToken}/>
    else if(currentPage === 'trackImport') 
        page = <ImportTrack roomCode={this.state.roomRef} user={user} apiRef={spotifyApi}
                roomCode={this.state.roomRef} changePage={this.changePage}
                updateToken={this.refreshAccessToken}/>
    else if(currentPage === 'login')
        page =  <Login/>
    
    return (
      <div className='App'>
            {page}
      </div>
    )
  }
}

export default App