import React, { Component } from 'react'
import '../App.css'
import djIcon from '../res/images/dj.webp'
import appIcon from '../res/images/logo.webp'
import speakerIcon from '../res/images/speakers.webp'
const Divider = props => {
    return(<div className='divider'/>)
}

class SessionType extends Component {
    constructor(){
        super()
        this.state = {
            sessionType: null, 
            roomCode: null,
        }
    }
    pickSession = (session) => {
        
        this.setState({sessionType: session})
        //async call
        //update state with room code
    }

    render() {
    return (
		<div className='session-container'>
            <div className='session-header'>
                <div className='session-title'>
                    <div><img className='header-logo' src={appIcon}/></div>
                    <div className='header-title'>TrnTable</div>
                </div>
                <div id='session-info'> I would like to ...</div>
            </div>
            <div className='session-types'>
                <div className='session-types-card' onClick={() => this.pickSession('host')}>
                    <div className='card-title'>
                        Host a session
                    </div>
                    <Divider/>
                    <div className='card-info'>
                        Your crew can join a room and request some bumpin' music!
                    </div>
                    <div><img src={djIcon}/></div>
                </div>
                <div className='session-types-card' onClick={() => this.pickSession('join')}>
                    <div className='card-title'>
                        Join a session
                    </div>
                    <Divider/>
                    <div className='card-info'>
                        Join your crew and request some bumpin' music to liven up the party!   
                    </div>
                    <div><img src={speakerIcon}/></div>

                </div>
            </div> 
            
		</div> 
    )
	}
}	
export default SessionType