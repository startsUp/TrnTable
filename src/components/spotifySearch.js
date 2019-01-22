import React, { Component } from 'react'
import '../App.css'

const SearchInput = props => (
    <div className='search-container' style={props.center && {margin: '0.5em auto'}}>
        <input className='search-input' autoComplete='off' onKeyPress={(e)=>(e.key==='Enter' && props.submit())} id={props.inputID} placeholder='Search... '/>
        <div className='search-button' onClick={props.submit}>Search</div>
    </div>
)

class SpotifySearch extends Component {
    onSearch = () => {
        const query = document.getElementById('spotify-search-input').value
        if (query === "") return
        this.getSearchResults(query)
    }

    getSearchResults = (query) => {
        const {apiRef, songsOnly } = this.props

        var searchType = ['track', 'album', 'playlist', 'artist']
        if (songsOnly)
            searchType = ['track']
        apiRef.search(query, searchType)
                   .then((res)=> {
                        document.getElementById('spotify-search-input').value = ""
                        this.props.onSearchResults(query, res)
                    })
                    .catch(err => {
                        if(err.status === 401){
                            this.props.updateToken()
                                .then(this.getSearchResults(query))
                        }
                    })
    }

    render(){
        
        return(
            <SearchInput submit={this.onSearch} inputID='spotify-search-input' {...this.props}/>
        )
    }
}

export default SpotifySearch
