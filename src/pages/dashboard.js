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
        {props.added ? 
            <div onClick={props.remove}> <div>➖</div> </div> : 
            <div onClick={props.add}> <div>➕</div> </div>
        }
    </div>
     
)


const TrackQueue = props => {
    return(<div></div>)

}

class Dashboard extends Component {
    constructor(props){
        super(props)
        this.state = {
            queue : [{id: '6Z8R6UsFuGXGtiIxiD8ISb',name: 'Safe and Sound', artist: 'Capital Cities', albumArt: 'https://i.scdn.co/image/5b5b97a268f39426c8bf1ada36606e6fcbb317eb'}],
            playlistRef: null,
            fetchTimestamp: null, //do (= new Date()) after initial fetch of queue
            unsubscribe: null,
            tracks: []
        }
    }

    

    componentDidMount = () => {

       // var getFirstFetch = this.getTracks()
        var unsubscribe = this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').orderBy('addedTimestamp').startAt(this.state.fetchTimestamp)
                .onSnapshot((snapshot) => {
                    console.log(snapshot.docs)

                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                var doc = change.doc
                                let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                                if (source === 'Server') {
                                    this.setState({ //update local queue
                                        tracks: [] 
                                    })
                                } else {
                                // Do nothing, it's a local update so ignore it
                                }
                                
                            }   
                        })
                    })
        this.setState({unsubscribe: unsubscribe})
    }

    getTracks = () => {
        return this.props.dbRef.collection('tracksInRoom').doc(this.props.roomCode).collection('tracks').get()
    }
    componentWillUnmount = () => {
        this.state.unsubscribe()
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