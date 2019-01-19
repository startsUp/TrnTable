import React, { Component } from 'react'
import '../../App.css'
import List from './list'

class SpotifySearchResults extends Component {

    render(){
        var emptyMessage = 'No results'
        const { tracks, albums, playlists, artists, query } = this.props.data
        return(
            <div className={this.props.small ? 'dashboard-search': 'search-results-container'} id='spotify-results-container'>
                <div className='result-container'>
                    <div className='search-result-title'>Songs</div>
                    <List selectable  id='search-result-songs' emptyMessage={emptyMessage} 
                        contentClick={this.props.contentClick} items={tracks} query={query}
                        type='songs' updateTracks={this.props.updateTracks} itemsToShow={3} />
                </div>
                <div className='result-container'>
                    <div className='search-result-title'>Albums</div>
                    <List id='search-result-albums' emptyMessage={emptyMessage} 
                        contentClick={this.props.contentClick}  items={albums} query={query}
                        type='albums' updateTracks={this.props.updateTracks} itemsToShow={3}/>
                </div>
                <div className='result-container'>
                    <div className='search-result-title'>Playlists</div>
                    <List id='search-result-playlist' emptyMessage={emptyMessage} 
                         contentClick={this.props.contentClick}  items={playlists} query={query}
                        type='playlist' updateTracks={this.props.updateTracks} itemsToShow={3}/>
                </div>
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
