import React, { Component } from 'react'
import '../../App.css'
import './components.css'


export const DefaultHostSettings = {
    maxRequestPerUsers: {id: 's1',desc: 'Maximum number of tracks a Guest can request.', 
                        type: 'dropdown', 
                        options: [5, 10, 20, 30], 
                        default: 10,
                        value: 10},
    guests: {id: 's2',desc: 'Maximum Users that can join your session.', 
                type: 'input',
                inputType: 'number', 
                min: 5,
                max: 300,  
                value: 50,
                default: 50},
    keepSpotifyPlaylist: {id: 's3', desc: 'Delete the Session\'s Playlist from my spotify \
                                 account when I end the session.',
                          type: 'boolean',
                          value: false,
                          default: false}
}

export const newSettings = (settings) => {
    return {
    maxRequestPerUsers: {id: 's1',desc: 'Maximum number of tracks a Guest can request.', 
                        type: 'dropdown', 
                        options: [5, 10, 20, 30],
                        value: settings.maxRequestPerUsers.value, 
                        default: 10},
    guests: {id: 's2',desc: 'Maximum Users that can join your session.', 
                type: 'input',
                inputType: 'number', 
                min: 5,
                max: 300,  
                value: settings.guests.value,
                default: 50},
    keepSpotifyPlaylist: {id: 's3', desc: 'Delete the Session\'s Playlist from my spotify \
                                 account when I end the session.',
                          type: 'boolean',
                          value: settings.keepSpotifyPlaylist.value,
                          default: false}
    }
}

const InputSetting = props => (
    <div className='setting-list-item'>
        <div className='setting-desc'>
            {props.setting.desc}
        </div>
        <div>
            {props.setting.inputType === 'number' && 
            <input id='input-setting' type="number" 
                min={props.setting.min} placeholder={props.setting.value} 
                max={props.setting.max} step="5"/>
            }
        </div>
    </div>
)
class BoolSetting extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: this.props.setting.value
        }
    }
    handleChange = (event) =>{
        this.setState({value: event.target.value})
    }
    render(){
        const {setting} = this.props
        return(
            <div className='setting-list-item'>
            <div className='setting-desc'>
                {setting.desc}
            </div>
            <div>
                <label className="switch">
                    <input type="checkbox" defaultChecked={setting.value}/>
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
        )
    }
}

class DropdownSetting extends Component{
    constructor(props){
        super(props)
        this.state = {
            value: this.props.setting.value
        }
    }
    handleChange = (event) =>{
        this.setState({value: event.target.value})
    }
    render(){
        const {setting} = this.props
        return(
            <div className='setting-list-item'>
                <div className='setting-desc'>
                    {setting.desc}
                </div>
                <div>
                <select id='dropdown-select' value={this.state.value} onChange={this.handleChange}>
                    {setting.options.map((val,index)=>{
                        return(<option key={index}>{val}</option>)})
                    }
                </select>
                </div>

            </div>  
        )
    }
}

const settingComponent = (setting) => {
    console.log(setting)
    if(setting.type === 'dropdown')
        return(<DropdownSetting key={setting.id} setting={setting}/>)
    else if(setting.type === 'boolean')
        return(<BoolSetting key={setting.id} setting={setting}/>)
    else
        return(<InputSetting key={setting.id} setting={setting}/>)
}

const Settings = props => (
    <div className='settings-container'>
        <div className='settings-window'>
            <div className='settings'>
                <div className='sidebar-context-title' id='context-title' style={{paddingTop: '1em'}}>
                    Settings
                </div>
                <div className='settings-list'>
                        {   
                            Object.values(props.settings).map((setting)=>{
                                return(settingComponent(setting))
                            })
                        }
                </div>
                <div className='list-showmore' id='setting-end-button' onClick={props.endSession}>
                    End Session
                </div>
            </div>
        </div>
    </div>
)
export default Settings


