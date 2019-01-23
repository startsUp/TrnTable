import React, { Component } from 'react'
import '../App.css'
import List from '../components/list'
import HostBar from '../components/hostbar'
import {ReactComponent as MenuIcon} from '../res/images/menu.svg'

import {ReactComponent as LoadingIcon} from '../res/images/loading.svg'
import {ReactComponent as QueueIcon} from '../res/images/twotone-playlist_add-24px.svg'
import {ReactComponent as StartIcon} from '../res/images/import-done.svg'
import ConfirmActionPopup from '../components/confirmPopup'
import Header from '../components/header'
import SpotifySearch from '../components/spotifySearch'
import SpotifySearchResults from '../components/spotifySearchResults'
import { parseData, getViewDescription, isAlreadyInQueue } from '../functions'

//A SearchResultSection can be used to show track, album and artist results


const Divider = props => {
	return(<div className='divider' id={props.id} style={props.customStyle}/>)
}

const UserLibraryButton = props => (
    <div className='import-library-button' id={props.selected ? 'active':''} onClick={()=> props.showLibrary(props.id)}>
        <div className='import-library-button-desc'>{props.desc}</div>
    </div>
)
const LibrarySidebar = props => (
    <div className='import-library-container'>
        <div className='heading' id='import-head'> Your Library </div>
        <UserLibraryButton id='songs' desc='Songs' selected={'songs'===props.view} showLibrary={() => props.showLibrary('songs')}/>
        <UserLibraryButton id='playlst' desc='Playlist' selected={'playlist'===props.view} showLibrary={() => props.showLibrary('playlist')}/>
        <UserLibraryButton id='albums' desc='Albums' selected={'albums'===props.view}  showLibrary={() => props.showLibrary('albums')}/>
    </div>
)
const ImportContainer = props => (
    <div className='import-container'>
        <div id='import-header-container'>
            <div className='icon-container'><MenuIcon id={props.showSidebar ? 'icon-active' : 'menu-icon'} className='import-icons' onClick={props.toggleSidebar}/></div>
            <SpotifySearch apiRef={props.apiRef} onSearchResults={props.displayResults}/>
            <div className='mobile-import-container'>
                <div className='mobile-icon-container'>
                    <QueueIcon id={props.view === 'queue' ? 'active-icon': ''} className='import-icons'
                    onClick={()=>props.showQueue(true)}/>
                </div>
            </div> 

			<div className='show-queue-button' id={props.view === 'queue' ? 'active': ''} onClick={()=>props.showQueue(true)}> Queue </div> 
			<div className='show-queue-button' onClick={() => props.startSession('startSession')}> Start Session </div>
        </div>
        <div className='import-main-container' id={props.showSidebar ? 'import-w-sidebar': ''}>
            {props.showSidebar && <LibrarySidebar showLibrary={props.showLibrary} view={props.view} />}
            <div id='list-context'>
                <div className='sidebar-context-title' id='context-title'>{props.contextName}</div>
                {props.view === 'search' ?
                    <SpotifySearchResults data={props.searchRes} {...props}/>
                    :
                    <List emptyMessage={props.emptyMessage} items={props.list} contentClick={props.contentClick}
                        type={props.view} selectable={(props.view !== 'playlist' && props.view !== 'albums' && props.view !== 'queue' )}
                        updateTracks={props.updateTracks}/>
                }
            </div> 
        </div>
        
        
    </div>
)

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
            currentPlaylist: {id:'', tracks:[]},
            userAlbums: [],
            currentAlbum: {id:'', tracks:[]},
            albumOffset: 0,
            tracksToAdd : [], //cache 
            selectedPlaylist : null,
            view: 'songs',
			showSidebar: true,
            popup: {show: false},
            search: {tracks: [], artists: [], playlists:[], albums:[]}
        }
	}
	
    componentDidMount = () => {
        console.log('getting tracks')
        this.getSavedTracks()    
    }

    getSavedTracks = () => {
        this.props.apiRef.getMySavedTracks({limit:50})
        .then(data => {
            this.setState({userSavedSongs: parseData('songs', data), 
                            savedSongsOffset:50, totalSavedSongs: data.total})
        })
        .catch(err => {
            console.log({err: err})
            if(err.status === 401){
                this.props.updateToken()
                    .then(this.getSavedTracks())
            }
        }) 
    }
    
    updateTracks = (tracks) => {
        this.setState({tracksToAdd: tracks})
    }
    
    showTracksFor = (item) => {
        
        if(item.uri.includes('album')){
            if(this.state.currentAlbum.id !== item.id){
                this.props.apiRef.getAlbumTracks(item.id, {limit:50})
                    .then((data) => {
                        
                        this.setState({currentAlbum: {id: item.id,name: item.name, tracks: parseData('albumSongs', data, item)}, 
                                        view:'albumTracks',})
                    })
                    .catch(err => {
                        if(err.status === 401){
                            this.props.updateToken()
                                .then(this.showTracksFor(item))
                        }
                    }) 
            }else
                this.setState({view: 'albumTracks'})
        }
        else if (item.uri.includes('playlist')){
            if(this.state.currentPlaylist.id !== item.id){
                this.props.apiRef.getPlaylistTracks(item.ownerID, item.id, {limit:50})
                    .then((data) => {
                        this.setState({currentPlaylist: {id: item.id,name: item.name, tracks: parseData('songs', data)}, 
                                        view:'playlistTracks'})
                    })
                    .catch(err => {
                        if(err.status === 401){
                            this.props.updateToken()
                                .then(this.showTracksFor(item))
                        }
                    }) 
            }
            this.setState({view:'playlistTracks'})

        }
    }
    updateQueue = async (show) => {
        return new Promise(async (resolve, reject)=> {
            const {tracksToAdd, view, search, currentPlaylist, currentAlbum, userSavedSongs} = this.state
            if(tracksToAdd.length === 0){
              if(show)
                await this.setState({view: 'queue'}) 
                 //change view if show argument is true
              resolve(0)
          }
  
          if(view === 'playlistTracks')
              this.copySelectedTracksToQueue(currentPlaylist.tracks, tracksToAdd)
          else if(view === 'albumTracks')
              this.copySelectedTracksToQueue(currentAlbum.tracks, tracksToAdd)
          else if(view === 'songs')
              this.copySelectedTracksToQueue(userSavedSongs, tracksToAdd)
          else if(view === 'search')
              this.copySelectedTracksToQueue(search.tracks, tracksToAdd)
  
          if(show)
              await this.setState({view: 'queue'})
          resolve(0)
        })
		
    }
    confirmAction = async (type) => {
        if(type === 'startSession')
        {
            await this.updateQueue(false)
            this.setState({popup: {show: true, 
                type: type, 
                title: 'Done Importing?', 
                message: 'You\'ve added ' + this.state.queue.length + ' songs to the \
                 queue. Do you want to start the TrnTable session or keep importing songs? (Note: \
                 you can still add songs once the session has started.)',
                accept: 'Start Session',
                deny: 'Continue Importing',
                onAccept: this.startSession,
				onDeny: this.closePopup,
				close: this.closePopup,
              }})
        }
            
    }

    displayResults = async (query, data) => {

        await this.updateQueue(false)
        const tracks = parseData('songs', data.tracks)
        const playlists = parseData('playlist', data.playlists)
        const albums = parseData('albums', data.albums)
        const artists = parseData('artists', data.artists)

        this.setState({search: {tracks: tracks, 
                                playlists: playlists, 
                                albums: albums, 
                                artists: artists,
                                query: query}, 
                      view: 'search'})


    }

    startSession = () => {
        this.props.changePage('dashboard', this.state.queue)
    }

    closePopup = () => {
        this.setState({popup: {show: false}})
	}

    showLibrary = async (type) => {
		await this.updateQueue(false)

        if(type === 'songs'){
            
            if(this.state.totalSavedSongs === null  || this.state.totalSavedSongs > this.state.savedSongsOffset)
            {
                this.setState({view: 'loading'})
                this.props.apiRef.getMySavedTracks({offset: this.state.savedSongsOffset, limit:50})
                .then(data =>{
                    this.setState({userSavedSongs: parseData(type, data), 
                        savedSongsOffset: this.savedSongsOffset+50, view:'songs', totalSavedSongs: data.total})
                    
                })
                .catch(err => {
                    if(err.status === 401){
                        this.props.updateToken()
                            .then(this.showLibrary(type))
                    }
                }) 
            }
            this.setState({view: 'songs'})
            
                    

        }
        else if (type === 'playlist'){
            
            if (this.state.totalSavedPlaylist === null || this.state.totalSavedPlaylist > this.state.playlistOffset){
                this.setState({view: 'loading'})
                this.props.apiRef.getUserPlaylists({offset: this.state.playlistOffset, limit:50})
                                .then(data =>{
                                    
                                    this.setState({userPlaylists: parseData(type, data), 
                                        playlistOffset: this.playlistOffset+50,view:'playlist',
                                        totalSavedPlaylist:data.total}
                                    )
                                })
                                .catch(err => {
                                    if(err.status === 401){
                                        this.props.updateToken()
                                            .then(this.showLibrary(type))
                                    }
                                }) 
                }
                this.setState({view: 'playlist'})
                                
        }
        else if (type === 'albums'){
            
            if (this.state.totalSavedAlbums === null || this.state.totalSavedAlbums > this.state.albumOffset) { //albums
                this.setState({view:'loading'})
                this.props.apiRef.getMySavedAlbums({offset: this.state.albumOffset, limit:50})
                                .then(data =>{
                                    this.setState({userAlbums: parseData(type, data), view:'albums',
                                        albumOffset: this.albumOffset+50, totalSavedAlbums: data.total}
                                    )
                                })
                                .catch(err => {
                                    if(err.status === 401){
                                        this.props.updateToken()
                                            .then(this.showLibrary(type))
                                    }
                                }) 
                                    
            }
            this.setState({view: 'albums'})
        }
    }

	
	//create new function for repeated blocks in show Queue
	//only change view if it is being called by queue button press
	copySelectedTracksToQueue = async (allTracks,selectedTracks) => {
		var queue = []
		var updatedQueue = this.state.queue.slice()
		allTracks.forEach((track, indexVal) =>{
			if(selectedTracks.indexOf(indexVal) !== -1){
				if(!isAlreadyInQueue(this.state.queue, track))
					queue.push(Object.assign(track))
			}
				
		})
		updatedQueue.push(...queue)
		await this.setState({tracksToAdd: [], queue: updatedQueue})
	}



    toggleSidebar = () => {
        this.setState({showSidebar: !this.state.showSidebar})
    }
    render() {

		const {popup, 
				view, 
				showSidebar, 
				queue, 
				userSavedSongs, 
				userPlaylists,
				 userAlbums, 
				currentAlbum, 
                currentPlaylist,
                search} = this.state
        const { roomCode } = this.props

        var emptyMessage = view === 'queue' ? 
                            'Added songs will show up here' : 'No saved ' + this.state.view
        var list = []
        if (view === 'queue') 
            list = queue
        else if(view === 'songs') 
            list = userSavedSongs
        else if(view === 'playlist')
            list = userPlaylists
        else if (view === 'albums')
            list = userAlbums
        else if (view === 'loading')
            emptyMessage = <LoadingIcon className='icon-container' id='menu-icon'/>
        else if (view === 'albumTracks')
            list = currentAlbum.tracks
        else if (view === 'playlistTracks')
            list = currentPlaylist.tracks

        var contextName = getViewDescription(view, currentPlaylist, currentAlbum)
        return (
            <div className='container-w-hostbar' id='track-import'>
                <HostBar title='Add Tracks' 
                         roomCode={this.props.roomCode}
                         icon={<StartIcon id='start-logo'  
                                onClick={() => this.confirmAction('startSession')}
                                />}
                />
                <ImportContainer
                                showQueue={this.updateQueue}
                                showLibrary={this.showLibrary} 
                                emptyMessage={emptyMessage}
                                list={list}
                                view={view}
                                showSidebar={showSidebar}
                                apiRef={this.props.apiRef}
                                toggleSidebar={this.toggleSidebar}
                                contentClick={this.showTracksFor}
                                updateTracks={this.updateTracks}
                                displayResults={this.displayResults}
								startSession={this.confirmAction}
                                searchRes={search}
                                contextName={contextName}
                />
				{popup.show && <ConfirmActionPopup popupInfo={popup}/>}
            </div> 
        )
	}
}	
export default ImportTrack