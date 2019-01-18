import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import SpotifyPlayer from './components/spotifyPlayer'
import GuestPlayer from './components/guestPlayer'
import HostBar from './components/hostbar'
import AppLogo from './components/logo'
import DashboardSidebar from './components/siderbar'
import {ReactComponent as MenuIcon} from '../res/images/menu.svg'
import {ReactComponent as SettingsIcon} from '../res/images/dashboard-settings.svg'
import {ReactComponent as CloseIcon} from '../res/images/dashboard-close.svg'
import {ReactComponent as GuestsIcon} from '../res/images/dashboard-group.svg'
import { parseData } from '../functions'
const Track = props => (
    // url, albumArt.url, albumName, artists
    <div className='track-card-container'>
        <div className='track-art'>
            <img src={props.albumArtURL}/>
        </div>
        <div className='track-info'>
            <div id='track-name' className='track-info-text'>{props.name}</div>
            <div id='track-artists' className='track-info-text'>{props.artist}</div>
        </div>
        {props.added ? 
            <div onClick={props.remove}> <div>➖</div> </div> : 
            <div onClick={props.add}> <div>➕</div> </div>
        }
    </div>
     
)


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
        console.log(this.props.tracks)
        this.state = {
            playlistRef: this.props.playlistRef,
            fetchTimestamp: null, //do (= new Date()) after initial fetch of queue
            unsubscribe: null,
            tracks: this.props.tracks,
            sessionType: this.props.type,
            activeDevice: null,
            settingsView: false,
            sidebar: {show: false, view: 'Home'},
            view: 'normal',
            guests: [{id: 's'}]
        }
    }

    

    componentDidMount = () => {

        //if sessiontype is host then subscribe to
        // console.log(this.props.firebase.auth().currentUser)
        // var getFirstFetch = this.getTracks()
        // var unsubscribe = this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').orderBy('addedTimestamp').startAt(this.state.fetchTimestamp)
        //         .onSnapshot((snapshot) => {
        //             console.log(snapshot.docs)

        //                 snapshot.docChanges().forEach((change) => {
        //                     if (change.type === "added") {
        //                         var doc = change.doc
        //                         let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
        //                         if (source === 'Server') {
        //                             this.setState({ //update local queue
        //                                 tracks: [] 
        //                             })
        //                         } else {
        //                         // Do nothing, it's a local update so ignore it
        //                         }
                                
        //                     }   
        //                 })
        //             })
        // this.setState({unsubscribe: unsubscribe})
    }

    updateCurrentTrack = () => {
        
    }

    show = (option) => {
        if(option === 'Queue')
            this.setState({sidebar: {show: this.state.sidebar.show, view: option}})
        else if (option === 'Home')
            this.setState({sidebar: {show: this.state.sidebar.show, view: option}})
        else if (option === 'Add Tracks')
            this.setState({sidebar: {show: this.state.sidebar.show, view: option}})
    }

    displayResults = (data) => {
        console.log(data)
        const tracks = parseData('songs', data.tracks)
        const playlists = parseData('playlist', data.playlists)
        const albums = parseData('albums', data.albums)
        const artists = parseData('artists', data.artists)

        
        this.setState({search: {tracks: tracks, 
                                playlists: playlists, 
                                albums: albums, 
                                artists: artists}})


    }
    stopSession = () => {
        //delete session info from database
        this.props.dbRef.collection('users').doc(this.props.user.uid).delete()
        this.props.changePage('sessionType')
    }
    getTracks = () => {
        return this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').get()
    }
    componentWillUnmount = () => {
        // this.state.unsubscribe()
    }
    toggleSidebar = () => {
        const { show, view } = this.state.sidebar
        this.setState({sidebar: {show: !show, view: view}})
    }
    render() {
        
        const host = (this.state.sessionType === 'host')
        const { activeDevice, 
                settingsView, 
                guests, 
                view, 
                tracks, 
                sidebar,
                search } = this.state
        const { roomCode, 
                user, 
                apiRef, 
                updateToken, 
                accessToken } = this.props
        
        const hostBarIcon = settingsView ? <CloseIcon className='dash-logo'/> : 
                                           <SettingsIcon className='dash-logo'/>
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
                <HostBar roomCode={roomCode} 
                            title={ host ? ` ${user.displayName}'s Session` :
                                'TrnTable Session'}
                            icon={hostBarIcon}
                            guestsIcon={guestsIcon}
                            onClick={() => this.setState({settingsView: !this.state.settingsView})}
                />
                <div className='sidebar-container'>
                {sidebar.show && <DashboardSidebar 
                                        list={tracks} 
                                        view={sidebar.view} 
                                        options={options} 
                                        onSearchResults={this.displayResults}
                                        searchRes={sidebar.view === 'Add Tracks' && search}
                                        show={this.show}
                                        apiRef={apiRef}/>
                }
                </div>
                
                <div className='dashboard-view-container'>
                    <MenuIcon className='dash-logo' id='dashboard-menu-icon' onClick={this.toggleSidebar}/>
                    
                    {host ?
                        <SpotifyPlayer apiRef={apiRef} user={user} tracks={this.props.tracks} stopSession={this.stopSession}
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