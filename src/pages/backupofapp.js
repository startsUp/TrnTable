import React, { Component } from 'react';
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
import { Input, Header, Form, Container, Card, Image } from 'semantic-ui-react'


const spotifyApi = new SpotifyWebApi();

const TrackCard = props => (
    //
    <Container onClick={() => props.addTrack(props.trackInfo.uri)}>
        <Card>
    <Image src={props.trackInfo.albumArt.url}/>
    <Card.Content>
      <Card.Header>{props.trackInfo.trackName}</Card.Header>
      <Card.Meta>
        <span className='date'>{props.trackInfo.albumName}</span>
      </Card.Meta>
      <Card.Description>{props.trackInfo.artists}</Card.Description>
    </Card.Content>
  </Card>
    </Container>
           
)

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    console.log(params)
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      id: null,
      host: false,
      queue: [],
      
    }
  }

  componentDidMount = () => {
      spotifyApi.getMe().then((data)  => {
          this.setState({id: data.id})

        })
    
      
  }

  getSearchResult = (e) => {
        var trackName = document.getElementById('search-track').value
        console.log(trackName)


    spotifyApi.search(trackName,['track'])
        .then((response) => {
            var searchResults = []
            response.tracks.items.forEach(track => {
                console.log(track)
                searchResults.push({trackName: track.name, artists: track.artists.map(function(elem){
                    return elem.name;
                }).join(", "),
                albumArt: track.album.images[1], albumName: track.album.name, id: track.id, uri: track.uri})
            })
            this.setState({searchResults: searchResults})
            //console.log ("Song: " + song["name"] + ", Artist: " + song["artists"] + ", Album: " + song["album"]);
            
        }).catch(err => console.log(err))
      
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  handleAddTrack = (e) => {
      this.setState({queue: [...this.state.queue, e]})
  }
  
  render() {

    var searchResults = null
    if(this.state.searchResults)
    {
        searchResults = this.state.searchResults.map((track) =>{
            console.log(track)
        return (<TrackCard key={track.id} trackInfo={track} addTrack={this.handleAddTrack}/>)
    
        })
    }
    return (
      <div className="App">
        <a href='http://localhost:8888' > Login to Spotify </a>
        <div>
          Now Playing: { this.state.nowPlaying.name }
        </div>
        <div>
          <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
        </div>
        <Form onSubmit={this.getSearchResult}>
            <Input id='search-track' icon='search' placeholder='Search...' />
        </Form>
        {searchResults}
        { this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        }
      </div>
    );
  }
}

export default App;