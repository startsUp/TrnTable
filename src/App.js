import React, { Component } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import SessionType from './pages/session'
import ImportTrack from './pages/trackImport'
import { getSpotifyToken } from './helpers'
import AppLogo from './pages/components/logo'
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
			    <AppLogo styleName='app-logo' animate={true}/>
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
            window.history.replaceState(null, null, ' ')
            spotifyApi.setAccessToken(token)
        }
        var landingPage = 'sessionType'
        const playerTesting = true
        var sessionType = null
        var roomRef = null
        if(playerTesting){
             landingPage = 'dashboard'
             roomRef = 'E1GM'
             sessionType = 'host'
        }
		this.state = {
          loggedIn: token ? true : false,

          page:'loading', //original : sType, login
          roomRef: roomRef, //temp room for testing
          user: null, 
          token: token,
          landingPage: landingPage,
          firebaseToken: firebaseToken,
          refreshToken: refreshToken,
          queue: [], 
          sessionType: sessionType,
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
            
        
        this.props.firebase.auth().onAuthStateChanged(async (user)=>{
            if(user){
                this.setState({user: user})
                // get access token and refresh token
                console.log('state changed', user)
                if(this.state.token)
                    this.setState({page: this.state.landingPage})
                else{
                    await this.refreshAccessToken(user)
                    console.log('got spotify token', spotifyApi.getAccessToken())
                    this.setState({page: this.state.landingPage})
                }
            }
            else if (!this.state.firebaseToken){
                this.setState({page: 'login'})
            }
        })
    }
  
    refreshAccessToken = async (user=this.state.user) => {
        return new Promise((resolve, reject)=>{
            getSpotifyToken(user.uid)
            .then((res)=>{
                const token = res.access_token
                spotifyApi.setAccessToken(token)
                this.setState({token: token})
            })
            .then(()=>{
                resolve()
            })
            .catch((err) => {
                console.log(err)
                reject(err)
            })
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
        if(nextPage === 'dashboard') {
            if(this.state.page === 'trackImport'){
                this.setState({page: 'loading'})
                this.createPlaylist(this.getDate() + ' TrnTable Session', tracks)
            }
            else{
                this.setState({page: 'dashboard', sessionType: 'guest'})
            }
        }  
        else
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

    createPlaylist = (name, tracks) => {
        spotifyApi.createPlaylist(this.state.user.uid, {name: name})
                .then((playlist) => {
                    var playlistObj = {href: playlist.href, uri: playlist.uri, id: playlist.id, owner: playlist.owner}
                    this.setState({playlistRef: playlistObj}) //store playlist object in state

                    this.props.dbRef
                                .collection('rooms')
                                .doc(this.state.roomRef)
                                .set(playlistObj)
                                

                })
                .then(() => {
                    //write all tracks added by host, to the database (as a batch)
                    
                    var batch = this.props.dbRef.batch()
                    
                    tracks.forEach((track) => { 
                        //generate unique track id
                        var trackRef = this.props.dbRef.collection('tracksInRoom')
                                                       .doc(this.state.roomRef)
                                                       .collection('tracks').doc()
                        batch.set(trackRef, {track: track})
                    })
                
                    batch.commit().then(
                        this.setState({page: 'dashboard', sessionType: 'host'})
                    )
                    .catch(err => console.log(err))
                
                })
                .catch(err => {                                                         
                    if(err.status === 401){
                        this.updateToken()
                            .then(this.createPlaylist(name))
                    }
                }) 
    }

  render() {

    var page = <LoadingScreen/>
    const currentPage = this.state.page
    const { user, sessionType } = this.state
    if(currentPage === 'sessionType') 
        page = <SessionType dbRef={this.props.dbRef} changePage={this.changePage} 
                            user={user} setRoomCode={this.setRoomCode}/>
    else if(currentPage === 'dashboard') 
        page = <Dashboard user={user} firebase={this.props.firebase}
                apiRef={spotifyApi} dbRef={this.props.dbRef} 
                roomCode={this.state.roomRef} accessToken={this.state.token} 
                updateToken={this.refreshAccessToken} type={sessionType}/>
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