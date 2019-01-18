import React, { Component } from 'react'
import {ReactComponent as HomeIcon} from '../../res/images/dashboard-home.svg'
import '../../App.css'
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
                <List dark emptyMessage='No Tracks in Queue' 
                      items={props.list}
                      contentClick={props.contentClick}
                      selectable={false}/>
        }
        {props.view === 'Add Tracks' &&
            <SpotifySearch center apiRef={props.apiRef} onSearchResults={props.onSearchResults}/>
        }
        {props.searchRes && <SpotifySearchResults small data={props.searchRes}/>}
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