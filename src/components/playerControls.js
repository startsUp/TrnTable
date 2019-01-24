import React, { Component } from 'react'
import '../App.css'
import {ReactComponent as PlayIcon} from '../res/images/player-play.svg'
import {ReactComponent as PauseIcon} from '../res/images/player-pause.svg'
import {ReactComponent as NextIcon} from '../res/images/player-next.svg'
import {ReactComponent as LikeIcon} from '../res/images/player-like.svg'
class PlayerControls extends Component {
    constructor(props){
        super(props)
        this.state = {
            vote: {like: false, dislike: false}
        }
    }
    handleVote = async (vote) => {
        const {vote:currentVote} = this.state
        const updatedVotes = {like: !currentVote.like && vote, 
            dislike: !currentVote.dislike && !vote}

        this.props.vote(updatedVotes, currentVote)
        // window.clearTimeout(this.votingTimeout)
        // this.votingTimeout = window.setTimeout(()=>{
        //     this.props.vote(updatedVotes, currentVote)
        // }, 3000)
        await this.setState({vote:updatedVotes, update: true})

    }
    componentDidUpdate = (prevProps, prevState) => {
        if(!this.props.noVote){
            if(prevProps.track.id !== this.props.track.id)
                this.setState({vote: {like: false, dislike: false}})
        }
    }
    render(){
        const props = this.props
        const {vote} = this.state
        return(
<div className='controls-container' id={props.votingEnabled ? 'guest-controls-container': 'c'}>
        {props.votingEnabled &&
            <a>
            <LikeIcon className='vote-icon' id={vote.dislike ? 'vote-select' : 'c'} onClick={() => this.handleVote(false)} style={{'transform': 'rotate(180deg)'}}/>
            </a>
        }  
        {!props.votingEnabled &&
        <a>
            <NextIcon onClick={props.prev} className='control-icon' style={{'transform': 'rotate(180deg)'}}/>
        </a>
        }
        {!props.votingEnabled &&
        <a>
            {props.playing ? 
                <PauseIcon onClick={props.togglePlay} className='control-icon' id='pause'/>
                :
                <PlayIcon onClick={props.togglePlay} className='control-icon' id='play'/>
            }
        </a> 
        }
        {!props.votingEnabled &&
        <a>
            <NextIcon onClick={props.next} className='control-icon' id='next'/>
        </a> 
        }  
        {props.votingEnabled &&
            <a>
            <LikeIcon className='vote-icon' id={vote.like ? 'vote-select' : 'c'} onClick={() => this.handleVote(true)}/>
            </a>
        }        
    </div>
        )
    }
    
      
}
export default PlayerControls
