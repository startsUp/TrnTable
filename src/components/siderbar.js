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
                <List dark play selectable emptyMessage='No Songs in Queue' 
                      items={props.list}
                      contentClick={props.contentClick}
                      onPlay={props.onPlay}/>
        }
        {props.view === 'Song Requests' && 
                <List dark selectable emptyMessage='No Song Requests yet' 
                      items={props.list}
                      contentClick={props.contentClick}
                      />
        }
        {props.view === 'Add Songs' &&
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
        </div> 
    </div>
        
)
export default DashboardSidebar