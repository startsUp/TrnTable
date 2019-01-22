import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import SpotifyPlayer from '../components/spotifyPlayer'
import GuestPlayer from '../components/guestPlayer'
import HostBar from '../components/hostbar'
import Settings, {newSettings} from '../components/settings'
import AppLogo from '../components/logo'
import DashboardSidebar from '../components/siderbar'
import {ReactComponent as MenuIcon} from '../res/images/menu.svg'
import {ReactComponent as SettingsIcon} from '../res/images/dashboard-settings.svg'
import {ReactComponent as CloseIcon} from '../res/images/dashboard-close.svg'
import {ReactComponent as GuestsIcon} from '../res/images/dashboard-group.svg'
import { parseData, hostListeners, guestListeners, getGuests, getRequests, isAlreadyInQueue } from '../functions'
// const Track = props => (
//     // url, albumArt.url, albumName, artists
//     <div className='track-card-container'>
//         <div className='track-art'>
//             <img src={props.albumArtURL}/>
//         </div>
//         <div className='track-info'>
//             <div id='track-name' className='track-info-text'>{props.name}</div>
//             <div id='track-artists' className='track-info-text'>{props.artist}</div>
//         </div>
//         {props.added ? 
//             <div onClick={props.remove}> <div>➖</div> </div> : 
//             <div onClick={props.add}> <div>➕</div> </div>
//         }
//     </div>
     
// )


const TrackQueue = props => {
    return(<div></div>)

}

const DashboardHeader = props => {
    return(
        <div>
            
        </div>
    )
}

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
            guests: [],
            requests: [],
            settings: this.props.settings,
            tracksToAdd: [],
            tracksToAddQueue: [],
        }
    }
    
 

    componentDidMount = () => {


        const {type, dbRef, roomCode} = this.props
        this.initialzie(type, dbRef, roomCode)  //fetch necessary data

        //setup listeners
        var listeners = []
        if(type === 'host'){
            listeners = hostListeners(dbRef, roomCode, new Date(), this.handleNewData)
        }
        else {
            listeners = guestListeners(dbRef, roomCode, new Date(), this.handleNewData)
        }
        this.setState({listeners: listeners})
        
    
    }

    initialzie = async (type, dbRef, roomCode) => {
        if(type ==='host'){
            var guests = await getGuests(dbRef, roomCode)
            var requests = await getRequests(dbRef, roomCode)
            this.setState({guests: guests, requests: requests})
        }
    }
    componentWillUnmount = () => {
        // unsubscribe
        this.state.listeners.forEach(listener => {
            listener.unsubscribe()
        })
    }
    handleNewData = (type, data) => { 
        const {guests, requests} = this.state
        if(type === 'guest')
            this.setState({guests: [...guests, data]})
        else if(type === 'request')
            this.setState({requests: [...requests, data]})
     
    }
    updateCurrentTrack = () => {
        
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
        const { user, playlistRef, apiRef } = this.props
        apiRef.unfollowPlaylist(user.uid, playlistRef.id)
                .catch(err => {
                    if(err.status === 401){
                        this.props.updateToken()
                            .then(this.getSavedTracks())
                    }
                }) 
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
    
    handleTrackAdd = (indexes) => {
        this.setState({tracksToAdd: indexes})
    }
    updateTracksInDB = async () => {
        const {tracksToAddQueue, tracks} = this.state
        await this.props.addMultipleTracks(tracksToAddQueue)
        const trackURIs = tracksToAddQueue.map(track => track.uri)
        await this.props.importTracksToPlaylist(this.props.user.uid, 
                            this.props.playlistRef.id, trackURIs, 0)
        
        this.setState({tracks: [...tracks, ...tracksToAddQueue.slice()], tracksToAddQueue: [], tracksToAdd:[]})
        
    }
    updateTracksToAdd = async () => {
        return new Promise(async (resolve, reject)=> {
            const {tracksToAdd, sidebar, search} = this.state
                 //change view if show argument is true
            if (tracksToAdd.length === 0){
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
                if(!isAlreadyInQueue(track))
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
                sidebar,
                search,
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
        const options = host ?
                            [{name: 'Queue'},
                             {name: 'Song Requests'},
                             {name: 'Add Songs'}] :
                            [{name: 'Request Tracks'}]
        return (
            <div className={host ? 'dashboard-container' : 'dashboard-guest-container'}>
                <HostBar dark={settingsView} roomCode={roomCode} 
                            title={ host ? ` ${user.displayName}'s Session` :
                                'TrnTable Session'}
                            icon={hostBarIcon}
                            guestsIcon={guestsIcon}
                            onClick={() => this.setState({settingsView: !this.state.settingsView})}
                />
                {settingsView && <Settings endSession={this.stopSession} 
                                           close={this.toggleSettings}
                                           settings={settings}
                                           updateSettings={this.handleSettingsChange}
                                 />
                }
                <div className='sidebar-container'>
                {sidebar.show && <DashboardSidebar 
                                        list={sidebar.view === 'Queue' ? tracks : requests} 
                                        view={sidebar.view} 
                                        options={options} 
                                        onSearchResults={this.displayResults}
                                        searchRes={sidebar.view === 'Add Songs' && search}
                                        show={this.show}
                                        onPlay={this.playSong}
                                        updateTracks={this.handleTrackAdd}
                                        apiRef={apiRef}/>
                }
                </div>
                
                <div className='dashboard-view-container'>
                    <MenuIcon className='dash-logo' id='dashboard-menu-icon' onClick={this.toggleSidebar}/>
                    
                    {host ?
                        <SpotifyPlayer ref={this.spotifyPlayer} apiRef={apiRef} user={user} tracks={this.props.tracks} stopSession={this.stopSession}
                            accessToken={accessToken} updateToken={updateToken} playlistRef={this.props.playlistRef}
                            updateCurrentTrack={this.updateCurrentTrack}/>
                        :
                        <GuestPlayer apiRef={apiRef} user={user} 
                            accessToken={accessToken} updateToken={updateToken}/>
                    }
                </div>    
            </div> 
        )
	}
}	
export default Dashboard