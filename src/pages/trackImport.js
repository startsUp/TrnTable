import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'
import List from './components/list'
import {ReactComponent as MenuIcon} from '../res/images/menu.svg'
import placeholderIcon from '../res/images/spotifyIcon.png'
import {ReactComponent as LoadingIcon} from '../res/images/loading.svg'
//A SearchResultSection can be used to show track, album and artist results
const SearchResultSection = props => (
    <div>
        
    </div>
)
const Divider = props => {
    return(<div className='divider' style={{backgroundColor:props.color, width: props.width, height: props.height}}/>)
}

const UserLibraryButton = props => (
    <div className='import-library-button' id={props.selected ? 'active':''} onClick={()=> props.showLibrary(props.id)}>
        <div>{props.icon}</div>
        <div>{props.desc}</div>
    </div>
)
const LibrarySidebar = props => (
    <div className='import-library-container'>
        <div className='heading' id='import-head'> Your Library </div>
        <Divider/>
        <UserLibraryButton id='songs' desc='Songs' selected={'songs'===props.view} showLibrary={() => props.showLibrary('songs')}/>
        <UserLibraryButton id='playlst' desc='Playlist' selected={'playlist'===props.view} showLibrary={() => props.showLibrary('playlist')}/>
        <UserLibraryButton id='albums' desc='Albums' selected={'albums'===props.view}  showLibrary={() => props.showLibrary('albums')}/>
    </div>
)
const ImportContainer = props => (
    <div className='import-container'>
        <div id='import-header-container'>
            <div className='icon-container'><MenuIcon id={props.showSidebar ? 'icon-active' : 'menu-icon'} onClick={props.toggleSidebar}/></div>
            <div className='show-queue-button' id={props.active ? 'active': ''} onClick={props.showQueue}> Queue </div> 
            <input id='spotify-search-input' placeholder='Search... '/>
        </div>
        <Divider color='#1ED660' width='100%' height='0.05em'/>
        <div className='import-main-container' id={props.showSidebar ? 'import-w-sidebar': ''}>
            {props.showSidebar && <LibrarySidebar showLibrary={props.showLibrary} view={props.view} />} 
            <List emptyMessage={props.emptyMessage} items={props.list} contentClick={props.contentClick}
                  type={props.view} onAction={props.onAction} updateTracks={props.updateTracks}/>
        </div>
        
        
    </div>
)

/* <div className='import-footer-container'>
            <UserLibraryButton id='songs' desc='Songs' showLibrary={props.showLibrary}/>
            <UserLibraryButton id='playlst' desc='Playlist' showLibrary={props.showLibrary}/>
            <UserLibraryButton id='albums' desc='Albums' showLibrary={props.showLibrary}/>
    </div> */
class ImportTrack extends Component {
    constructor(props){
        super(props)
        this.state = {
            queue: [], //actual queue that gets updated when the user chooses to see it
            userSavedSongs: [],
            totalSavedSongs: null,
            totalSavedPlaylist: null,
            totalSavedAlbums: null,
            selectedSavedSongs: [],
            savedSongsOffset: 0,
            userPlaylists: [],
            playlistOffset: 0,
            playlistTracks: [],
            currentPlaylist: [],
            userAlbums: [],
            currentAlbum: [],
            albumOffset: 0,
            tracksToAdd : [], //cache 
            selectedPlaylist : null,
            view: 'songs',
            showSidebar: true
        }
    }
    componentDidMount = () => {
        this.props.apiRef.getMySavedTracks({limit:50})
            .then(data => {
                
                this.setState({userSavedSongs: this.parseData('songs', data), 
                                savedSongsOffset:50, totalSavedSongs: data.total})
            })
    }

    parseData = (dataType, data, albumRef=null) => {
        if(dataType === 'songs' || dataType === 'albumSongs')
        {
            var tracks = []
            data.items.forEach(item => { 
                var track = item.track
                var icon = null
                var albumArt = null
                var name = null
                if(dataType === 'albumSongs'){
                    track = item
                    icon = albumRef.iconURL
                    albumArt = albumRef.albumArt
                    name = albumRef.name
                }else{
                    icon = track.album.images[2].url
                    albumArt = track.album.images
                    name = track.album.name
                }
                    

                var artists = track.artists.map(elem => {return elem.name}).join(", ")
                tracks.push({trackName: track.name,
                             content: track.name,
                             subContent: artists,
                             artists: artists,
                             iconURL: icon,
                             albumArt: albumArt,
                             albumName: name, 
                             id: track.id, 
                             uri: track.uri})
            })
            return tracks
        }
        else if (dataType === 'playlist')
        {
            var playlists = []
           
            data.items.forEach(item => { 
                playlists.push({name: item.name,
                             content: item.name,
                             iconURL: item.images.length > 0 ? item.images[0].url : placeholderIcon, 
                             id: item.id, 
                             uri: item.uri,
                             ownerID: item.owner.id})
            })
            return playlists
        }
        else if (dataType === 'albums')
        {
            var albums = []
            data.items.forEach(item => { 
                var album = item.album
                var artists = album.artists.map(elem => {return elem.name}).join(", ")
                albums.push({name: album.name,
                             artists: artists,
                             content: album.name,
                             subContent: artists,
                             iconURL: album.images[2].url,
                             albumArt: album.images,
                             id: album.id,
                             totalTracks: album.total_tracks, 
                             uri: album.uri})
            })
    
            return albums
        }

    }
    updateTracks = (tracks) => {
        this.setState({tracksToAdd: tracks})
    }
    
    showTracksFor = (item) => {
        if(this.state.view === 'albums'){
            if(this.state.currentAlbum.id !== item.id){
                this.props.apiRef.getAlbumTracks(item.id, {limit:50})
                    .then((data) => {
                        console.log(item)
                        this.setState({currentAlbum: {id: item.id, tracks: this.parseData('albumSongs', data, item)}, 
                                        view:'albumTracks',})
                    })
            }else
                this.setState({view: 'albumTracks'})
            // this.props.apiRef.getPlaylistTracks(user.id, playlistID, options, callback 
        }
        else if (this.state.view === 'playlist'){
            if(this.state.currentPlaylist.id !== item.id){
                this.props.apiRef.getPlaylistTracks(item.ownerID, item.id, {limit:50})
                    .then((data) => {
                        this.setState({currentPlaylist: {id: item.id, tracks: this.parseData('songs', data)}, 
                                        view:'playlistTracks'})
                    })
            }

        }
    }
    showLibrary = (type) => {
        if(type === 'songs'){
            
            if(this.state.totalSavedSongs === null  || this.state.totalSavedSongs > this.state.savedSongsOffset)
            {
                this.setState({view: 'loading'})
                this.props.apiRef.getMySavedTracks({offset: this.state.savedSongsOffset, limit:50})
                .then(data =>{
                    this.setState({userSavedSongs: this.parseData(type, data), 
                        savedSongsOffset: this.savedSongsOffset+50, view:'songs', totalSavedSongs: data.total})
                    
                })
            }
            this.setState({view: 'songs'})
            
                    

        }
        else if (type === 'playlist'){
            
        if (this.state.totalSavedPlaylist === null || this.state.totalSavedPlaylist > this.state.playlistOffset){
            this.setState({view: 'loading'})
            this.props.apiRef.getUserPlaylists({offset: this.state.playlistOffset, limit:50})
                             .then(data =>{
                                 
                                this.setState({userPlaylists: this.parseData(type, data), 
                                    playlistOffset: this.playlistOffset+50,view:'playlist',
                                    totalSavedPlaylist:data.total}
                     )
                             })
            }
            this.setState({view: 'playlist'})
                                
        }
        else if (type === 'albums'){
            
            if (this.state.totalSavedAlbums === null || this.state.totalSavedAlbums > this.state.albumOffset) { //albums
                this.setState({view:'loading'})
                this.props.apiRef.getMySavedAlbums({offset: this.state.albumOffset, limit:50})
                                .then(data =>{
                                    this.setState({userAlbums: this.parseData(type, data), view:'albums',
                                        albumOffset: this.albumOffset+50, totalSavedAlbums: data.total}
                        )
                                })
                                    
            }
            this.setState({view: 'albums'})
        }
    }
    moveTracksToQueue = () => {
        const tracks = this.state.tracksToAdd
        if(tracks.length !== 0){
            const updatedQueue = [...this.state.queue, this.state.tracks]
            console.log(updatedQueue)
            this.setState({tracksToAdd: [], queue: updatedQueue})
        }
        
    }
    showQueue = () => {
        this.moveTracksToQueue()
        
        this.setState({view:'queue'})
    }

    toggleSidebar = () => {
        this.setState({showSidebar: !this.state.showSidebar})
    }
    render() {
        const headerInfo = <div id='session-info'>Before we start, let's add some music!</div>
        const view = this.state.view
        var emptyMessage = view === 'queue' ? 
                            'Added songs will show up here' : 'No saved ' + this.state.view
        var list = []
        if (view === 'queue') 
            list = this.state.queue
        else if(view === 'songs') 
            list = this.state.userSavedSongs
        else if(view === 'playlist')
            list = this.state.userPlaylists
        else if (view === 'albums')
            list = this.state.userAlbums
        else if (view === 'loading')
            emptyMessage = <LoadingIcon className='icon-container' id='menu-icon'/>
        else if (view === 'albumTracks')
            list = this.state.currentAlbum.tracks
        else if (view === 'playlistTracks')
            list = this.state.currentPlaylist.tracks

        return (
            <div className='session-container' id='import'>
                <div className='session-header'>
                    <div className='session-title'>
                        <div><img className='header-logo' src={appIcon}/></div>
                        <div className='header-title'>TrnTable</div>
                    </div>
                </div>
                {headerInfo}
                <ImportContainer active={this.state.view === 'queue'} 
                                showQueue={this.showQueue}
                                showLibrary={this.showLibrary} 
                                emptyMessage={emptyMessage}
                                list={list}
                                view={view}
                                showSidebar={this.state.showSidebar}
                                toggleSidebar={this.toggleSidebar}
                                contentClick={this.showTracksFor}
                                updateTracks={this.updateTracks}/>
            </div> 
        )
	}
}	
export default ImportTrack