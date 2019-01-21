import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import SpotifyPlayer from './components/spotifyPlayer'
import GuestPlayer from './components/guestPlayer'
import HostBar from './components/hostbar'
import Settings, {DefaultHostSettings} from './components/settings'
import AppLogo from './components/logo'
import DashboardSidebar from './components/siderbar'
import {ReactComponent as MenuIcon} from '../res/images/menu.svg'
import {ReactComponent as SettingsIcon} from '../res/images/dashboard-settings.svg'
import {ReactComponent as CloseIcon} from '../res/images/dashboard-close.svg'
import {ReactComponent as GuestsIcon} from '../res/images/dashboard-group.svg'
import { parseData, hostListeners, guestListeners, getGuests, getRequests } from '../functions'
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
            settings: DefaultHostSettings
            }
    }
    
 

    componentDidMount = () => {

        this.props.dbRef.collection('rooms').doc(this.props.roomCode).get()
            .then((snapshot) => console.log(snapshot.data()))
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
        console.log(type)
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
        console.log(data)
        if(type === 'guest')
            this.setState({guests: [...guests, data]})
        else if(type === 'request')
            this.setState({requests: [...requests, data]})
     
    }

    updateCurrentTrack = () => {
        
    }

    show = (option) => {
        const {sidebar}=this.state
        this.setState({sidebar: {...sidebar, view: option}})
    }

    displayResults = (query, data) => {
        
        const tracks = parseData('songs', data.tracks)
        const playlists = parseData('playlist', data.playlists)
        const albums = parseData('albums', data.albums)
        const artists = parseData('artists', data.artists)

        
        this.setState({search: {tracks: tracks, 
                                playlists: playlists, 
                                albums: albums, 
                                artists: artists}})


    }
    playSong = (uri) => {
        this.spotifyPlayer.current.startPlaylistPlayback({uri: uri})
    }
    toggleSettings = () => {
        this.setState({settingsView: !this.state.settingsView})
    }
    stopSession = () => {
        //delete session info from database
        this.props.dbRef.collection('users').doc(this.props.user.uid).delete()
        this.props.changePage('sessionType')
    }
    getTracks = () => {
        return this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').get()
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
                             {name: 'Requests'},
                             {name: 'Add Tracks'}] :
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
                                 />
                }
                <div className='sidebar-container'>
                {sidebar.show && <DashboardSidebar 
                                        list={sidebar.view === 'Queue' ? tracks : requests} 
                                        view={sidebar.view} 
                                        options={options} 
                                        onSearchResults={this.displayResults}
                                        searchRes={sidebar.view === 'Add Tracks' && search}
                                        show={this.show}
                                        onPlay={this.playSong}
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