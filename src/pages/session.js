import React, { Component } from 'react'
import '../App.css'
import djIcon from '../res/images/dj.png'
import djIconW from '../res/images/djW.png'
import speakerIconW from '../res/images/speakersW.png'
import AppLogo from './components/logo'
import speakerIcon from '../res/images/speakers.png'
import {DefaultHostSettings} from './components/settings'


const Divider = props => {
    return(<div className='divider'/>)
}

const RoomCodeCard = props => (
    <div className='room-card'>
        <div id='room-code-card'>
            <div className='card-icon-container'><img className='room-icon' src={props.icon}/></div>
            <div className='room-card-title'>
                {props.cardTitle}
            </div>
          
            {props.id==='host' ?
                <input id='room-code-input' value={props.roomCode} readOnly/>:
                <input style={props.inputID ? {}:{'border': '2px solid red'}} placeholder='...' id='room-code-input' onKeyPress={props.onEnter} maxLength='4'/>
            }
            
            <div id={props.inputID ? '' : 'room-text-error'} className='room-text-tip'> {props.inputID ? props.cardInfo : props.error} </div>
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
                <div className='card-info'>
                    Your crew can join a room and request some bumpin' music!
                </div>
                <div><img className='card-icon' src={djIcon}/></div>
            </div>
            <div className='session-types-card' onClick={() => props.pickSession('join')}>
                <div className='card-title'>
                    Join a session
                </div>
                <div className='card-info'>
                    Join your crew and request some bumpin' music to liven up the party!   
                </div>
                <div><img className='card-icon' src={speakerIcon}/></div>

            </div>
        </div> 
)
class SessionType extends Component {
    constructor(props){
        super(props)
        this.state = {
            sessionType: null, 
            roomCode: null,
            input: {isValid: true, error: ''}
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
        var roomCode = ''
        
        if(session !== this.state.sessionType)
            this.setState({sessionType: session})
            
        if(session === 'host') 
            roomCode = this.generateRandomString(4)
        else
            return

        //update state with room code
        this.getRoom(roomCode)
            .then((document) => {
                if(document.exists)
                    this.pickSession(session)
                else
                    this.createRoom(roomCode)
            })
            .catch((err) => console.log(err))
    }

    createRoom = (roomCode) => {
        //set state to show the generated room code
        this.setState({roomCode:roomCode})
        //initiate room in firestore
        var dbRef = this.props.dbRef
        dbRef.collection('rooms').doc(roomCode).set({
            createdTimestamp: new Date(),
            settings: DefaultHostSettings
        })
        .then((snapshot) => {
            dbRef.collection('rooms')
                    .doc(roomCode)
                    .collection('users')
                    .doc(this.props.user.uid)
                    .set({joinedTimestamp: new Date()})
            
        })

    }

    getRoom = (roomCode) => {
        return this.props.dbRef.collection('rooms').doc(roomCode).get()
    }

    validateInput = () => {
        var input = document.getElementById('room-code-input').value
    
        if(input.length < 4)
        {
            this.setState({
                input: {isValid: false, 
                        error: 'Room code should be 4 digits❗'}
            })
        }
        else if (!(/^[a-zA-Z0-9]+$/.test(input)))
        {
            this.setState({
                input: {isValid: false, 
                        error: 'Room should only have letters and numbers❗'}
            })
        }
        else 
            this.enterRoom(input)
    }



    enterRoom = (roomCode) => {
        

        // check if the room exists 

        if(this.state.sessionType === 'host'){
            this.props.setRoomCode(this.state.roomCode)
            this.props.changePage('trackImport')
        }
            
        else
        {
       
            
            //validate with database
            this.getRoom(roomCode)
            .then((document) => {
                if(document.exists){
                    this.props.setRoomCode(roomCode)
                    this.props.changePage('dashboard')
                }
                    
                else {
                    
                    this.setState({
                        input: {isValid: false, 
                                error: 'Room does not exist❗'}
                    })
                }
            })
            .catch((err) => console.log(err))
            
        }
            
        
    }

    inputSubmit = (e) => {
        if (e.key === 'Enter') this.validateInput()
    }



    render() {
        console.log(this.props.user)
        var card = null
        var headerInfo = null
        if(this.state.sessionType){
            var icon  = this.state.sessionType==='host' ? djIconW : speakerIconW
            var title = this.state.sessionType==='host' ? 'Here\'s your room code' : 'Enter the session code'
            var info = this.state.sessionType==='host' ? 'Give this code to your friends to join your session.' : 'You can get this code from the host.'
            var buttonText = this.state.sessionType==='host' ? 'Start' : 'Join'
            var click = this.state.sessionType==='host' ? this.enterRoom : this.validateInput
            card = <RoomCodeCard id={this.state.sessionType} roomCode={this.state.roomCode}  
                    cardTitle={title} cardInfo={info} icon={icon} buttonText={buttonText} 
                    onEnter={this.inputSubmit} inputID={this.state.input.isValid} onClick={click}
                    error={this.state.input.error}/>
        }
            
        else{
            card = <SessionCards pickSession={this.pickSession}/>
            // headerInfo = <div id='session-info'> I would like to ...</div>
        }
            

    return (
		<div className='session-container'>
            <div className='session-header'>
                <div className='session-title'>
                    <div><AppLogo styleName='session-logo'/></div>
                    <div className='header-title'>TrnTable</div>
                </div>
            </div>
            {headerInfo}
            {card}
		</div> 
    )
	}
}	
export default SessionType