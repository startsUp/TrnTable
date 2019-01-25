import React, { Component } from 'react'
import '../App.css'
import djIcon from '../res/images/dj.png'
import djIconW from '../res/images/djW.png'
import speakerIconW from '../res/images/speakersW.png'
import AppLogo from '../components/logo'
import ConfirmActionPopup from '../components/confirmPopup'
import speakerIcon from '../res/images/speakers.png'
import {DefaultHostSettings} from '../components/settings'


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
            input: {isValid: true, error: ''},
            error: '',
            popup: {show: false}
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
    getOS = () => {
        
      }
      
    isHostingPossible = () => {

        var isMobileOrTablet = this.mobileAndTabletcheck()
  
        var ua = window.navigator.userAgent.toLowerCase()
        var isSafari = ua.indexOf("safari") != -1 && !(ua.indexOf('chrome') > -1)
        return (!isMobileOrTablet && !isSafari)
    }
    mobileAndTabletcheck = () => {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }
    pickSession = (session) => {
        var roomCode = ''
        
        if(session !== this.state.sessionType)
            this.setState({sessionType: session})
        
        if(session === 'host' && this.state.error==='' && this.props.spotifyData.product === 'premium' && this.isHostingPossible()){
            roomCode = this.generateRandomString(4)
        }
        else{
            const error = 'hosting' 
            const popup = {show: true, 
                title: 'Hosting not Supported!', 
                message: 'Hosting sessions requires a spotify premium and a desktop browser (excluding safari).',
                accept: 'Okay',
                onAccept: () => this.setState({popup: {show: false}}),
                modal: true,
            }
            this.setState({error: error, popup: popup, sessionType: ''})
            return
        }
            

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
            var userJoin = {joinedTimestamp: new Date(), name: this.props.user.displayName}
            dbRef.collection('rooms')
                    .doc(roomCode)
                    .collection('users')
                    .doc(this.props.user.uid)
                    .set({joinedTimestamp: new Date(), name: this.props.user.displayName})
            this.props.setGuests(userJoin)
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


    
    enterRoom = async (room) => {
        

        // check if the room exists 

        if(this.state.sessionType === 'host' && this.state.error!==''){
            if (this.state.roomCode){
                this.props.setRoomCode(this.state.roomCode, true)
                this.props.changePage('trackImport')
            }
        }
            
        else
        {
            var roomCode = room.toUpperCase()
  
            //validate with database
            this.getRoom(roomCode)
            .then(async (document) => {
                if(document.exists){
                    var tracks = await this.props.getSessionTracks(roomCode)
                    if(!tracks){
                        this.setState({
                            input: {isValid: false, 
                                    error: 'Room exists but session has not started yet.'}
                        })
                        return
                    }
                    else{
                        await this.props.setQueue(tracks)
                        await this.props.setRoomCode(roomCode, false)
                        this.props.changePage('dashboard')
                    }
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
        
        const {error, popup} = this.state

    return (
		<div className='session-container'>
            {popup.show && <ConfirmActionPopup 
            popupInfo={popup}/>}
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