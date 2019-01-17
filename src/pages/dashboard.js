import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import SpotifyPlayer from './components/spotifyPlayer'
import GuestPlayer from './components/guestPlayer'
import HostBar from './components/hostbar'
import AppLogo from './components/logo'
import {ReactComponent as SettingsIcon} from '../res/images/dashboard-settings.svg'
import {ReactComponent as CloseIcon} from '../res/images/dashboard-close.svg'
import {ReactComponent as GuestsIcon} from '../res/images/dashboard-group.svg'
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
        this.state = {
            playlistRef: this.props.playlistRef,
            fetchTimestamp: null, //do (= new Date()) after initial fetch of queue
            unsubscribe: null,
            tracks: this.props.tracks,
            sessionType: this.props.type,
            activeDevice: null,
            settingsView: false,
            guests: [{id: 's'}]
        }
    }

    

    componentDidMount = () => {

        //if sessiontype is host then subscribe to
        console.log(this.props.firebase.auth().currentUser)
        var getFirstFetch = this.getTracks()
        var unsubscribe = this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').orderBy('addedTimestamp').startAt(this.state.fetchTimestamp)
                .onSnapshot((snapshot) => {
                    console.log(snapshot.docs)

                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                var doc = change.doc
                                let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                                if (source === 'Server') {
                                    this.setState({ //update local queue
                                        tracks: [] 
                                    })
                                } else {
                                // Do nothing, it's a local update so ignore it
                                }
                                
                            }   
                        })
                    })
        this.setState({unsubscribe: unsubscribe})
    }

    updateCurrentTrack = () => {
        
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
        this.state.unsubscribe()
    }
    render() {
        
        const host = (this.state.sessionType === 'host')
        const { activeDevice, settingsView, guests } = this.state
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
        return (
            <div className={host ? 'dashboard-container' : 'dashboard-guest-container'}>
                <HostBar roomCode={roomCode} 
                            title={ host ? ` ${user.displayName}'s Session` :
                                'TrnTable Session'}
                            settingsIcon={hostBarIcon}
                            guestsIcon={guestsIcon}
                            onClick={() => this.setState({settingsView: !this.state.settingsView})}
                />
                {host ?
                    <SpotifyPlayer apiRef={apiRef} user={user} tracks={this.props.tracks} stopSession={this.stopSession}
                        accessToken={accessToken} updateToken={updateToken} playlistRef={this.props.playlistRef}
                        updateCurrentTrack={this.updateCurrentTrack}/>
                    :
                    <GuestPlayer apiRef={apiRef} user={user} 
                        accessToken={accessToken} updateToken={updateToken}/>
                }
                
            </div> 
        )
	}
}	
export default Dashboard