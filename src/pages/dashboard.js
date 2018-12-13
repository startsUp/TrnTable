import React, { Component } from 'react'
import '../App.css'
import appIcon from '../res/images/logo.webp'


const Track = props => (
    // url, albumArt.url, albumName, artists
    <div className='track-card-container'>
        <div className='track-art'>
            <img src={props.albumArtURL}/>
        </div>
        <div className='track-info'>
            <div id='track-name' className='track-info-text'>{props.name}</div>
            <div id='track-artists' className='track-info-text'>{props.artist}</div>
        </div>
    </div>
     
)

const TrackQueue = props => {
    return(<div></div>)

}

class Dashboard extends Component {
    constructor(props){
        super(props)
        this.state = {
            queue : [{id: '6Z8R6UsFuGXGtiIxiD8ISb',name: 'Safe and Sound', artist: 'Capital Cities', albumArt: 'https://i.scdn.co/image/5b5b97a268f39426c8bf1ada36606e6fcbb317eb'}]
        }
    }
    render() {
        const tracks = this.state.queue.map((track) => (
                <Track key={track.id} name={track.name} artist={track.artist} albumArtURL={track.albumArt}/>
            ))

        return (
            <div className='dashboard-container'>
                <div className='dashboard-header'>
                    <div>
                        {appIcon}
                    </div>
                    <div>
                        {this.props.user.name}'s Session
                    </div>
                </div>
                <div className='dashboard-queue-container'>
                    {tracks}
                </div>
            </div> 
        )
	}
}	
export default Dashboard