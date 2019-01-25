import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import SpotifyPlayer from '../components/spotifyPlayer'
import GuestPlayer from '../components/guestPlayer'
import HostBar from '../components/hostbar'
import ConfirmActionPopup from '../components/confirmPopup.js'
import Settings, {newSettings} from '../components/settings'
import AppLogo from '../components/logo'
import DashboardSidebar from '../components/siderbar'
import {ReactComponent as MenuIcon} from '../res/images/menu.svg'
import {ReactComponent as SettingsIcon} from '../res/images/dashboard-settings.svg'
import {ReactComponent as CloseIcon} from '../res/images/dashboard-close.svg'
import {ReactComponent as GuestsIcon} from '../res/images/dashboard-group.svg'
import { parseData, hostListeners, guestListeners, isAlreadyInQueue, updateVote, requestTrack } from '../functions'
import {ReactComponent as LikeIcon} from '../res/images/player-like.svg'

class Dashboard extends Component {
    constructor(props){
        super(props)

        
        if(this.props.type === 'host')
            this.spotifyPlayer = React.createRef()
        this.state = {
            playlistRef: this.props.playlistRef,
            fetchTimestamp: null, //do (= new Date()) after initial fetch of queue
            listeners: [],
            tracks: this.props.tracks,
            activeDevice: null,
            settingsView: false,
            sidebar: {show: false, view: 'Home'},
            view: 'normal',
            guests: this.props.guests,
            requests: this.props.requests,
            offset: 0,
            settings: this.props.settings,
            tracksToAdd: [],
            tracksToAddQueue: [],
            votes: {likes:0, dislikes: 0}
        }
    }
    
 

    componentDidMount = () => {


        const {type, dbRef, roomCode} = this.props
        

        //setup listeners
        var listeners = []
        if(type === 'host'){
            this.updateVotes(roomCode)

            listeners = hostListeners(dbRef, roomCode, new Date(), this.handleNewData)
        }
        else {
            listeners = guestListeners(dbRef, roomCode, new Date(), this.handleNewData)
        }
        this.setState({listeners: listeners})
        
    
    }
    updateVotes = (roomCode) => {
        this.props.dbRef.collection('nowPlaying').doc(roomCode).get()
            .then((snapshot) =>{
                
                if(snapshot.exits){
                    var data = snapshot.document.data()
                    this.setState({votes: data.votes})
                }

            })
    }

    onVote = async (vote, update=false) => {
        updateVote(this.props.dbRef, this.props.roomCode, vote, update)
    }

    componentWillUnmount = () => {
        // unsubscribe
        this.state.listeners.forEach(listener => {
            listener.unsubscribe()
        })
    
    }
    handleNewData = (type, data) => { 

        const {guests, requests, tracks} = this.state
        if(type === 'guest')
            this.setState({guests: [...guests, data]})
        else if(type === 'votes')
            this.setState({votes: data})
        else if(type === 'queue')
            this.setState({tracks: [...tracks, data.track]})
        else if(type === 'request')
            this.setState({requests: [...requests, data.track]})
        else if(type === 'nowPlaying'){
            this.checkOffset = window.setInterval(()=>this.setOffset(data), 2000)
        }
     
    }
    setOffset = (trackID) => {

        this.state.tracks.forEach((track, index)=>{
            if(track.id === trackID){
                window.clearInterval(this.checkOffset)
                this.setState({offset: index})
            }
        })
    }
    updateCurrentTrack = (trackID) => {
        this.props.dbRef.collection('nowPlaying').doc(this.props.roomCode).set({
            trackID: trackID,
            votes: {likes: 0, dislikes: 0}
        })
    }

    showError = (error, popup) => { 
        this.setState({error: error, popup: popup})
    }
    show = async (option) => { 
        const {sidebar}=this.state
        this.setState({sidebar: {...sidebar, view: option}})
        this.updateTracksToAdd()
    }

    displayResults = async (query, data) => {
        await this.updateTracksToAdd()
        const tracks = parseData('songs', data.tracks)
        this.setState({search: {query: query, tracks: tracks}})
    }
    playSong = (uri) => {
        this.spotifyPlayer.current.startPlaylistPlayback({uri: uri})
    }
    toggleSettings = () => {
        this.setState({settingsView: !this.state.settingsView})
    }

    handleSettingsChange = async (values) => {
        await this.setState({settings: newSettings(values)})
        this.updateSettings()
    }
    
    updateSettings = () => {
        this.props.dbRef.collection('rooms').doc(this.props.roomCode).set({
            settings: this.state.settings
        })
    }

    deletePlaylist = () => {
        if(this.props.type === 'host'){
            const { user, playlistRef, apiRef } = this.props
            apiRef.unfollowPlaylist(user.uid, playlistRef.id)
                    .catch(err => {
                        if(err.status === 401){
                            this.props.updateToken()
                                .then(this.getSavedTracks())
                        }
                    }) 
        }
 
   }

    stopSession = () => {
        //delete session info from database
        const {settings} = this.state
        const {roomCode} = this.props
        if (settings[0].value){
            this.deletePlaylist()
        } 
        this.props.dbRef.collection('users').doc(this.props.user.uid).delete()
        this.props.dbRef.collection('rooms').doc(roomCode).delete()
            .catch(err=>console.log(err))
        this.props.dbRef.collection('tracksInRoom').doc(roomCode).delete()
        .catch(err=>console.log(err))

        this.props.changePage('sessionType')
    }
    

    handleTrackAdd = async (indexes, request=false) => {
        if(request){
            const {requests} = this.state
            await this.setState({tracksToAddQueue: [requests[indexes[0]]]})
            await this.updateTracksInDB()
            this.removeTrack(indexes[0], requests[indexes[0]])
        }
        else{
            this.setState({tracksToAdd: indexes})
        } 
    }
    removeTrack = (index, track) => {
        var updateRequests = this.state.requests.filter((track, i) => i !== index)
        this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode)
                        .collection('requested').doc(track.id).delete()
                        .then(this.setState({requests: updateRequests}))

    }
    updateTracksInDB = async () => {
        const {tracksToAddQueue, tracks} = this.state
        if(this.props.type === 'host'){
            await this.props.addMultipleTracks(tracksToAddQueue)
            const trackURIs = tracksToAddQueue.map(track => track.uri)
            await this.props.importTracksToPlaylist(this.props.user.uid, 
                                this.props.playlistRef.id, trackURIs, 0)
            
            this.setState({tracks: [...tracks, ...tracksToAddQueue.slice()], tracksToAddQueue: [], tracksToAdd:[]})
            
        }else{
            //check if songs is already requested in local queue
            const {requests} = this.state
     

            tracksToAddQueue.forEach(trackToAdd=>{
                if(requests.length > 0){
                    requests.forEach((track)=>{
                        if(track.id !== trackToAdd.id){
                            requestTrack(this.props.dbRef, this.props.roomCode, trackToAdd)
                        }
                    })
                }
                else{
                    requestTrack(this.props.dbRef, this.props.roomCode, trackToAdd)
                }

            })
            
            this.setState({tracksToAddQueue: [], tracksToAdd:[]})
        

        }

    }
    updateTracksToAdd = async () => {
        
        return new Promise(async (resolve, reject)=> {
            const {tracksToAdd, search} = this.state
        
            if (tracksToAdd.length === 0 || !search){
                resolve(0)
                return
            }
            
            await this.copySelectedTracksToQueue(search.tracks, tracksToAdd)
            await this.updateTracksInDB()
            resolve(0)
        })
		
    }
    copySelectedTracksToQueue = async (allTracks,selectedTracks) => {
        var queue = []
        var updated = this.state.tracksToAddQueue.slice()
        
        allTracks.forEach((track, indexVal) =>{
            if(selectedTracks.indexOf(indexVal) !== -1){
                if(!isAlreadyInQueue(this.state.tracks, track))
                    queue.push(Object.assign(track))
            }
        })
        updated.push(...queue)
        await this.setState({tracksToAddQueue: updated})
	}

    toggleSidebar = () => {
        const { show, view } = this.state.sidebar
        this.setState({sidebar: {show: !show, view: view}})
    }
    render() {
        
        const host = (this.props.type === 'host')
        const { activeDevice, 
                settingsView, 
                guests, 
                view, 
                tracks, 
                offset,
                sidebar,
                search,
                tracksToAdd,
                votes,
                error,
                popup,
                requests,
                settings } = this.state
        const { roomCode, 
                user, 
                apiRef, 
                updateToken, 
                accessToken } = this.props
  
        const hostBarIcon = settingsView ? <CloseIcon className='dash-logo' onClick={this.toggleSettings}/> : 
                                           <SettingsIcon className='dash-logo' id='settings-logo' onClick={this.toggleSettings}/>
        const guestsIcon = <div className='dashboard-roominfo' id='guest-logo'>
                                <div id='host-roomcode'>{guests.length}</div>
                                <GuestsIcon className='dash-logo'/>
                           </div>
        const voteIcons = host &&
            <div className='votes-host'>
                {votes.dislikes}
                <LikeIcon className='vote-icon-host' style={{'transform': 'rotate(180deg)'}}/>
                <LikeIcon className='vote-icon-host'/>
                {votes.likes}
            </div>
            
        const options = host ?
                            [{name: 'Queue'},
                             {name: 'Song Requests'},
                             {name: 'Add Songs'}] :
                            [{name: 'Queue'},
                            {name: 'Song Requests'},
                            {name: 'Request Songs'}]
        const searchShow = sidebar.view === 'Add Songs' || sidebar.view === 'Request Songs'
        
        return (
            <div className='dashboard-container'>
                    {error && <ConfirmActionPopup 
                    popupInfo={popup}/>
                    }
                <HostBar dark={settingsView} roomCode={roomCode} 
                            title={ host ? ` ${user.displayName}'s Session` :
                                'TrnTable Session'}
                            icon={hostBarIcon}
                            host={host}

                            guestsIcon={guestsIcon}
                            onClick={() => this.setState({settingsView: !this.state.settingsView})}
                />
                {settingsView && <Settings endSession={this.stopSession} 
                                           close={this.toggleSettings}
                                           settings={settings}
                                           host={host}
                                           updateSettings={this.handleSettingsChange}
                                 />
                }
                <div className='sidebar-container'>
                {sidebar.show && <DashboardSidebar 
                                        host={host}
                                        list={sidebar.view === 'Queue' ? tracks : requests} 
                                        view={sidebar.view} 
                                        options={options} 
                                        onSearchResults={this.displayResults}
                                        searchRes={searchShow && search}
                                        show={this.show}
                                        onPlay={this.playSong}
                                        updateTracks={this.handleTrackAdd}
                                        addTracks={this.updateTracksToAdd}
                                        tracksToAdd={tracksToAdd.length > 0}
                                        apiRef={apiRef}/>
                }
                </div>
                
                <div className='dashboard-view-container'>
                    <MenuIcon className='dash-logo' id='dashboard-menu-icon' onClick={this.toggleSidebar}/>
                    
                    {host ?
                        <SpotifyPlayer ref={this.spotifyPlayer} apiRef={apiRef} user={user} tracks={this.props.tracks} stopSession={this.stopSession}
                            accessToken={accessToken} updateToken={updateToken} playlistRef={this.props.playlistRef}
                            votes={voteIcons} onError={this.showError}
                            updateCurrentTrack={this.updateCurrentTrack}/>
                        :
                        <GuestPlayer apiRef={apiRef} user={user} track={tracks[offset]} vote={{like: false, dislike: false}}
                            accessToken={accessToken} updateToken={updateToken} vote={this.onVote}/>
                    }
                </div>    
            </div> 
        )
	}
}	
export default Dashboard