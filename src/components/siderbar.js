import React, { Component } from 'react'
import {ReactComponent as HomeIcon} from '../res/images/dashboard-home.svg'
import '../App.css'
import List from './list'
import SpotifySearch from './spotifySearch'
import SpotifySearchResults from './spotifySearchResults'

const DashboardSidebar = props => (
    <div className='dashboard-sidebar'>
        <HomeIcon className='home-icon' id='sidebar-home-icon' 
                    onClick={() => props.show('Home')}/>
        <div className='options-container'>
        {props.view !== 'Home' && <div className='sidebar-context-title'>{props.view}</div>}
        {props.view === 'Queue' && 
                <List dark play={props.host} selectable={props.host} emptyMessage='No Songs in Queue' 
                      items={props.list}
                      contentClick={props.contentClick}
                      onPlay={props.onPlay}/>
        }
        {props.view === 'Song Requests' && 
                <List dark selectable={props.host} emptyMessage='No Song Requests yet' 
                      type='requests'
                      items={props.list}
                      contentClick={props.contentClick}
                      {...props}
                      />
        }
        {(props.view === 'Add Songs' || props.view === 'Request Songs') &&
            <SpotifySearch songsOnly center padded apiRef={props.apiRef} onSearchResults={props.onSearchResults}/>
        }
        {props.searchRes && <SpotifySearchResults songsOnly small query={props.searchRes.query} data={props.searchRes} {...props}/>}
        {props.view === 'Home' && props.options.map((option) =>{
            return(
                <div key={option.name.trim()} className='options' onClick={() => props.show(option.name)}>
                    {option.name}
                </div>
            )
        })}
        {props.view !== 'Song Requests' && props.tracksToAdd && 
            <div className='list-showmore' style={{margin: 'auto',fontSize: '0.8em', width: '11em'}}
                                    onClick={props.addTracks}>
                {props.host ? 'Add Selected Songs' : 'Request Selected Songs'}
            </div>
        }
        </div> 
    </div>
        
)
export default DashboardSidebar