import React, { Component } from 'react'
import '../App.css'


const Track = props => (
    // url, albumArt.url, albumName, artists
    <div className='track-card-container'>
        <div className='track-art'>
            <img src={props.albumArtURL}/>
        </div>
        <div className='track-info'>
            <div id='track-name' className='track-info-text'>{props.trackName}</div>
            <div id='track-artists' className='track-info-text'>{props.trackArtists}</div>
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
            queue : [{trackName: Kids, trackArtists: [MGMT], albumArt: ''}]
        }
    }
    render() {
    return (
		<div className='dashboard-container'>
            <div className='dashboard-header'>
                 
            </div>
            <div className='dashboard-queue-container'>
                
            </div>
		</div> 
    )
	}
}	
export default Dashboard