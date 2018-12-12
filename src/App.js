import React, { Component } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import SessionType from './pages/session'
import './App.css'
import SpotifyWebApi from 'spotify-web-api-js'
const spotifyApi = new SpotifyWebApi()

// const spotifyApi = new SpotifyWebApi()

// const TrackCard = props => (
//     //
//     <Container onClick={() => props.addTrack(props.trackInfo.uri)}>
//         <Card>
//     <Image src={props.trackInfo.albumArt.url}/>
//     <Card.Content>
//       <Card.Header>{props.trackInfo.trackName}</Card.Header>
//       <Card.Meta>
//         <span className='date'>{props.trackInfo.albumName}</span>
//       </Card.Meta>
//       <Card.Description>{props.trackInfo.artists}</Card.Description>
//     </Card.Content>
//   </Card>
//     </Container>
           
// )

class App extends Component {
    constructor(props){
		super(props)
		const params = this.getHashParams()
		const token = params.access_token
		if (token) {
		  spotifyApi.setAccessToken(token)
        }
        console.log(token)
		this.state = {
          loggedIn: token ? true : false,
          page: token ? 'sessionType':'login',
          dbRef: this.props.dbRef
        }
        
    }
    
    getHashParams = () => {
		var hashParams = {}
		var e, r = /([^&=]+)=?([^&]*)/g,
			q = window.location.hash.substring(1)
		console.log(q)
		e = r.exec(q)
		while (e) {
		   hashParams[e[1]] = decodeURIComponent(e[2])
		   e = r.exec(q)
		}
		return hashParams
    }
    
    changePage = (page) => {
        this.setState({page: {page}})
    }
    // getHashParams() {
    //     var hashParams = {}
    //     var e, r = /([^&=]+)=?([^&]*)/g,
    //         q = window.location.hash.substring(1)
    //     e = r.exec(q)
    //     while (e) {
    //     hashParams[e[1]] = decodeURIComponent(e[2])
    //     e = r.exec(q)
    //     }
    //     return hashParams
    // }
  render() {
    var page = <Login/>
    var currentPage = this.state.page

    if(currentPage === 'sessionType') 
        page = <SessionType/>
    else if(currentPage === 'dashboard') 
        page = <Dashboard/>

    console.log(currentPage === 'dashboard')
    return (
      <div className='App'>
            {page}
      </div>
    )
  }
}

export default App