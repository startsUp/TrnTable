import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import List from './components/list'

//A SearchResultSection can be used to show track, album and artist results
const SearchResultSection = props => (
    <div>
        
    </div>
)
const Divider = props => {
    return(<div className='divider' style={{backgroundColor:props.color, width: props.width, height: props.height}}/>)
}

const UserLibraryButton = props => (
    <div className='import-library-button' onClick={()=> props.showLibrary(props.id)}>
        <div>{props.icon}</div>
        <div>{props.desc}</div>
    </div>
)
const ImportContainer = props => (
    <div className='import-container'>
        <div id='import-header-container'>
            <div className='show-queue-button' id={props.active && 'active'} onClick={props.showQueue}> Queue </div> 
            <input id='spotify-search-input' placeholder='Search... '/>
        </div>
        <Divider color='#1ED660' width='100%' height='0.05em'/>
        <List emptyMessage={props.emptyMessage} items={props.list}/>
        <div className='import-footer-container'>
            <UserLibraryButton id='songs' desc='Songs' showLibrary={props.showLibrary}/>
            <UserLibraryButton id='playlst' desc='Playlist' showLibrary={props.showLibrary}/>
            <UserLibraryButton id='albums' desc='Albums' showLibrary={props.showLibrary}/>
        </div>
    </div>
)
class ImportTrack extends Component {
    constructor(props){
        super(props)
        this.state = {
            userSavedSongs: [],
            savedSongsOffset: 0,
            userPlaylists: [],
            playlistOffset: 0,
            playlistTracks: [],
            userAlbums: [],
            albumOffset: 0,
            tracksToAdd : [],
            selectedPlaylist : null,
            showingQueue: true,
            view: 'songs'
        }
    }
    componentDidMount = () => {
        this.props.apiRef.getMySavedTracks()
            .then(data => {
                this.setState({userSavedSongs: this.parseData('songs', data.items)})
            })
        this.setState({savedSongsOffset: 20})
    }

    parseData = (dataType, data) => {
        if(dataType === 'songs')
        {
            console.log(data)
            var tracks = []
            data.forEach(item => { 
                var track = item.track  
                var artists = track.artists.map(elem => {return elem.name}).join(", ")
                tracks.push({trackName: track.name,
                             content: track.name,
                             subContent: artists,
                             iconURL: track.album.images[2].url, 
                             artists: artists,
                             albumArt: track.album.images,
                             albumName: track.album.name, 
                             id: track.id, 
                             uri: track.uri})
            })
            return tracks
        }
    }
    showLibrary = (type) => {
        if(type === 'songs' && this.state.savedSongsOffset === 0){
            this.props.apiRef.getMySavedTracks()
                             .then(data => console.log(data))
            this.setState({savedSongsOffset: 20})
        }
        else if (type === 'playlist' && this.state.playlistOffset === 0){
            this.props.apiRef.getUserPlaylists()
                             .then((data) => console.log(data))
            this.setState({playlistOffset: 20})
        }
        else if (this.state.albumOffset === 0) { //albums
            this.props.apiRef.getMySavedAlbums()
                             .then((data) => console.log(data))
            this.setState({albumOffset: 20})
        }
    }
    showQueue = () => { 
        this.setState({showQueue: true})
    }
    render() {
        const headerInfo = <div id='session-info'>Before we start, let's add some music!</div>
        const view = this.state.view
        var emptyMessage = view === 'queue' ? 
                            'Added songs will show up here' : 'No saved ' + this.state.view
        var list = null
        if (view === 'queue') 
            list = this.state.tracksToAdd
        else if(view === 'songs') 
            list = this.state.userSavedSongs
        else if(view === 'playlist')
            list = this.state.userPlaylists
        else 
            list = this.state.userAlbums
        
        return (
            <div className='session-container'>
                <div className='session-header'>
                    <div className='session-title'>
                        <div><img className='header-logo' src={appIcon}/></div>
                        <div className='header-title'>TrnTable</div>
                    </div>
                </div>
                {headerInfo}
                <ImportContainer active={this.state.showingQueue} 
                                showQueue={this.showQueue}
                                showLibrary={this.showLibrary} 
                                emptyMessage={emptyMessage}
                                list={list}/>
            </div> 
        )
	}
}	
export default ImportTrack