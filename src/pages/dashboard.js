import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import SpotifyPlayer from './components/spotifyPlayer'
import GuestPlayer from './components/guestPlayer'
import AppLogo from './components/logo'
import {ReactComponent as SettingsIcon} from '../res/images/dashboard-settings.svg'

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
            queue : [{id: '6Z8R6UsFuGXGtiIxiD8ISb',name: 'Safe and Sound', artist: 'Capital Cities', albumArt: 'https://i.scdn.co/image/5b5b97a268f39426c8bf1ada36606e6fcbb317eb'}],
            playlistRef: null,
            fetchTimestamp: null, //do (= new Date()) after initial fetch of queue
            unsubscribe: null,
            tracks: [],
            sessionType: this.props.type,
            activeDevice: null
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

    getTracks = () => {
        return this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').get()
    }
    componentWillUnmount = () => {
        this.state.unsubscribe()
    }
    render() {
        
        const host = (this.state.sessionType === 'host')
        const { activeDevice } = this.state
        const { roomCode, 
                user, 
                apiRef, 
                updateToken, 
                accessToken } = this.props 

        return (
            <div className='dashboard-container'>
                <div className='dashboard-header'>
                    <div className='dashboard-roominfo'>
                        <AppLogo styleName='dashboard-logo' text={roomCode}/>
                        {host && <div id='host-roomcode'>{roomCode}</div>}
                    </div>
                    <div className='dashboard-title'>
                        { host ? user.displayName + '\'s Session' :
                            'TrnTable Session' }
                    </div>
                    <div className='dashboard-settings-container'>
                        <SettingsIcon id='settings-logo'/>
                    </div>
                </div>
                {host ?
                    <SpotifyPlayer apiRef={apiRef} user={user} 
                        accessToken={accessToken} updateToken={updateToken}
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