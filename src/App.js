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
        
		this.state = {
            loggedIn: token ? true : false,
            page:'loading', //original : sType, login
            roomRef: null, //temp room for testing
            user: null, 
            token: token,
            landingPage: 'sessionType',
            firebaseToken: firebaseToken,
            refreshToken: refreshToken,
            queue: [], 
            requests: [],
            guests: [],
            sessionType: null,
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
    getSpotifyInfo = async () => {
        return new Promise((resolve, reject) => {
            spotifyApi.getMe()
            .then((data)=>{
                resolve(data)
            })
            .catch(err => {                                                         
                if(err.status === 401){
                    this.refreshAccessToken()
                        .then(this.getSpotifyInfo())
                }
                else{
                    reject(err)
                }
            }) 
        })
        
    }
  
    showLandingPage = async (res) => {

        if(!res){
            var spotifyData = await this.getSpotifyInfo()
            this.setState({page: this.state.landingPage, spotifyData: spotifyData})
            return
        }
      
        const roomInfo = await this.getRoomInfo(res.room)
        if (res.playlistRef){

            var tracks = await this.getSessionTracks(res.room)
            var requests = await this.getSessionTracks(res.room, 'requested')
            var guests = await this.getGuests(res.room)
            
            this.setState({
                page: 'dashboard',
                playlistRef: res.playlistRef,
                roomRef: res.room,
                sessionType: res.host ? 'host' : 'guest',
                queue: tracks,
                requests: requests,
                settings: roomInfo.settings,
                guests: guests
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
            var tracks = await this.getSessionTracks(res.room)
            var requests = await this.getSessionTracks(res.room, 'requested')
            var guests = await this.getGuests(res.room)
            this.setState({
                page: 'dashboard',
                roomRef: res.room,
                sessionType: 'guest',
                settings: roomInfo.settings,
                queue: tracks,
                requests: requests,
                guests: guests
            })
        }
    }
    getGuests = async (roomCode) => {
        return new Promise((resolve, reject) => {
            this.props.dbRef.collection('rooms').doc(roomCode).collection('users').get()
            .then((snapshots) => {
                if(snapshots.empty)
                    resolve(false)
                else
                    resolve(snapshots.docs.map((doc) => doc.data()))
            })
            .catch(err => reject(err))
        })
        
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

    getSessionTracks = async (roomCode, type='tracks') => {
        return new Promise((resolve, reject) => {
            this.props.dbRef.collection('tracksInRoom').doc(roomCode).collection(type).orderBy('timeAdded').get()
                .then((snapshots) => {
                    
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
    changePage = async (nextPage, tracks=null, playlistRef=null) => {
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
                var roomInfo = await this.getRoomInfo(this.state.roomRef)
                var roomTracks = await this.getSessionTracks(this.state.roomRef)
                var requests = await this.getSessionTracks(this.state.roomRef, 'requested')
                var guests = await this.getGuests(this.state.roomRef)
                this.setState({page: 'dashboard', 
                               sessionType: 'guest',
                               settings: roomInfo.settings,
                               guests: guests,
                               requests: requests,
                               tracks:roomTracks,
                               playlistRef: roomInfo.playlistRef})
            }
        }  
        else{
            if(nextPage === 'sessionType' && !this.state.spotifyData){
                var spotifyData = await this.getSpotifyInfo()
                await this.setState({spotifyData: spotifyData})
            }
            this.setState({page: nextPage}) 
        }
             
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
      
    setQueue = async (tracks) => {
        await this.setState({queue: tracks})
    }
    setGuests = async (guests) => {
        await this.setState({guests: [guests]})
    }
    setRoomCode = async (roomCode, isHost) => {
       
        await this.setState({roomRef: roomCode})
        var roomInfo = {host: isHost, room: roomCode}
        
        this.props.dbRef.collection('users').doc(this.state.user.uid).set(roomInfo)
        if (!isHost){
            this.props.dbRef.collection('rooms')
                    .doc(roomCode)
                    .collection('users')
                    .doc(this.state.user.uid)
                    .set({joinedTimestamp: new Date(), name: this.state.user.displayName})
        }
    }

    addMultipleTracks = async (tracks, playlist=null) => {
        return new Promise((resolve, reject) => {
            var batch = this.props.dbRef.batch()
            if(playlist){
                var room = this.props.dbRef.collection('rooms').doc(this.state.roomRef)
                var user = this.props.dbRef.collection('users').doc(this.state.user.uid)
                batch.update(user, {playlistRef: playlist})
                batch.update(room, {playlistRef: playlist})
            }


            tracks.forEach((track) => { 
                //generate unique track id
                var trackRef = this.props.dbRef.collection('tracksInRoom')
                                               .doc(this.state.roomRef)
                                               .collection('tracks').doc()
                var time = new Date()
                this.waitLoop()
                batch.set(trackRef, {track: track, timeAdded: time})
            })
            batch.commit().then(() => resolve())
            .catch((err) => reject(err))
        })
    }

    waitLoop = async () => {
        for (let i = 0; i < 100000; i++) {
            let doSomething = i * i * i;
            }
 
    }
    createPlaylist = async (name, tracks) => {
        return new Promise((resolve, reject) => {
            
            

            spotifyApi.createPlaylist(this.state.user.uid, {name: name})
                .then((playlist) => {
                    var playlistRef = { href: playlist.href, 
                        uri: playlist.uri,
                        id: playlist.id,
                        owner: playlist.owner,
                        tracks: tracks.length
                    }

                     //store playlist object in state
                                
                    return playlistRef
                })
                .then((playlistRef) => {
                    this.addMultipleTracks(tracks, playlistRef)
                        .then(()=>{
                            this.importTracksToPlaylist(this.state.user.uid, playlistRef.id, tracks.map(track => track.uri), 0)
                            .then(()=>resolve(playlistRef))
                            .catch(err => {
                                console.log(err)
                                reject(err)
                            })
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
    const { user, sessionType, queue, playlistRef, requests, guests, spotifyData} = this.state
    if(currentPage === 'sessionType') 
        page = <SessionType dbRef={this.props.dbRef} changePage={this.changePage} 
                            getSessionTracks={this.getSessionTracks}
                            setQueue={this.setQueue}
                            setGuests={this.setGuests}
                            spotifyData={spotifyData}
                            user={user} setRoomCode={this.setRoomCode}/>
    else if(currentPage === 'dashboard') 
        page = <Dashboard user={user} firebase={this.props.firebase} 
                playlistRef={playlistRef}
                requests={requests} 
                guests={guests}
                changePage={this.changePage} apiRef={spotifyApi} 
                dbRef={this.props.dbRef} tracks={queue} 
                addMultipleTracks={this.addMultipleTracks}
                importTracksToPlaylist={this.importTracksToPlaylist}
                roomCode={this.state.roomRef} 
                accessToken={this.state.token} 
                updateToken={this.refreshAccessToken} type={sessionType} 
                settings={this.state.settings}/>
    else if(currentPage === 'trackImport') 
        page = <ImportTrack roomCode={this.state.roomRef} user={user} apiRef={spotifyApi}
                changePage={this.changePage}
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