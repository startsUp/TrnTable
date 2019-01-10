import React, { Component } from 'react'
import '../../App.css'
import {ReactComponent as LikeIcon} from '../../res/images/player-like.svg'
class GuestPlayer extends Component {
    constructor(props) {
        super(props)
        // set the initial state
        this.state = {
            token: this.props.accessToken,
            user: this.props.user,
            error: "",
            track: {id: "",
                    trackName: "",
                    artistName: "",
                    albumName: "",
                    artURL:"",},
        }
    }
    render(){
        return(
            <div>

            </div>
        )
    }
}

export default GuestPlayer
