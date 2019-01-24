import React, { Component } from 'react'
import '../App.css'
import List from './list'

class SpotifySearchResults extends Component {

    componentWillUnmount = () => {
        
    }
    render(){
        var emptyMessage = 'No results'
        const { tracks, albums, playlists, query } = this.props.data
        return(
            <div className={this.props.small ? 'dashboard-search': 'search-results-container'} id='spotify-results-container'>
                <div className='result-container'>
                    <div className='search-result-title'>Songs</div>
                    <List selectable  id='search-result-songs' emptyMessage={emptyMessage} 
                         items={tracks} query={query}
                        type='songs'  itemsToShow={this.props.songsOnly ? 5:3} {...this.props}/>
                </div>
                {!this.props.songsOnly &&
                <div className='result-container'>
                    <div className='search-result-title'>Albums</div>
                    <List id='search-result-albums' emptyMessage={emptyMessage} 
                         items={albums} query={query}
                        type='albums' itemsToShow={3} {...this.props}/>
                </div>
                }
                {!this.props.songsOnly &&
                <div className='result-container'>
                    <div className='search-result-title'>Playlists</div>
                    <List id='search-result-playlist' emptyMessage={emptyMessage} 
                          items={playlists} query={query}
                        type='playlist'  itemsToShow={3} {...this.props}/>
                </div>
                }
               
                {/* <div className='result-container'>
                    <div className='search-result-title'>Artists</div>
                    <List  id='search-result-artists' emptyMessage={emptyMessage} 
                         contentClick={this.props.contentClick} items={artists} query={query}
                        type='artist' updateTracks={this.props.updateTracks} itemsToShow={3}/>
                </div>                 */}
            </div>
        )
    }
}

export default SpotifySearchResults
