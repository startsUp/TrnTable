import React, { Component } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import SessionType from './pages/session'
import ImportTrack from './pages/trackImport'
import { getSpotifyToken } from './helpers'
import {DefaultHostSettings} from './components/settings'
import AppLogo from './components/logo'
import './App.css'
import SpotifyWebApi from 'spotify-web-api-js'
const spotifyApi = new SpotifyWebApi()

const LoadingScreen = props => (
		<div className='loading-container'>
            <div id='logo-container'>
                <p id='loading-title'>TrnTable</p>
			    <AppLogo styleName='app-logo' animate={true}/>
                <p id='loading-message'>{props.message}</p>
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
        const playerTesting = false
        var sessionType = null
        var roomRef = null
        if(playerTesting){
             landingPage = 'trackImport'
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
            loading: '',
            playlistRef: null,
            settings: DefaultHostSettings   
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
                
                this.setState({user: user, loading: 'Signing In ...'})
                // get access token and refresh token
                
                if(this.state.token){
                    var res = await this.getUserInfo()
                    this.showLandingPage(res)
                }
                else{
                    await this.refreshAccessToken(user)
                    var res = await this.getUserInfo()
                    this.showLandingPage(res)
                }
            }
            else if (!this.state.firebaseToken){
               this.setState({page: 'login'})
            }
        })
    }
  
    showLandingPage = async (res) => {

        if(!res){
            this.setState({page: this.state.landingPage})
            return
        }
        const roomInfo = await this.getRoomInfo(res.room)
        console.log({ROOMINFO: roomInfo})
        if (res.playlistRef){

            var tracks = await this.getSessionTracks(res.room)
            this.setState({
                page: 'dashboard',
                playlistRef: res.playlistRef,
                roomRef: res.room,
                sessionType: res.host ? 'host' : 'guest',
                queue: tracks,
                settings: roomInfo.settings
            })
        }
        else if(res.host){
            this.setState({
                page: 'trackImport',
                roomRef: res.room,
                sessionType: 'host',
                settings: roomInfo.settings
            })
        }
        else{
            this.setState({
                page: 'dashboard',
                roomRef: res.room,
                sessionType: 'guest',
                settings: roomInfo.settings
            })
        }
    }
    getRoomInfo = async (roomCode) => {
        return new Promise((resolve, reject) => {
            this.props.dbRef.collection('rooms').doc(roomCode).get()
            .then((snapshot) => {
                if(snapshot.exists){
                    resolve(snapshot.data())
                }
                   
                else{
                    resolve(false)
                } 

            })
            .catch(err => reject(err))
        })
        
    }
    getUserInfo = async () => {
        return new Promise((resolve, reject) => {
            this.props.dbRef.collection('users').doc(this.state.user.uid).get()
                .then((snapshot) => {
                    if(snapshot.exists){
                        resolve(snapshot.data())
                    }
                       
                    else{
                        resolve(false)
                    } 

                })
                .catch(err => reject(err))
        })
    }

    getSessionTracks = async (roomCode) => {
        return new Promise((resolve, reject) => {
            this.props.dbRef.collection('tracksInRoom').doc(roomCode).collection('tracks').orderBy('timeAdded').get()
                .then((snapshots) => {
                    console.log(snapshots)
                    if(snapshots.empty)
                        resolve(false)
                    else
                        resolve(snapshots.docs.map((doc) => doc.data().track))
                })
                .catch(err => reject(err))
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

    //call with offset 0 and pass in all the tracks to add to the playlist
    importTracksToPlaylist = (userID, playlistID, tracks, offset) => {
        return new Promise((resolve, reject) => {

            if(offset >= tracks.length)
                resolve()
            else{
                var trackBatch = tracks.slice(offset, offset+100) // gets 100 tracks
                spotifyApi.addTracksToPlaylist(userID, playlistID, trackBatch)
                    .then(() => {
                        this.importTracksToPlaylist(userID, playlistID, tracks, offset + 100)
                            .then(() => resolve())
                            .catch(err => reject(err)) //propogate err up
                    }) //add next batch
                    .catch(err => reject(err))
            }
            
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
    
    changePage = (nextPage, tracks=null, playlistRef=null) => {
        if(nextPage === 'dashboard') {
            if(this.state.page === 'trackImport'){
                this.setState({page: 'loading', loading: 'Creating Spotify Playlist ...'})
                this.createPlaylist(this.getDate() + ' TrnTable Session', tracks)
                    .then((playlistRef => {
                        this.setState({page: 'dashboard', 
                                    sessionType: 'host', 
                                    queue: tracks,
                                    playlistRef: playlistRef})}))
                    .catch(err=> console.trace(err))
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
      

    setRoomCode = async (roomCode) => {
        await this.setState({roomRef: roomCode})
        var roomInfo = {host: true, room: roomCode}
        this.props.dbRef.collection('users').doc(this.state.user.uid).set(roomInfo)
    }

    createPlaylist = (name, tracks) => {
        return new Promise((resolve, reject) => {
            console.log('%c Creating Playlist', 'color: orange;font-weight: bold')
            console.log({name, tracks})

            spotifyApi.createPlaylist(this.state.user.uid, {name: name})
                .then((playlist) => {
                    var playlistRef = { href: playlist.href, 
                        uri: playlist.uri,
                        id: playlist.id,
                        owner: playlist.owner,
                        tracks: tracks.length
                    }
                    var userInfo = {playlistRef: playlistRef,
                                    host: true,
                                    room: this.state.roomRef}

                     //store playlist object in state
           
                    this.props.dbRef
                                .collection('users')
                                .doc(this.state.user.uid)
                                .set(userInfo)
                                
                    return playlistRef
                })
                .then((playlistRef) => {
                    //write all tracks added by host, to the database (as a batch)
                    console.log('%c Playlist Created', 'color: orange;font-weight: bold')
                     console.table(playlistRef)

                    var batch = this.props.dbRef.batch()
                    
                    tracks.forEach((track) => { 
                        //generate unique track id
                        var trackRef = this.props.dbRef.collection('tracksInRoom')
                                                       .doc(this.state.roomRef)
                                                       .collection('tracks').doc()
                        batch.set(trackRef, {track: track, timeAdded: new Date()})
                    })
                
                    batch.commit().then(() => {
                        console.log('%c Batch completed', 'color: orange;font-weight: bold')
                        console.table(playlistRef)
                        this.importTracksToPlaylist(this.state.user.uid, playlistRef.id, tracks.map(track => track.uri), 0)
                        .then(()=>{
                            console.log('%c Imported Tracks', 'color: orange;font-weight: bold')
                            console.table(playlistRef)
                            resolve(playlistRef)
                        })
                        .catch((err) => reject(err))
                    })
              
                    .catch(err => {
                        console.log(err)
                        reject(err)
                    })
                
                })
                .catch(err => {                                                         
                    if(err.status === 401){
                        this.updateToken()
                            .then(this.createPlaylist(name))
                    }
                    else{
                        reject(err)
                    }
                }) 
        })
        
    }

  render() {

    var page = <LoadingScreen message={this.state.loading}/>
    const currentPage = this.state.page
    const { user, sessionType, queue, playlistRef } = this.state
    if(currentPage === 'sessionType') 
        page = <SessionType dbRef={this.props.dbRef} changePage={this.changePage} 
                            user={user} setRoomCode={this.setRoomCode}/>
    else if(currentPage === 'dashboard') 
        page = <Dashboard user={user} firebase={this.props.firebase} playlistRef={playlistRef} 
                changePage={this.changePage} apiRef={spotifyApi} dbRef={this.props.dbRef} tracks={queue}
                roomCode={this.state.roomRef} accessToken={this.state.token} 
                updateToken={this.refreshAccessToken} type={sessionType} settings={this.state.settings}/>
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