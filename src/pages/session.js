import React, { Component } from 'react'
import '../App.css'
import djIcon from '../res/images/dj.webp'
import djIconW from '../res/images/djW.webp'
import speakerIconW from '../res/images/speakersW.webp'
import appIcon from '../res/images/logo.webp'
import speakerIcon from '../res/images/speakers.webp'


const Divider = props => {
    return(<div className='divider'/>)
}

const RoomCodeCard = props => (
    <div className='room-card'>
        <div id='room-code-card'>
            <div><img src={props.icon}/></div>
            <div className='room-card-title'>
                {props.cardTitle}
            </div>
            {props.id==='host' ?
                <input className='room-code-input' value={props.roomCode} readOnly/>:
                <input id={props.inputID? '':'input-invalid'} className='room-code-input'  onKeyPress={props.onEnter} maxLength='4'/>
            }
            <div id='room-text-tip'> {props.cardInfo}</div>
            <a id='continue-button' className='button-container' onClick={props.onClick}>
                <span id='spotify-button'>
                    Let's Get This Party Started
                </span>
            </a>
            
        </div>
    </div>
)
const SessionCards = props => (
    <div className='session-types'>
            <div className='session-types-card' onClick={() => props.pickSession('host')}>
                <div className='card-title'>
                    Host a session
                </div>
                <Divider/>
                <div className='card-info'>
                    Your crew can join a room and request some bumpin' music!
                </div>
                <div><img src={djIcon}/></div>
            </div>
            <div className='session-types-card' onClick={() => props.pickSession('join')}>
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
)
class SessionType extends Component {
    constructor(){
        super()
        this.state = {
            sessionType: null, 
            roomCode: null,
            isInputValid: true,
        }
    }
    
    generateRandomString = (length) => {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      
        for (var i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    pickSession = (session) => {
        console.log(session)
        var roomCode = ''
        if(session === 'host') roomCode = this.generateRandomString(4)

        
        this.setState({sessionType: session, roomCode: roomCode})
        //update state with room code
    }

    validateInput = (input) => {
        if (input.length === 4) this.enterRoom(input)
        else this.setState({isInputValid: false})
    }
    enterRoom = (roomCode = this.state.roomCode) => {
        console.log(roomCode)
    }

    inputSubmit = (e) => {
        if (e.key === 'Enter') this.validateInput(e.target.value)
    }
    render() {
        var card = null
        var headerInfo = null
        if(this.state.sessionType){
            var icon  = this.state.sessionType==='host' ? djIconW : speakerIconW
            var title = this.state.sessionType==='host' ? 'Here\'s your room code' : 'Enter the session code'
            var info = this.state.sessionType==='host' ? 'Give this code to your friends to join your session.' : 'You can get this code from the host.'
            var buttonText = this.state.sessionType==='host' ? 'Start' : 'Join'
            card = <RoomCodeCard id={this.state.sessionType} roomCode={this.state.roomCode}  
                    cardTitle={title} cardInfo={info} icon={icon} buttonText={buttonText} 
                    onEnter={this.inputSubmit} inputID={this.state.isInputValid} onClick={this.enterRoom}/>
        }
            
        else{
            card = <SessionCards pickSession={this.pickSession}/>
            headerInfo = <div id='session-info'> I would like to ...</div>
        }
            

    return (
		<div className='session-container'>
            <div className='session-header'>
                <div className='session-title'>
                    <div><img className='header-logo' src={appIcon}/></div>
                    <div className='header-title'>TrnTable</div>
                </div>
                {headerInfo}
            </div>
            {card}
		</div> 
    )
	}
}	
export default SessionType