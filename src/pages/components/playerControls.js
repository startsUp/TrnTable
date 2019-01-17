import React, { Component } from 'react'
import '../../App.css'
import {ReactComponent as PlayIcon} from '../../res/images/player-play.svg'
import {ReactComponent as PauseIcon} from '../../res/images/player-pause.svg'
import {ReactComponent as NextIcon} from '../../res/images/player-next.svg'
import {ReactComponent as LikeIcon} from '../../res/images/player-like.svg'
const PlayerControls = props => (
    <div className='controls-container'>
        {props.votingEnabled &&
            <div>
            <LikeIcon className='control-icon' style={{'transform': 'rotate(180deg)'}}/>
            </div>
        }  
        <div>
            <NextIcon onClick={props.prev} className='control-icon' style={{'transform': 'rotate(180deg)'}}/>
        </div>
        <div>
            {props.playing ? 
                <PauseIcon onClick={props.togglePlay} className='control-icon' id='pause'/>
                :
                <PlayIcon onClick={props.togglePlay} className='control-icon' id='play'/>
            }
        </div> 
        <div>
            <NextIcon onClick={props.next} className='control-icon' id='next'/>
        </div>   
        {props.votingEnabled &&
            <div>
            <LikeIcon className='control-icon'/>
            </div>
        }        
    </div>
        
)
export default PlayerControls
